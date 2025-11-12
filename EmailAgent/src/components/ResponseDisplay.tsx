import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import type { RagSource, TokenUsage } from '../types';

interface ResponseDisplayProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onToggleEdit: () => void;
  onCopy: () => void;
  copied: boolean;
  onRegenerate: () => void;
  isGenerating: boolean;
  canDeAnonymize: boolean;
  onDeAnonymize: () => void;
  usage: TokenUsage | null;
  sources?: RagSource[];
}

export const ResponseDisplay = ({
  value,
  isEditing,
  onChange,
  onToggleEdit,
  onCopy,
  copied,
  onRegenerate,
  isGenerating,
  canDeAnonymize,
  onDeAnonymize,
  usage,
  sources,
}: ResponseDisplayProps) => {
  const theme = useTheme();
  const hasResponse = Boolean(value.trim());

  return (
    <Paper variant="outlined" sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} mb={2}>
        <Box>
          <Typography variant="h6">Generated Response</Typography>
          <Typography variant="body2" color="text.secondary">
            Review, edit, or copy the AI-generated draft. De-anonymize before sending if required.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={isEditing ? 'Lock response' : 'Enable inline edits'}>
            <Box component="span">
              <Button
                variant={isEditing ? 'contained' : 'outlined'}
                startIcon={<EditIcon />}
                disabled={!hasResponse}
                onClick={onToggleEdit}
              >
                {isEditing ? 'Done Editing' : 'Edit'}
              </Button>
            </Box>
          </Tooltip>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <Box component="span">
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={onCopy}
                disabled={!hasResponse}
                color={copied ? 'success' : 'primary'}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </Stack>

      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        minRows={10}
        maxRows={18}
        InputProps={{ readOnly: !isEditing }}
        placeholder="Responses will appear here after generation."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={2}>
        <Button
          loading={isGenerating}
          loadingPosition="start"
          startIcon={<ReplayIcon />}
          variant="outlined"
          onClick={onRegenerate}
          disabled={!hasResponse}
        >
          Regenerate
        </Button>
        <Button
          variant="contained"
          startIcon={<LockOpenIcon />}
          disabled={!canDeAnonymize || !hasResponse}
          onClick={onDeAnonymize}
          color="secondary"
        >
          De-anonymize Response
        </Button>
      </Stack>

      {usage && (
        <Box mt={2}>
          <Typography variant="subtitle2">Usage & Cost</Typography>
          <Typography variant="body2" color="text.secondary">
            {usage.inputTokens} input tokens · {usage.outputTokens} output tokens · Estimated cost $
            {usage.totalCost.toFixed(4)}
          </Typography>
        </Box>
      )}

      {sources && sources.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2">Kontextquellen</Typography>
          <Stack spacing={1.5} mt={1}>
            {sources.map((source) => (
              <Paper key={source.id} variant="outlined" sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
                <Typography variant="body2" fontWeight={600}>
                  {source.subject || 'Ohne Betreff'} · {source.category} ·{' '}
                  {(source.similarity * 100).toFixed(1)}% Match
                </Typography>
                {source.preview && (
                  <Typography variant="body2" color="text.secondary">
                    {source.preview}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {!hasResponse && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Generate a response to enable editing, copying, and de-anonymization tools.
        </Alert>
      )}
    </Paper>
  );
};
