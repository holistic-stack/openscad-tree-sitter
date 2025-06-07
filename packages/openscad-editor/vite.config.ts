/// <reference types='vitest' />
import { defineConfig, type LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
// @ts-ignore
import monacoEditorPluginModule from 'vite-plugin-monaco-editor';
// @ts-ignore
const monacoEditorPlugin = monacoEditorPluginModule.default || monacoEditorPluginModule;

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/openscad-editor',

  plugins: [
    react(),
    nxViteTsPaths(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'typescript'],
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
      outDir: resolve(__dirname, 'dist'),
      copyDtsFiles: true,
    }),
    nxCopyAssetsPlugin(['*.md']),
  ],

  // Library mode configuration for React component library
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    reportCompressedSize: true,

    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenSCADEditor',
      formats: ['es', 'cjs'] as LibraryFormats[],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },

    rollupOptions: {
      // External packages that should not be bundled into the library
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'monaco-editor',
        '@monaco-editor/react',
        '@openscad/parser',
        '@openscad/tree-sitter-openscad',
        'web-tree-sitter',
        'vite-plugin-monaco-editor',
      ],

      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'monaco-editor': 'monaco',
          '@monaco-editor/react': 'MonacoReact',
          '@openscad/parser': 'OpenSCADParser',
          '@openscad/tree-sitter-openscad': 'TreeSitterOpenSCAD',
          'web-tree-sitter': 'TreeSitter',
        },

        // Vite 6.x best practices for React library output
        exports: 'named',
        interop: 'auto',
        assetFileNames: '[name][extname]',
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
    },
  },

  // Vitest configuration
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest/packages/openscad-editor',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/openscad-editor',
      provider: 'v8',
    },
    setupFiles: './src/test-utils/setupTest.ts',
  },
}));
