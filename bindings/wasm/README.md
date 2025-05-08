# OpenSCAD Tree-sitter WASM Bindings

This directory contains the WebAssembly (WASM) bindings for the OpenSCAD tree-sitter grammar.

## Usage

The WASM files in this directory are generated using the `pnpm build:wasm` command, which runs:

```bash
tree-sitter build --wasm --output-dir=bindings/wasm
```

These WASM files can be used in web applications to parse OpenSCAD code directly in the browser.

## Integration with web-tree-sitter

To use these WASM bindings with web-tree-sitter, you can load them as follows:

```javascript
import Parser from 'web-tree-sitter';

async function initParser() {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load('path/to/bindings/wasm/tree-sitter-openscad.wasm');
  parser.setLanguage(language);
  return parser;
}

// Example usage
const parser = await initParser();
const tree = parser.parse('cube([10, 10, 10]);');
console.log(tree.rootNode.toString());
```

## Files

- `tree-sitter-openscad.wasm` - The compiled WebAssembly module for the OpenSCAD grammar

## Notes

- These WASM bindings are automatically generated and should not be edited manually.
- The WASM files are excluded from version control via .gitignore.
