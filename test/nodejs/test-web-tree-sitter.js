// Import the Parser constructor
const { Parser, Language } = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Initialize the parser
    await Parser.init();
    const parser = new Parser();

    // Load the WebAssembly language
    const wasmPath = path.join(__dirname, '../tree-sitter-openscad.wasm');
    const language = await Language.load(wasmPath);
    parser.setLanguage(language);

    // Parse some OpenSCAD code
    const sourceCode = 'module test() { cube(10); }';
    const tree = parser.parse(sourceCode);

    console.log('Parsing successful');
    console.log('Root node type:', tree.rootNode.type);
    console.log('Root node text:', tree.rootNode.text);
    console.log('Tree structure:');
    console.log(tree.rootNode.toString());
  } catch (error) {
    console.error('Error parsing code:', error);
  }
}

main().catch(console.error);
