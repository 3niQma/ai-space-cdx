import type { AnonymizationMapping } from '../../types';

export const deanonymizeText = (text: string, mappings: AnonymizationMapping[]): string => {
  if (!text.trim() || mappings.length === 0) {
    return text;
  }

  return mappings.reduce((acc, mapping) => {
    const placeholderRegex = new RegExp(mapping.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return acc.replace(placeholderRegex, mapping.originalValue);
  }, text);
};
