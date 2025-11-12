export type MappingType = 'name' | 'email' | 'phone' | 'company';

export interface AnonymizationMapping {
  type: MappingType;
  placeholder: string;
  originalValue: string;
}

export interface AnonymizationResult {
  anonymizedText: string;
  mappings: AnonymizationMapping[];
  preservedTerms: string[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export type StyleCategory = 'students' | 'colleagues' | 'industry';

export interface StyleGuidanceEntry {
  text: string;
  count: number;
}

export interface StyleCategoryProfile {
  totalEmails: number;
  avgWords: number;
  avgSentenceLength: number;
  informalPronounRate: number;
  formalPronounRate: number;
  emojiRate: number;
  exclamationRate: number;
  topGreetings: StyleGuidanceEntry[];
  topClosings: StyleGuidanceEntry[];
  topSignatures: StyleGuidanceEntry[];
  exemplarSubjects: string[];
}

export interface StyleProfileDocument {
  generatedAt: string;
  emailSampleSize: number;
  categories: Record<StyleCategory, StyleCategoryProfile>;
}

export interface StyleGuidance {
  category: StyleCategory;
  label: string;
  greetingExamples: string[];
  closingExamples: string[];
  signatureExamples: string[];
  pronounPreference: 'formal' | 'informal' | 'mixed';
  toneTips: string;
  summary: string;
}

export type GenerationMode = 'vanilla' | 'style' | 'rag';
export type GenerationBackend = 'openai' | 'ollama-fast' | 'ollama-strong';

export interface RagSource {
  id: string;
  subject: string | null;
  preview: string | null;
  category: StyleCategory;
  similarity: number;
  date?: string;
}

export interface LLMRequest {
  email: string;
  intent: string;
  isAnonymized: boolean;
  mode: GenerationMode;
  backend: GenerationBackend;
  styleCategory?: StyleCategory;
  styleGuidance?: StyleGuidance;
  contextBlock?: string;
  language?: 'de' | 'en';
  enforcedSalutation?: string;
}

export interface LLMResponse {
  text: string;
  usage: TokenUsage | null;
  sources?: RagSource[];
}

export interface AppErrors {
  anonymizationError: string | null;
  llmError: string | null;
}

export interface ApiErrorDetails {
  status: number;
  message: string;
}
