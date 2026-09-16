import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // We are just testing pure TS functions
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
