import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { join, resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: join(__dirname, 'tsconfig.json'),
    }),
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'openscadParser',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    minify: false,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        hoistTransitiveImports: false,
        interop: 'auto',
        exports: 'named',
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
      external: ['@openscad/tree-sitter-openscad', 'web-tree-sitter'],
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    isolate: true,
    setupFiles: './src/test-utils/setupTest.ts',
  },
});
