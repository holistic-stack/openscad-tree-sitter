import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: "./src/setupTests.ts",
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.vitest.json',
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
