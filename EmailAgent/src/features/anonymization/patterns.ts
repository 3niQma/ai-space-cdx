import type { MappingType } from '../../types';

interface PatternConfig {
  type: MappingType;
  regex: RegExp;
  placeholderPrefix: string;
  shouldSkip?: (match: string) => boolean;
}

const PRESERVE_NAME = /Noah\s+Klarmann/i;
const greetingWords = ['Hi', 'Hello', 'Dear'];

export const PATTERN_CONFIGS: PatternConfig[] = [
  {
    type: 'company',
    placeholderPrefix: 'COMPANY',
    regex: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:Inc|LLC|Ltd|GmbH|Corp|Corporation)\b/g,
  },
  {
    type: 'name',
    placeholderPrefix: 'PERSON',
    regex: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g,
    shouldSkip: (match) => {
      const trimmed = match.trim();
      const firstWord = trimmed.split(/\s+/)[0];
      return PRESERVE_NAME.test(trimmed) || greetingWords.includes(firstWord);
    },
  },
  {
    type: 'email',
    placeholderPrefix: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    type: 'phone',
    placeholderPrefix: 'PHONE',
    regex: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  },
];

export const PRESERVED_TERMS = ['Noah Klarmann'];

export type { PatternConfig };
