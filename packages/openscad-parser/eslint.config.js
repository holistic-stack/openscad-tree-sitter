// ESLint 9 flat config for openscad-parser package
// Integrates TypeScript, Prettier, and Vitest
// Configured to be lenient with existing codebase while providing useful linting

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import globals from "globals"; // Global variable definitions for different environments
import vitest from "@vitest/eslint-plugin";


export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.d.ts',
      'vite.config.ts.timestamp-*',
    ],
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Define global variables available in the code
        ...globals.es2020, // ES2020 globals like Promise, Map, Set, etc.
        ...globals.vitest, // Testing globals like describe, it, expect, etc.
        ...globals.jest, // Jest testing globals
        ...globals.node, // Node.js globals like process, console, etc.
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Basic TypeScript rules (lenient configuration)
      ...tseslint.configs.recommended.rules,

      // Disable strict type-checking rules for now
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',

      // Custom TypeScript rules (warnings for gradual improvement)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',

      // General JavaScript rules
      'no-console': 'off', // Allow console for debugging
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'off',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'off',
      eqeqeq: ['warn', 'always'],
      curly: ['warn', 'all'],
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this
      'no-case-declarations': 'warn',
      'no-empty': 'warn', // Allow empty blocks in some cases
      'no-constant-condition': 'warn', // Allow constant conditions in some cases

    },
  },

  // Test files configuration
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    plugins: {
      vitest,
    },
    rules: {
      // Allow any in tests for mocking
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Vitest specific rules (lenient)
      ...vitest.configs.recommended.rules
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        fetch: 'readonly',
      },
    },
  },

  // Configuration files
  {
    files: ['vite.config.ts', 'vitest.config.ts', 'eslint.config.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Prettier integration - must be last to override conflicting rules
  prettierConfig,
];
