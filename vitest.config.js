import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'test/helpers/**',
        'build/**',
        'bindings/**/*.d.ts'
      ],
    },
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-results/html/index.html',
    },
  },
}); 