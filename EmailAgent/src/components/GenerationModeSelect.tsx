import { FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GenerationMode } from '../types';

interface GenerationModeSelectProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  ragEnabled?: boolean;
}

const MODE_DESCRIPTIONS: Record<Exclude<GenerationMode, 'rag'>, string> = {
  vanilla: 'Send the prompt to the LLM without extra context.',
  style: 'Apply Noah’s audience-specific style guide before calling the LLM.',
};

export const GenerationModeSelect = ({ value, onChange, ragEnabled = false }: GenerationModeSelectProps) => {
  const handleChange = (event: SelectChangeEvent<GenerationMode>) => {
    const nextValue = event.target.value as GenerationMode;
    onChange(nextValue);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="generation-mode-label">Assistant Mode</InputLabel>
      <Select
        labelId="generation-mode-label"
        label="Assistant Mode"
        value={value}
        onChange={handleChange}
        size="small"
      >
        <MenuItem value="vanilla">
          Vanilla LLM
          <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }}>
            {MODE_DESCRIPTIONS.vanilla}
          </Typography>
        </MenuItem>
        <MenuItem value="style">
          Style Profile
          <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }}>
            {MODE_DESCRIPTIONS.style}
          </Typography>
        </MenuItem>
        <MenuItem value="rag" disabled={!ragEnabled}>
          RAG Assist {ragEnabled ? '' : '(coming soon)'}
        </MenuItem>
      </Select>
    </FormControl>
  );
};
