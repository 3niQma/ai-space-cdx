import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { ragPlugin } from './server/ragPlugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ragPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    pool: 'threads',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
