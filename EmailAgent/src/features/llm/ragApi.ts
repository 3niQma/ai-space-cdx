import type { LLMRequest, LLMResponse } from '../../types';

interface RagApiResponse {
  text: string;
  sources?: LLMResponse['sources'];
}

const postJson = async <T>(url: string, payload: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Local RAG API error (${response.status}): ${details || response.statusText}`);
  }

  return (await response.json()) as T;
};

export const callRag = async ({
  email,
  intent,
  styleGuidance,
  backend,
  language,
  enforcedSalutation,
}: LLMRequest): Promise<LLMResponse> => {
  const payload = {
    email,
    intent,
    styleGuidance,
    backend,
    language,
    enforcedSalutation,
  };

  const data = await postJson<RagApiResponse>('/api/rag', payload);

  return {
    text: data.text,
    usage: null,
    sources: data.sources ?? [],
  };
};

export interface SearchResult {
  id: string;
  subject: string | null;
  preview: string | null;
  category: string;
  similarity: number;
  date?: string;
}

export const searchSimilarEmails = async (query: string, topK = 5) =>
  postJson<{ results: SearchResult[] }>('/api/search', { query, topK });

export const callOllamaLocalChat = async ({
  email,
  intent,
  mode,
  styleGuidance,
  backend,
  language,
  enforcedSalutation,
}: LLMRequest): Promise<string> => {
  const data = await postJson<{ text: string }>('/api/ollama-chat', {
    email,
    intent,
    mode,
    styleGuidance,
    backend,
    language,
    enforcedSalutation,
  });
  return data.text;
};
