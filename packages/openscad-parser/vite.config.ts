import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { join } from 'path';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      tsConfigFilePath: join(__dirname, 'tsconfig.json'),
    }),
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
});
