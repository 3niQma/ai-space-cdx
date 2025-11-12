import type { LLMRequest, LLMResponse, TokenUsage } from '../../types';
import {
  OPENAI_API_URL,
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODEL,
  INPUT_TOKEN_COST,
  OUTPUT_TOKEN_COST,
} from './config';
import { buildMessages } from './prompts';

interface OpenAIChoice {
  message?: {
    content?: string | null;
  };
}

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
}

interface OpenAISuccessResponse {
  choices?: OpenAIChoice[];
  usage?: OpenAIUsage;
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
  };
}

const formatUsage = (usage?: OpenAIUsage): TokenUsage | null => {
  if (!usage) return null;

  const inputTokens = usage.prompt_tokens ?? 0;
  const outputTokens = usage.completion_tokens ?? 0;
  const totalCost = inputTokens * INPUT_TOKEN_COST + outputTokens * OUTPUT_TOKEN_COST;

  return {
    inputTokens,
    outputTokens,
    totalCost: Number(totalCost.toFixed(4)),
  };
};

export const callOpenAI = async ({
  email,
  intent,
  mode,
  styleGuidance,
  contextBlock,
  language,
  enforcedSalutation,
}: LLMRequest): Promise<LLMResponse> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Set VITE_OPENAI_API_KEY in .env.local.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.3,
      messages: buildMessages({
        email,
        intent,
        mode,
        styleGuidance,
        contextBlock,
        language,
        enforcedSalutation,
      }),
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as OpenAIErrorResponse | null;
    const message = errorPayload?.error?.message ?? response.statusText;
    throw new Error(`OpenAI API error (${response.status}): ${message}`);
  }

  const data = (await response.json()) as OpenAISuccessResponse;
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';

  return {
    text,
    usage: formatUsage(data.usage),
  };
};
