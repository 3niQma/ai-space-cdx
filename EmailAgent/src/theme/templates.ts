import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export type ThemeName = 'classic' | 'midnight' | 'sunset' | 'forest';

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  theme: Theme;
}

const baseTypography = {
  fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
};

const makeTheme = (palette: Theme['palette']) =>
  createTheme({
    palette,
    typography: baseTypography,
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });

export const themeOptions: ThemeOption[] = [
  {
    name: 'classic',
    label: 'Classic Light',
    description: 'Familiar blue/teal palette (current default)',
    theme: makeTheme({
      mode: 'light',
      primary: { main: '#2C6ECB' },
      secondary: { main: '#0D9488' },
      background: { default: '#f5f7fb', paper: '#ffffff' },
    }),
  },
  {
    name: 'midnight',
    label: 'Midnight Pulse',
    description: 'High-contrast dark mode with neon accents',
    theme: makeTheme({
      mode: 'dark',
      primary: { main: '#00bcd4' },
      secondary: { main: '#ff6ec7' },
      background: { default: '#0c111d', paper: '#151b2b' },
    }),
  },
  {
    name: 'sunset',
    label: 'Sunset Gradient',
    description: 'Warm oranges and pinks for a vibrant feel',
    theme: makeTheme({
      mode: 'light',
      primary: { main: '#f97316' },
      secondary: { main: '#ec4899' },
      background: { default: '#fff7ed', paper: '#fffbf5' },
    }),
  },
  {
    name: 'forest',
    label: 'Forest Focus',
    description: 'Calming greens with earthy neutrals',
    theme: makeTheme({
      mode: 'light',
      primary: { main: '#166534' },
      secondary: { main: '#65a30d' },
      background: { default: '#f1f5ec', paper: '#ffffff' },
    }),
  },
];

export const getThemeByName = (name: ThemeName): Theme => {
  const option = themeOptions.find((opt) => opt.name === name);
  return option ? option.theme : themeOptions[0].theme;
};
