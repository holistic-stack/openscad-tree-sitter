const Parser = require('web-tree-sitter');
const path = require('path');

async function debugAssignCST() {
  await Parser.init();
  const wasmPath = path.join(__dirname, 'packages/tree-sitter-openscad/tree-sitter-openscad.wasm');
  const language = await Parser.Language.load(wasmPath);
  const parser = new Parser();
  parser.setLanguage(language);

  const code = 'assign(x = 5) cube(x);';
  const tree = parser.parse(code);
  
  function printNode(node, indent = 0) {
    const spaces = '  '.repeat(indent);
    console.log(`${spaces}${node.type}: "${node.text}"`);
    for (let i = 0; i < node.childCount; i++) {
      printNode(node.child(i), indent + 1);
    }
  }
  
  console.log('CST structure for:', code);
  printNode(tree.rootNode);
}

debugAssignCST().catch(console.error);
