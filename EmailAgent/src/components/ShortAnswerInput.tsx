import { Box, TextField, Typography } from '@mui/material';

interface ShortAnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const DEFAULT_MAX = 200;

export const ShortAnswerInput = ({ value, onChange, maxLength = DEFAULT_MAX }: ShortAnswerInputProps) => {
  const remaining = maxLength - value.length;

  return (
    <Box component="section">
      <Typography variant="h6" gutterBottom>
        Response Intent
      </Typography>
      <TextField
        label="What should Noah convey?"
        placeholder='Examples: "accept meeting", "ask for more details", "decline politely"'
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (next.length <= maxLength) {
            onChange(next);
          }
        }}
        fullWidth
        helperText={`${remaining} characters remaining`}
      />
    </Box>
  );
};
