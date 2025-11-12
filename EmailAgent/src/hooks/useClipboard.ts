import { useCallback, useState } from 'react';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setError('Clipboard API not available in this browser.');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy text.');
      return false;
    }
  }, []);

  return { copied, error, copy };
};
