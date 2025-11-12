import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Container,
  Paper,
  Stack,
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
} from '@mui/material';
import { AppHeader } from './components/AppHeader';
import { EmailInput } from './components/EmailInput';
import { ResponseDisplay } from './components/ResponseDisplay';
import { ShortAnswerInput } from './components/ShortAnswerInput';
import { StatusPanel } from './components/StatusPanel';
import { GenerationModeSelect } from './components/GenerationModeSelect';
import { ModelSelect } from './components/ModelSelect';
import { ThemeSelect } from './components/ThemeSelect';
import { useAnonymization } from './hooks/useAnonymization';
import { useClipboard } from './hooks/useClipboard';
import { useLLMGeneration } from './hooks/useLLMGeneration';
import { classifyAudience } from './features/style/classifier';
import { getStyleGuidance } from './features/style/styleGuidance';
import { detectLanguage, buildFormalSalutation } from './features/email/analyzeEmail';
import { getThemeByName, type ThemeName } from './theme/templates';
import type { GenerationMode, StyleCategory, LLMRequest, GenerationBackend } from './types';

function App() {
  const [originalEmail, setOriginalEmail] = useState('');
  const [shortIntent, setShortIntent] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('vanilla');
  const [generationBackend, setGenerationBackend] = useState<GenerationBackend>('openai');
  const [themeName, setThemeName] = useState<ThemeName>('midnight');

  const {
    anonymize,
    anonymizedText,
    deanonymize,
    isAnonymized,
    error: anonymizationError,
    reset: resetAnonymization,
  } = useAnonymization();
  const {
    response,
    usage,
    isGenerating,
    error: llmError,
    generateResponse,
    regenerate,
    clearResponse,
    sources,
  } = useLLMGeneration();
  const { copied, error: clipboardError, copy } = useClipboard();

  const apiKeyPresent = useMemo(() => Boolean(import.meta.env.VITE_OPENAI_API_KEY), []);

  useEffect(() => {
    setResponseText(response);
  }, [response]);

  const emailForGeneration = isAnonymized ? anonymizedText : originalEmail;
  const detectedStyleCategory = useMemo<StyleCategory | null>(() => {
    if (generationMode !== 'style') {
      return null;
    }
    const source = emailForGeneration || originalEmail;
    if (!source.trim()) {
      return null;
    }
    return classifyAudience(source);
  }, [generationMode, emailForGeneration, originalEmail]);
  const styleGuidance = useMemo(
    () => (detectedStyleCategory ? getStyleGuidance(detectedStyleCategory) : undefined),
    [detectedStyleCategory],
  );
  const detectedLanguage = useMemo(() => detectLanguage(emailForGeneration || originalEmail), [
    emailForGeneration,
    originalEmail,
  ]);
  const enforcedSalutation = useMemo(
    () => buildFormalSalutation(originalEmail),
    [originalEmail],
  );

  const handleGenerate = async () => {
    const request: LLMRequest = {
      email: emailForGeneration,
      intent: shortIntent,
      isAnonymized,
      mode: generationMode,
      backend: generationBackend,
      styleCategory: detectedStyleCategory ?? undefined,
      styleGuidance,
      language: detectedLanguage,
      enforcedSalutation,
    };
    const result = await generateResponse(request);
    if (result) {
      setResponseText(result);
      setIsEditingResponse(false);
    }
  };

  const handleRegenerate = async () => {
    const regenerated = await regenerate();
    if (regenerated) {
      setResponseText(regenerated);
      setIsEditingResponse(false);
    }
  };

  const handleDeAnonymize = () => {
    const updated = deanonymize(responseText);
    setResponseText(updated);
  };

  const handleCopy = () => {
    if (!responseText.trim()) return;
    copy(responseText);
  };

  const handleReset = () => {
    resetAnonymization();
  };

  const readyToGenerate = Boolean(emailForGeneration.trim() && shortIntent.trim());
  const styleAudienceLabel = detectedStyleCategory
    ? {
        students: 'Students (formal Sie)',
        colleagues: 'Colleagues (du)',
        industry: 'Industry/research partners',
      }[detectedStyleCategory]
    : 'Add more context to detect the audience';

  return (
    <ThemeProvider theme={getThemeByName(themeName)}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <AppHeader />

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
          <Box flex={1}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={4}>
                <EmailInput
                  value={originalEmail}
                  onChange={(value) => {
                    setOriginalEmail(value);
                    clearResponse();
                    setResponseText('');
                  }}
                  anonymizedValue={anonymizedText}
                  isAnonymized={isAnonymized}
                  onAnonymize={() => anonymize(originalEmail)}
                  onReset={handleReset}
                />
                <ShortAnswerInput value={shortIntent} onChange={setShortIntent} />
                <GenerationModeSelect value={generationMode} onChange={setGenerationMode} ragEnabled />
                <ModelSelect value={generationBackend} onChange={setGenerationBackend} />
                <ThemeSelect value={themeName} onChange={setThemeName} />
                {generationMode === 'style' && (
                  <Typography variant="body2" color="text.secondary">
                    Audience detected: {styleAudienceLabel}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerate}
                  disabled={!readyToGenerate}
                  loading={isGenerating}
                >
                  Generate Response
                </Button>
              </Stack>
            </Paper>

            <Box mt={3}>
              <StatusPanel
                anonymizationError={anonymizationError}
                llmError={llmError}
                clipboardError={clipboardError}
                isGenerating={isGenerating}
                isAnonymized={isAnonymized}
                apiKeyPresent={apiKeyPresent}
                generationMode={generationMode}
                generationBackend={generationBackend}
              />
            </Box>
          </Box>

          <Box flex={{ xs: 1, lg: 0.85 }}>
            <ResponseDisplay
              value={responseText}
              isEditing={isEditingResponse}
              onChange={setResponseText}
              onToggleEdit={() => setIsEditingResponse((prev) => !prev)}
              onCopy={handleCopy}
              copied={copied}
              onRegenerate={handleRegenerate}
              isGenerating={isGenerating}
              canDeAnonymize={isAnonymized}
              onDeAnonymize={handleDeAnonymize}
              usage={usage}
              sources={sources ?? undefined}
            />
          </Box>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
