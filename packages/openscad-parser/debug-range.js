import { OpenscadParser } from '../../dist/packages/openscad-parser/index.mjs';

async function debugRange() {
  const parser = new OpenscadParser();
  await parser.init();
  
  const code = '[0:5]';
  console.log('Parsing:', code);
  
  const tree = parser.parse(code);
  console.log('Parse tree:');
  console.log(tree.rootNode.toString());
  
  // Find all nodes
  function printNodes(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type}: "${node.text}"`);
    
    for (let i = 0; i < node.childCount; i++) {
      printNodes(node.child(i), depth + 1);
    }
  }
  
  printNodes(tree.rootNode);
  
  parser.dispose();
}

debugRange().catch(console.error);
