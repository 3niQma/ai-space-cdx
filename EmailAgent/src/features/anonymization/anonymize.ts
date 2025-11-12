import type { AnonymizationMapping, AnonymizationResult } from '../../types';
import { PATTERN_CONFIGS, PRESERVED_TERMS } from './patterns';

const createPlaceholder = (prefix: string, index: number) => `[${prefix}_${index}]`;

export const anonymizeText = (text: string): AnonymizationResult => {
  if (!text.trim()) {
    return {
      anonymizedText: '',
      mappings: [],
      preservedTerms: PRESERVED_TERMS,
    };
  }

  let workingText = text;
  const mappings: AnonymizationMapping[] = [];
  const counters: Record<string, number> = {};

  PATTERN_CONFIGS.forEach((config) => {
    counters[config.placeholderPrefix] = 1;

    workingText = workingText.replace(config.regex, (match) => {
      if (config.shouldSkip?.(match)) {
        return match;
      }

      const existing = mappings.find(
        (mapping) => mapping.originalValue === match && mapping.type === config.type,
      );
      if (existing) {
        return existing.placeholder;
      }

      const placeholder = createPlaceholder(config.placeholderPrefix, counters[config.placeholderPrefix]++);
      mappings.push({
        type: config.type,
        placeholder,
        originalValue: match,
      });
      return placeholder;
    });
  });

  return {
    anonymizedText: workingText,
    mappings,
    preservedTerms: PRESERVED_TERMS,
  };
};
