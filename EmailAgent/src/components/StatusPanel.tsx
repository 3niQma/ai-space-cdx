import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material';
import type { GenerationMode, GenerationBackend } from '../types';

interface StatusPanelProps {
  anonymizationError: string | null;
  llmError: string | null;
  clipboardError: string | null;
  isGenerating: boolean;
  isAnonymized: boolean;
  apiKeyPresent: boolean;
  generationMode: GenerationMode;
  generationBackend: GenerationBackend;
}

export const StatusPanel = ({
  anonymizationError,
  llmError,
  clipboardError,
  isGenerating,
  isAnonymized,
  apiKeyPresent,
  generationMode,
  generationBackend,
}: StatusPanelProps) => {
  const backendLabel =
    generationBackend === 'openai'
      ? 'GPT-5 (OpenAI)'
      : generationBackend === 'ollama-fast'
        ? 'Ollama (lightweight model)'
        : 'Ollama (strong model)';

  const generatingMessage =
    generationMode === 'rag'
      ? `Generating response via ${backendLabel} RAG flow… embeddings + drafting might take a few seconds.`
      : `Generating response via ${backendLabel}… please wait.`;

  return (
    <Box component="section">
      <Stack spacing={2}>
        {!apiKeyPresent && generationBackend === 'openai' && (
          <Alert severity="warning" icon={<SecurityIcon />}>
            <AlertTitle>Missing API Key</AlertTitle>
            Set <code>VITE_OPENAI_API_KEY</code> inside <code>.env.local</code> to enable response generation.
          </Alert>
        )}

        {anonymizationError && (
          <Alert severity="error">
            <AlertTitle>Anonymization Error</AlertTitle>
            {anonymizationError}
          </Alert>
        )}

        {llmError && (
          <Alert severity="error">
            <AlertTitle>Generation Error</AlertTitle>
            {llmError}
          </Alert>
        )}

        {clipboardError && (
          <Alert severity="warning">
            <AlertTitle>Clipboard</AlertTitle>
            {clipboardError}
          </Alert>
        )}

        {isGenerating && (
          <Alert severity="info" icon={<InfoIcon />}>
            {generatingMessage}
          </Alert>
        )}

        {isAnonymized && (
          <Alert severity="success">
            <AlertTitle>Email Protected</AlertTitle>
            The pasted email is currently anonymized. Remember to de-anonymize the response before sending.
          </Alert>
        )}

        {!anonymizationError &&
          !llmError &&
          !isGenerating &&
          !(generationBackend === 'openai' && !apiKeyPresent) && (
            <Typography variant="body2" color="text.secondary">
              Paste an email, optionally anonymize, describe Noah&apos;s intent, then generate a response.
            </Typography>
          )}
      </Stack>
    </Box>
  );
};
