import { Parser } from 'web-tree-sitter';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sets up the tree-sitter parser with the OpenSCAD grammar
 * @returns A promise that resolves to an initialized Parser instance
 */
export async function setupParser(): Promise<Parser> {
  // Initialize the parser
  await Parser.init({
    locateFile: (_wasm: string, _scriptDirectory: string) => {
      // Try to find the wasm file in the expected location
      const wasmPath = join(
        __dirname,
        '../../../node_modules/@openscad/tree-sitter-openscad/tree-sitter-openscad.wasm'
      );

      try {
        // Check if the wasm file exists
        readFileSync(wasmPath);
        return wasmPath;
      } catch (e) {
        console.error('Failed to load tree-sitter-openscad.wasm:', e);
        throw new Error(
          'Could not find tree-sitter-openscad.wasm. Please make sure@holistic-stack/tree-sitter-openscad is installed.'
        );
      }
    },
  });

  const parser = new Parser();

  try {
    // Try to load the OpenSCAD language
    const languageModule = await import('@openscad/tree-sitter-openscad');
    // Access the default export which should be the Language object
    const language = languageModule.default || languageModule;
    // @ts-expect-error - web-tree-sitter types are incorrect for dynamic language loading
    parser.setLanguage(language);
  } catch (e) {
    console.error('Failed to load@holistic-stack/tree-sitter-openscad:', e);
    throw new Error(
      'Could not load@holistic-stack/tree-sitter-openscad. Please make sure it is installed and built.'
    );
  }

  return parser;
}
