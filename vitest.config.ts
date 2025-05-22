import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/test/**']
    },
    include: ['packages/*/src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@openscad/tree-sitter-openscad': path.resolve(__dirname, './packages/tree-sitter-openscad'),
      '@openscad/parser': path.resolve(__dirname, './packages/openscad-parser/src')
    }
  }
});
