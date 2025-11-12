import { useCallback, useState } from 'react';
import { callOpenAI, callRag, callOllamaLocalChat, searchSimilarEmails } from '../features/llm';
import { polishResponseText } from '../features/style/responsePostProcessor';
import type { LLMRequest, RagSource, TokenUsage } from '../types';

export const useLLMGeneration = () => {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [lastRequest, setLastRequest] = useState<LLMRequest | null>(null);
  const [sources, setSources] = useState<RagSource[] | null>(null);

  const buildContextBlock = (items: RagSource[]) =>
    items
      .map(
        (item, index) =>
          `Kontext ${index + 1}\nBetreff: ${item.subject ?? 'Ohne Betreff'}\nKategorie: ${item.category}\nSimilarity: ${(
            item.similarity * 100
          ).toFixed(1)}%\nInhalt:\n${item.preview ?? ''}`,
      )
      .join('\n\n');
  const mapToSource = (result: { id: string; subject: string | null; preview: string | null; category: string; similarity: number; date?: string }): RagSource => ({
    id: result.id,
    subject: result.subject,
    preview: result.preview,
    category: result.category as RagSource['category'],
    similarity: result.similarity,
    date: result.date,
  });

  const runGeneration = useCallback(
    async (request: LLMRequest) => {
      if (!request.email.trim()) {
        setError('Please paste the original email before generating.');
        return '';
      }
      if (!request.intent.trim()) {
        setError('Please provide a short response intent.');
        return '';
      }
      setIsGenerating(true);
      setError(null);
      setLastRequest(request);

      try {
        if (request.mode === 'rag') {
          if (request.backend === 'openai') {
            const searchQuery = `${request.email}\n\n${request.intent}`.slice(0, 4000);
            const { results } = await searchSimilarEmails(searchQuery, 3);
            const ragSources = results.map(mapToSource);
            const contextBlock = buildContextBlock(ragSources);
            const openAiRequest = { ...request, contextBlock };
            const result = await callOpenAI(openAiRequest);
            const polished = polishResponseText(result.text, request.styleGuidance?.closingExamples);
            setResponse(polished);
            setUsage(result.usage);
            setSources(ragSources);
            return polished;
          }
          const ragResult = await callRag(request);
          const polished = polishResponseText(ragResult.text, request.styleGuidance?.closingExamples);
          setResponse(polished);
          setUsage(ragResult.usage);
          setSources(ragResult.sources ?? null);
          return polished;
        }

        if (request.backend === 'openai') {
          const result = await callOpenAI(request);
          const polished = polishResponseText(result.text, request.styleGuidance?.closingExamples);
          setResponse(polished);
          setUsage(result.usage);
          setSources(null);
          return polished;
        }

        const localText = await callOllamaLocalChat(request);
        const polished = polishResponseText(localText, request.styleGuidance?.closingExamples);
        setResponse(polished);
        setUsage(null);
        setSources(null);
        return polished;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate response. Please try again.';
        setError(message);
        return '';
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const regenerate = useCallback(() => {
    if (!lastRequest) {
      return Promise.resolve('');
    }
    return runGeneration(lastRequest);
  }, [lastRequest, runGeneration]);

  const clearResponse = useCallback(() => {
    setResponse('');
    setUsage(null);
    setError(null);
    setSources(null);
  }, []);

  return {
    response,
    usage,
    isGenerating,
    error,
    generateResponse: runGeneration,
    regenerate,
    clearResponse,
    sources,
  };
};
