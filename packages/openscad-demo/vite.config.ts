/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import dts from 'vite-plugin-dts'; // Removed for app build
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
// import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'; // Removed for app build
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig(() => ({
  root: __dirname, // Keep root for resolving paths correctly
  cacheDir: '../../node_modules/.vite/packages/openscad-demo',
  plugins: [
    react(),
    nxViteTsPaths(),
    // nxCopyAssetsPlugin(['*.md']), // Removed
    // dts({
    //   entryRoot: 'src',
    //   tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    // }), // Removed for app build
    (monacoEditorPlugin as any).default({ 
      languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],
      // publicPath: 'monaco-assets' // Optional: if you want to serve monaco assets from a subfolder
    }),
  ],
  // worker: { // Keep if you have other workers, otherwise remove
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/packages/openscad-demo',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // lib: { // Removed for app build
    //   entry: 'src/index.ts',
    //   name: 'openscad-demo',
    //   fileName: 'index',
    //   formats: ['es' as const],
    // },
    // rollupOptions: { // Removed for app build
    //   external: ['react', 'react-dom', 'react/jsx-runtime'],
    // },
  },
  server: {
    fs: {
      // Allow serving files from one level up (workspace root)
      // This helps with linked workspace dependencies like @openscad/editor
      allow: ['..', '../../node_modules/web-tree-sitter'], // Added web-tree-sitter for its WASM
    },
  },
  // To ensure static assets from @openscad/editor (e.g., .wasm, .scm files in its public dir)
  // are available, you might need to:
  // 1. Configure `assetsInclude` in Vite if they are not picked up automatically.
  // 2. Or, add a build step to copy them from `packages/openscad-editor/public` 
  //    to `packages/openscad-demo/public` or the build output directory.
  // `vite-plugin-monaco-editor` handles Monaco's own assets.
  // `web-tree-sitter` might also need its wasm file to be accessible.
  // Adding '../../node_modules/web-tree-sitter' to fs.allow for dev.
  // For prod, ensure `parser.wasm` from web-tree-sitter is in your public/assets dir.

  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/openscad-demo',
      provider: 'v8' as const,
    },
  },
}));
