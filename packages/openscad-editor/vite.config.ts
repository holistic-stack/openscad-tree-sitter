/// <reference types='vitest' />
import { defineConfig, type LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    monacoEditorPlugin({}), // Add this line
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'openscadEditor',
      fileName: 'index',
      formats: ['es', 'cjs'] as LibraryFormats[],
    },
    rollupOptions: {
      preserveModulesRoot: 'src',
      output: {
        entryFileNames: '[name].js',
        preserveModules: true,
      },
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'monaco-editor',
        '@openscad/parser',
        '@openscad/tree-sitter-openscad',
        'web-tree-sitter',
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-utils/setupTest.ts',
  },
}));
