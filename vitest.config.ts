import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/tests/e2e/**'],
    alias: {
      'server-only': resolve(__dirname, './tests/mocks/server-only.js'),
    },
  },
});
