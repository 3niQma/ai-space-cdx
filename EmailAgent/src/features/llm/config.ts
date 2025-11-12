export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-5';
export const DEFAULT_MAX_TOKENS = Number(import.meta.env.VITE_OPENAI_MAX_TOKENS || 600);

// Defaults approximate GPT-4o mini pricing ($0.15 / $0.60 per 1M tokens)
export const INPUT_TOKEN_COST =
  Number(import.meta.env.VITE_OPENAI_INPUT_TOKEN_COST) || 0.00000015;
export const OUTPUT_TOKEN_COST =
  Number(import.meta.env.VITE_OPENAI_OUTPUT_TOKEN_COST) || 0.0000006;
