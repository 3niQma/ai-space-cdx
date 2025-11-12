export interface EmailDraft {
  original: string;
  anonymized: string;
}

export interface ShortIntent {
  value: string;
  maxLength: number;
}
