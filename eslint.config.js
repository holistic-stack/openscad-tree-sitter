// Simple ESLint configuration for ESLint 9.x
// This configuration disables all TypeScript strict rules

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },

  // Base configuration for all files
  {
    // Apply to all TypeScript files
    files: ['**/*.ts'],
    // Use TypeScript parser
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    // Configure plugins
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      vitest: require('eslint-plugin-vitest'),
    },
    // Rules for all files - disabled TypeScript strict rules
    rules: {
      // Disable TypeScript strict rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Disable other rules that might be too strict
      'no-constant-condition': 'off',
      'no-empty': 'off',
      'no-console': 'off',

      // Vitest specific rules
      'vitest/expect-expect': 'off',
      'vitest/no-disabled-tests': 'off', // Allow disabled tests
      'vitest/no-focused-tests': 'error',
      'vitest/valid-expect': 'off',
    },
  },
];
