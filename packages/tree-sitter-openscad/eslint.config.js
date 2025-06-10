// ESLint configuration for tree-sitter-openscad package
// This package contains generated TypeScript declaration files that may not follow strict linting rules

module.exports = [
  {
    // Ignore patterns specific to tree-sitter packages
    ignores: [
      // Node modules
      'node_modules/**',

      // Build outputs - dist folders only
      'dist/**',

      // Tree-sitter specific build artifacts
      'build/**',
      'src/parser.c',
      'src/tree_sitter/**',
      '**/*.wasm',

      // Generated files
      'bindings/**/*.d.ts', // Ignore generated TypeScript declaration files
      'bindings/**/*.js',   // Ignore generated JavaScript files
      'grammar.js',         // Ignore Tree-sitter grammar DSL file
      'src/grammar.json',   // Ignore generated grammar JSON
      'src/node-types.json', // Ignore generated node types JSON
      '**/*.d.ts',
      '*.d.ts.map',

      // Coverage and temporary files
      'coverage/**',
      'vite.config.ts.timestamp-*',
      'vitest.config.ts.timestamp-*',
      '.vite/**',
      '.vitest/**',
    ],
  },

  // Configuration for JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Basic JavaScript rules
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single'],
    },
  },

  // Configuration for TypeScript files (if any are not ignored)
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      // Very lenient TypeScript rules for this package
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
    },
  },
];
