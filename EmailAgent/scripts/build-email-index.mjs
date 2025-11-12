#!/usr/bin/env node
import { createWriteStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listMarkdownFiles, parseEmailFile } from './utils/email-utils.mjs';
import { classifyEmail } from './utils/style-classifier.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DEFAULT_EMAIL_DIR = path.resolve(projectRoot, '../../EmailsAnonymize/EmailsAnonymous_anonymized');
const OUTPUT_DIR = path.resolve(projectRoot, 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'email_index.jsonl');
const DEFAULT_MODEL = 'mxbai-embed-large';
const DEFAULT_ENDPOINT = 'http://localhost:11434';
const MAX_EMBED_CHARS = 4000;

const args = parseArgs(process.argv.slice(2));
const emailsDir = path.resolve(args.input ?? DEFAULT_EMAIL_DIR);
const model = args.model ?? DEFAULT_MODEL;
const endpoint = args.endpoint ?? DEFAULT_ENDPOINT;
const limit = args.limit ? Number(args.limit) : undefined;
const authoredOnly = args.authored === 'true';

async function main() {
  await assertOllamaAvailable(endpoint);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const stream = createWriteStream(OUTPUT_FILE, { flags: 'w' });

  const files = await listMarkdownFiles(emailsDir);
  let processed = 0;
  let embedded = 0;

  for (const file of files) {
    if (limit && processed >= limit) {
      break;
    }

    const email = await parseEmailFile(file);
    if (!email) {
      continue;
    }

    if (authoredOnly && !email.from?.toLowerCase().includes('klarmann')) {
      continue;
    }

    const normalizedText = buildEmbedText(email);
    if (!normalizedText) {
      continue;
    }

    processed += 1;

    try {
      const embedding = await embedText(normalizedText, { endpoint, model });
      embedded += 1;
      const record = createRecord(email, embedding, normalizedText);
      stream.write(`${JSON.stringify(record)}\n`);
    } catch (error) {
      console.warn(`Embedding failed for ${email.id}: ${error.message}`);
    }

    if (processed % 50 === 0) {
      console.log(`Processed ${processed} emails (${embedded} embedded)...`);
    }
  }

  stream.end();
  console.log(
    `Index build complete. Embedded ${embedded} / ${processed} emails. Output: ${path.relative(projectRoot, OUTPUT_FILE)}`,
  );
}

function buildEmbedText(email) {
  const parts = [];
  if (email.subject) {
    parts.push(`Subject: ${email.subject}`);
  }
  if (email.sanitizedBody) {
    parts.push(email.sanitizedBody);
  }
  const text = parts.join('\n\n').trim();
  if (text.length === 0) {
    return undefined;
  }
  return text.length > MAX_EMBED_CHARS ? text.slice(0, MAX_EMBED_CHARS) : text;
}

function createRecord(email, embedding, text) {
  const bodyPreview = (email.sanitizedBody ?? '').replace(/\s+/g, ' ').slice(0, 280).trim();
  return {
    id: email.id,
    category: classifyEmail(email),
    direction: email.direction,
    subject: email.subject,
    date: email.rawDate ?? email.date,
    to: email.to,
    from: email.from,
    path: path.relative(projectRoot, email.path),
    embedding,
    body: email.sanitizedBody ?? '',
    preview: bodyPreview,
    textLength: text.length,
  };
}

async function embedText(input, { endpoint, model }) {
  const response = await fetch(`${endpoint}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama embed failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  if (Array.isArray(data.embedding)) {
    return data.embedding;
  }
  if (Array.isArray(data.embeddings) && Array.isArray(data.embeddings[0])) {
    return data.embeddings[0];
  }
  if (Array.isArray(data.data) && data.data[0]?.embedding) {
    return data.data[0].embedding;
  }
  throw new Error('Unexpected embed response shape');
}

async function assertOllamaAvailable(endpoint) {
  try {
    const res = await fetch(`${endpoint}/api/tags`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (error) {
    throw new Error(`Unable to reach Ollama at ${endpoint}. Please ensure Ollama is running. (${error.message})`);
  }
}

function parseArgs(rawArgs) {
  const result = {};
  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (!arg.startsWith('--')) {
      continue;
    }
    const eqIndex = arg.indexOf('=');
    if (eqIndex !== -1) {
      const key = arg.slice(2, eqIndex);
      result[key] = arg.slice(eqIndex + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = rawArgs[i + 1];
    if (next && !next.startsWith('--')) {
      result[key] = next;
      i += 1;
    } else {
      result[key] = true;
    }
  }
  return result;
}

main().catch((error) => {
  console.error('Failed to build email index:', error);
  process.exitCode = 1;
});
