const Parser = require('tree-sitter');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const parser = new Parser();
    const wasmPath = path.join(__dirname, '../tree-sitter-openscad.wasm');
    const wasmBuffer = fs.readFileSync(wasmPath);
    
    const language = await Parser.Language.load(wasmBuffer);
    parser.setLanguage(language);
    
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
