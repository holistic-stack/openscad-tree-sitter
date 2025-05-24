import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { join, resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Copy WASM file from tree-sitter-openscad to dist
const copyWasmFile = () => {
  return {
    name: 'copy-wasm-file',
    closeBundle() {
      const srcWasmPath = resolve(
        __dirname,
        './node_modules/@openscad/tree-sitter-openscad/tree-sitter-openscad.wasm'
      );
      const destDir = resolve(__dirname, 'dist');
      const destWasmPath = resolve(destDir, 'tree-sitter-openscad.wasm');

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      if (existsSync(srcWasmPath)) {
        console.log(`Copying WASM file from ${srcWasmPath} to ${destWasmPath}`);
        copyFileSync(srcWasmPath, destWasmPath);
      } else {
        console.error(`WASM file not found at ${srcWasmPath}`);
      }
    },
  };
};

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: join(__dirname, 'tsconfig.json'),
    }),
    copyWasmFile(),
  ],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'openscadParser',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@openscad/tree-sitter-openscad', 'web-tree-sitter'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    setupFiles: './src/test-utils/setupTest.ts',
  },
});
