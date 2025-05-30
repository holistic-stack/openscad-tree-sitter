import { OpenscadParser } from '../../dist/packages/openscad-parser/index.mjs';

async function debugStructure() {
  const parser = new OpenscadParser();
  await parser.init();
  
  const code = '[0:5]';
  console.log('Parsing:', code);
  
  const tree = parser.parse(code);
  console.log('Parse tree:');
  console.log(tree.rootNode.toString());
  
  // Find the array_literal node
  function findArrayLiteral(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type}: "${node.text}"`);
    
    if (node.type === 'array_literal') {
      console.log(`${indent}  Found array_literal!`);
      console.log(`${indent}  Children count: ${node.childCount}`);
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        console.log(`${indent}    Child ${i}: ${child.type} = "${child.text}"`);
        
        // Look for colon patterns
        if (child.type === 'expression' || child.type === 'number' || child.type === 'identifier') {
          console.log(`${indent}      Checking for colon pattern...`);
          // Check if next sibling is a colon
          if (i + 1 < node.childCount) {
            const nextChild = node.child(i + 1);
            console.log(`${indent}      Next sibling: ${nextChild.type} = "${nextChild.text}"`);
          }
        }
      }
    }
    
    for (let i = 0; i < node.childCount; i++) {
      findArrayLiteral(node.child(i), depth + 1);
    }
  }
  
  findArrayLiteral(tree.rootNode);
  
  parser.dispose();
}

debugStructure().catch(console.error);
