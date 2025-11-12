import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(process.cwd(), 'data/email_index.jsonl');
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT ?? 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'mxbai-embed-large';
const OLLAMA_MODEL_FAST = process.env.OLLAMA_MODEL_FAST ?? 'llama3.2:1b';
const OLLAMA_MODEL_STRONG = process.env.OLLAMA_MODEL_STRONG ?? 'llama3.1';
const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K ?? 3);
const MAX_CONTEXT_CHARS = Number(process.env.RAG_MAX_CONTEXT ?? 1200);

interface IndexedEmail {
  id: string;
  subject: string | null;
  preview: string | null;
  category: string;
  date?: string;
  body: string;
  embedding: Float32Array;
  norm: number;
}

interface StyleGuidancePayload {
  label?: string;
  greetingExamples?: string[];
  closingExamples?: string[];
  signatureExamples?: string[];
  pronounPreference?: string;
  toneTips?: string;
  summary?: string;
}

type Json = Record<string, unknown>;

const readJsonBody = <T = Json>(req: IncomingMessage) =>
  new Promise<T>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? (JSON.parse(data) as T) : ({} as T));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const sendJson = (res: ServerResponse, statusCode: number, payload: Json) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const parseIndexContent = (content: string): IndexedEmail[] =>
  content
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Json)
    .map((entry) => {
      const embeddingArray = Array.isArray(entry.embedding) ? (entry.embedding as number[]) : [];
      const embedding = new Float32Array(embeddingArray);
      const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
      return {
        id: String(entry.id ?? ''),
        subject: (entry.subject as string) ?? null,
        preview: (entry.preview as string) ?? null,
        category: (entry.category as string) ?? 'industry',
        date: (entry.date as string) ?? undefined,
        body: (entry.body as string) ?? '',
        embedding,
        norm: norm || 1,
      } as IndexedEmail;
    });

const cosineSimilarity = (a: Float32Array, b: Float32Array, normA: number, normB: number) => {
  if (a.length !== b.length || normA === 0 || normB === 0) {
    return 0;
  }
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
  }
  return dot / (normA * normB);
};

const embedText = async (input: string) => {
  const response = await fetch(`${OLLAMA_ENDPOINT}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embed failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { embedding?: number[]; embeddings?: number[][]; data?: { embedding?: number[] }[] };
  if (Array.isArray(data.embedding)) {
    return new Float32Array(data.embedding);
  }
  if (Array.isArray(data.embeddings) && Array.isArray(data.embeddings[0])) {
    return new Float32Array(data.embeddings[0]);
  }
  if (Array.isArray(data.data) && Array.isArray(data.data[0]?.embedding)) {
    return new Float32Array(data.data[0]?.embedding ?? []);
  }
  throw new Error('Unexpected embed response shape');
};

const resolveModel = (backend?: string) => {
  if (backend === 'ollama-strong') {
    return OLLAMA_MODEL_STRONG;
  }
  return OLLAMA_MODEL_FAST;
};

const callOllamaChat = async (model: string, systemPrompt: string, userPrompt: string) => {
  const response = await fetch(`${OLLAMA_ENDPOINT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature: 0.2 },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama chat failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { message?: { content?: string }; response?: string };
  const text = data.message?.content ?? data.response ?? '';
  return text.trim();
};

const formatStyleGuidance = (guidance?: StyleGuidancePayload) => {
  if (!guidance) {
    return '';
  }
  const parts = [
    guidance.label ? `Audience: ${guidance.label}` : undefined,
    guidance.pronounPreference
      ? `Preferred pronouns: ${guidance.pronounPreference}`
      : undefined,
    guidance.greetingExamples?.length
      ? `Use greetings such as: ${guidance.greetingExamples.join(', ')}`
      : undefined,
    guidance.closingExamples?.length
      ? `Use closings such as: ${guidance.closingExamples.join(', ')}`
      : undefined,
    guidance.signatureExamples?.length
      ? `Reference signatures like: ${guidance.signatureExamples.join(', ')}`
      : undefined,
    guidance.toneTips,
    guidance.summary,
  ].filter(Boolean);
  return parts.join('\n');
};

const buildContextBlock = (matches: { record: IndexedEmail; similarity: number }[]) =>
  matches
    .map(({ record, similarity }, index) => {
      const trimmedBody = record.body.slice(0, MAX_CONTEXT_CHARS);
      return `Context ${index + 1}
Subject: ${record.subject ?? 'Ohne Betreff'}
Category: ${record.category}
Similarity: ${(similarity * 100).toFixed(1)}%
Body:
${trimmedBody}`;
    })
    .join('\n\n');

const baseSystemPrompt =
  'You are a drafting assistant for Noah Klarmann. Craft concise, well-structured replies that mirror his tone. ' +
  'Only include a single closing line (e.g., “Beste Grüße, Noah”). Do not append signatures, meeting links, or contact blocks.';

const buildUserPrompt = (email: string, intent: string, contextBlock: string) => `Incoming email:
${email}

Response intent:
${intent}

Relevant past correspondence:
${contextBlock}

Use the context to stay consistent with prior answers. Reference specific context snippets where helpful (e.g., “Wie bereits im Workshop-Update erwähnt…”). Keep the reply in the same language as the incoming email.`;

const buildVanillaUserPrompt = (email: string, intent: string) => `Original Email:
${email}

Noah's Response Intent:
${intent}

Write the full reply in the same language as the email.`;

export const ragPlugin = (): Plugin => {
  let cachedIndex: IndexedEmail[] = [];
  let lastLoaded = 0;

  const ensureIndex = async () => {
    try {
      const stats = await fs.stat(INDEX_PATH);
      if (!lastLoaded || stats.mtimeMs !== lastLoaded) {
        const content = await fs.readFile(INDEX_PATH, 'utf8');
        cachedIndex = parseIndexContent(content);
        lastLoaded = stats.mtimeMs;
        console.info(`[rag] Loaded ${cachedIndex.length} indexed emails from ${INDEX_PATH}`);
      }
    } catch (error) {
      console.warn(`[rag] Failed to read index at ${INDEX_PATH}: ${(error as Error).message}`);
      cachedIndex = [];
    }
    return cachedIndex;
  };

  const rankMatches = (embedding: Float32Array, records: IndexedEmail[], topK: number) => {
    const queryNorm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0)) || 1;
    const scored = records.map((record) => ({
      record,
      similarity: cosineSimilarity(embedding, record.embedding, queryNorm, record.norm),
    }));
    return scored
      .filter((item) => Number.isFinite(item.similarity))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  };

  const createSearchHandler =
    () => async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      try {
        const { query, topK = DEFAULT_TOP_K } = await readJsonBody<{ query?: string; topK?: number }>(req);
        if (!query?.trim()) {
          sendJson(res, 400, { error: 'Query is required.' });
          return;
        }

        const records = await ensureIndex();
        if (!records.length) {
          sendJson(res, 503, { error: 'Email index is empty. Rebuild it before querying.' });
          return;
        }

        const embedding = await embedText(query);
        const matches = rankMatches(embedding, records, topK);

        sendJson(res, 200, {
          results: matches.map(({ record, similarity }) => ({
            id: record.id,
            subject: record.subject,
            preview: record.preview ?? record.body.slice(0, 160),
            category: record.category,
            similarity,
            date: record.date,
          })),
        });
      } catch (error) {
        sendJson(res, 500, { error: (error as Error).message });
      }
    };

  const createRagHandler =
    () => async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      try {
        const { email, intent, styleGuidance, backend, language, enforcedSalutation } = await readJsonBody<{
          email?: string;
          intent?: string;
          styleGuidance?: StyleGuidancePayload;
          backend?: string;
          language?: 'de' | 'en';
          enforcedSalutation?: string;
        }>(req);

        if (!email?.trim() || !intent?.trim()) {
          sendJson(res, 400, { error: 'Email and intent are required.' });
          return;
        }

        if (backend === 'openai') {
          sendJson(res, 400, { error: 'OpenAI backend is handled client-side for RAG.' });
          return;
        }

        const records = await ensureIndex();
        if (!records.length) {
          sendJson(res, 503, { error: 'Email index is empty. Rebuild it before querying.' });
          return;
        }

        const combinedQuery = `${email}\n\n${intent}`.slice(0, 4000);
        const embedding = await embedText(combinedQuery);
        const matches = rankMatches(embedding, records, DEFAULT_TOP_K);
        const contextBlock = buildContextBlock(matches);

        const notes: string[] = [];
        if (styleGuidance) {
          notes.push(`Follow these style guidelines:\n${formatStyleGuidance(styleGuidance)}`);
        }
        if (language) {
          notes.push(language === 'de' ? 'Respond in German only.' : 'Respond in English only.');
        }
        if (enforcedSalutation) {
          notes.push(`Begin with this salutation exactly: "${enforcedSalutation},".`);
        }
        const systemPrompt = notes.length ? `${baseSystemPrompt}\n${notes.join('\n')}` : baseSystemPrompt;
        const userPrompt = buildUserPrompt(email, intent, contextBlock);
        const model = resolveModel(backend);
        const draft = await callOllamaChat(model, systemPrompt, userPrompt);

        sendJson(res, 200, {
          text: draft,
          sources: matches.map(({ record, similarity }) => ({
            id: record.id,
            subject: record.subject,
            preview: record.preview ?? record.body.slice(0, 180),
            category: record.category,
            similarity,
            date: record.date,
          })),
        });
      } catch (error) {
        sendJson(res, 500, { error: (error as Error).message });
      }
    };

  const createChatHandler =
    () => async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      try {
        const { email, intent, styleGuidance, mode, backend, language, enforcedSalutation } = await readJsonBody<{
          email?: string;
          intent?: string;
          styleGuidance?: StyleGuidancePayload;
          mode?: string;
          backend?: string;
          language?: 'de' | 'en';
          enforcedSalutation?: string;
        }>(req);

        if (!email?.trim() || !intent?.trim()) {
          sendJson(res, 400, { error: 'Email and intent are required.' });
          return;
        }

        if (backend === 'openai') {
          sendJson(res, 400, { error: 'OpenAI backend is handled on the client.' });
          return;
        }

        const notes: string[] = [];
        if (styleGuidance && (mode === 'style' || mode === 'rag')) {
          notes.push(`Follow these style guidelines:\n${formatStyleGuidance(styleGuidance)}`);
        }
        if (language) {
          notes.push(language === 'de' ? 'Respond in German only.' : 'Respond in English only.');
        }
        if (enforcedSalutation) {
          notes.push(`Begin with this salutation exactly: "${enforcedSalutation},".`);
        }
        const systemPrompt = notes.length ? `${baseSystemPrompt}\n${notes.join('\n')}` : baseSystemPrompt;
        const userPrompt = buildVanillaUserPrompt(email, intent);
        const model = resolveModel(backend);
        const draft = await callOllamaChat(model, systemPrompt, userPrompt);

        sendJson(res, 200, { text: draft });
      } catch (error) {
        sendJson(res, 500, { error: (error as Error).message });
      }
    };

  const attach = (app: import('connect').Server) => {
    app.use('/api/search', createSearchHandler());
    app.use('/api/rag', createRagHandler());
    app.use('/api/ollama-chat', createChatHandler());
  };

  return {
    name: 'local-rag-plugin',
    apply: 'serve',
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
};
