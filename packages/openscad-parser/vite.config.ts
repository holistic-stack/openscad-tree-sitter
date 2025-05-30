import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { join, resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Copy WASM file from tree-sitter-openscad to dist
const copyWasmFile = () => {
  return {
    name: 'copy-wasm-file',
    closeBundle() {
      // Try local build first, then fallback to npm package
      const localWasmPath = resolve(
        __dirname,
        '../tree-sitter-openscad/tree-sitter-openscad.wasm'
      );
      const npmWasmPath = resolve(
        __dirname,
        './node_modules/@openscad/tree-sitter-openscad/tree-sitter-openscad.wasm'
      );

      const destDir = resolve(__dirname, 'dist');
      const destWasmPath = resolve(destDir, 'tree-sitter-openscad.wasm');

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      // Prefer local build over npm package
      let srcWasmPath = localWasmPath;
      if (!existsSync(localWasmPath)) {
        srcWasmPath = npmWasmPath;
      }

      if (existsSync(srcWasmPath)) {
        console.log(`Copying WASM file from ${srcWasmPath} to ${destWasmPath}`);
        copyFileSync(srcWasmPath, destWasmPath);
      } else {
        console.error(`WASM file not found at either ${localWasmPath} or ${npmWasmPath}`);
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
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
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
    isolate: true,
    setupFiles: './src/test-utils/setupTest.ts',
  },
});
