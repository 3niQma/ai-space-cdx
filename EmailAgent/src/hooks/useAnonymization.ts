import { useCallback, useState } from 'react';
import type { AnonymizationMapping } from '../types';
import { anonymizeText, deanonymizeText } from '../features/anonymization';

export const useAnonymization = () => {
  const [anonymizedText, setAnonymizedText] = useState('');
  const [mappings, setMappings] = useState<AnonymizationMapping[]>([]);
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anonymize = useCallback((text: string) => {
    try {
      const result = anonymizeText(text);
      setAnonymizedText(result.anonymizedText);
      setMappings(result.mappings);
      setIsAnonymized(true);
      setError(null);
      return result.anonymizedText;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anonymization failed');
      return text;
    }
  }, []);

  const deanonymize = useCallback(
    (text: string) => {
      if (!isAnonymized) {
        return text;
      }
      return deanonymizeText(text, mappings);
    },
    [isAnonymized, mappings],
  );

  const reset = useCallback(() => {
    setAnonymizedText('');
    setMappings([]);
    setIsAnonymized(false);
    setError(null);
  }, []);

  return {
    anonymize,
    anonymizedText,
    deanonymize,
    isAnonymized,
    mappings,
    error,
    reset,
  };
};
