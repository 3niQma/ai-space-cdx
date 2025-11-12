import { FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { themeOptions, type ThemeName } from '../theme/templates';

interface ThemeSelectProps {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}

export const ThemeSelect = ({ value, onChange }: ThemeSelectProps) => {
  const handleChange = (event: SelectChangeEvent<ThemeName>) => {
    onChange(event.target.value as ThemeName);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="theme-select-label">UI Template</InputLabel>
      <Select
        labelId="theme-select-label"
        value={value}
        label="UI Template"
        onChange={handleChange}
        size="small"
      >
        {themeOptions.map((option) => (
          <MenuItem key={option.name} value={option.name}>
            {option.label}
            <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }}>
              {option.description}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
