import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import AnonymizationIcon from '@mui/icons-material/Lock';
import ResetIcon from '@mui/icons-material/RestartAlt';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  anonymizedValue: string;
  isAnonymized: boolean;
  onAnonymize: () => void;
  onReset: () => void;
}

export const EmailInput = ({
  value,
  onChange,
  anonymizedValue,
  isAnonymized,
  onAnonymize,
  onReset,
}: EmailInputProps) => {
  const disabled = !value.trim();

  return (
    <Box component="section">
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
        <Box>
          <Typography variant="h6">Email Input</Typography>
          <Typography variant="body2" color="text.secondary">
            Paste the original email. Anonymization happens locally and preserves Noah Klarmann.
          </Typography>
        </Box>
        <Chip
          color={isAnonymized ? 'success' : 'default'}
          icon={<AnonymizationIcon fontSize="small" />}
          label={isAnonymized ? 'Anonymized' : 'Original'}
          variant={isAnonymized ? 'filled' : 'outlined'}
        />
      </Stack>

      <TextField
        label="Original Email"
        placeholder="Paste the full email thread…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        minRows={8}
        maxRows={16}
        helperText="Supports 2000+ characters. Use anonymization before sending to the LLM if needed."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={2}>
        <Button
          variant="contained"
          startIcon={<AnonymizationIcon />}
          onClick={onAnonymize}
          disabled={disabled}
        >
          {isAnonymized ? 'Re-run Anonymization' : 'Anonymize Email'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ResetIcon />}
          onClick={onReset}
          disabled={!isAnonymized}
        >
          Clear Anonymization
        </Button>
      </Stack>

      {isAnonymized && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Anonymized Preview
          </Typography>
          <TextField value={anonymizedValue} fullWidth multiline minRows={6} InputProps={{ readOnly: true }} />
        </Box>
      )}
    </Box>
  );
};
