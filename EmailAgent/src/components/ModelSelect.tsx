import { FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GenerationBackend } from '../types';

interface ModelSelectProps {
  value: GenerationBackend;
  onChange: (backend: GenerationBackend) => void;
}

const MODEL_DESCRIPTIONS: Record<GenerationBackend, string> = {
  openai: 'GPT-5 (OpenAI cloud)',
  'ollama-fast': 'Ollama — light model (quick, less accurate)',
  'ollama-strong': 'Ollama — heavyweight model (slower, best quality)',
};

export const ModelSelect = ({ value, onChange }: ModelSelectProps) => {
  const handleChange = (event: SelectChangeEvent<GenerationBackend>) => {
    onChange(event.target.value as GenerationBackend);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="generation-backend-label">Model Backend</InputLabel>
      <Select
        labelId="generation-backend-label"
        value={value}
        label="Model Backend"
        onChange={handleChange}
        size="small"
      >
        {Object.entries(MODEL_DESCRIPTIONS).map(([key, description]) => (
          <MenuItem key={key} value={key}>
            {description}
            <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }}>
              {key === 'openai'
                ? 'Requires VITE_OPENAI_API_KEY'
                : key === 'ollama-fast'
                  ? 'Use for quick drafts and demos'
                  : 'Highest quality, but slower'}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
