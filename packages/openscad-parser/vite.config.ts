/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      outDir: resolve(__dirname, 'dist'),
      copyDtsFiles: true,
    }),
  ],

  // Library mode configuration for Vite 6.x
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    reportCompressedSize: true,

    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'OpenSCADParser',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },

    rollupOptions: {
      // External packages that should not be bundled into the library
      external: [
        '@openscad/tree-sitter-openscad',
        'web-tree-sitter',
        // Node.js built-ins
        /^node:.*/, // Externalize all Node.js built-ins
        'find-up', // Also externalize find-up as it's causing issues with node:fs
      ],

      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          '@openscad/tree-sitter-openscad': 'TreeSitterOpenSCAD',
          'web-tree-sitter': 'TreeSitter',
        },

        // Vite 6.x best practices for library output
        exports: 'named',
        interop: 'auto',
        hoistTransitiveImports: false,
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
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/openscad-parser',
      provider: 'v8',
    },
    isolate: true,
    setupFiles: './src/test-utils/setupTest.ts',
  },
});
