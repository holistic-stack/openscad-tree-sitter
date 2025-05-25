// Debug script to understand the tree structure for binary expressions
import { EnhancedOpenscadParser } from './dist/index.js';

async function debugBinaryExpression() {
  const parser = new EnhancedOpenscadParser();
  await parser.init();

  const code = 'x = 1 + 2;';
  console.log('Parsing code:', code);

  const tree = parser.parse(code);
  if (!tree) {
    console.log('Failed to parse');
    return;
  }

  function printTree(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type}: "${node.text}"`);

    // Print field names if available
    if (node.fieldNames && node.fieldNames.length > 0) {
      console.log(`${indent}  Fields: ${node.fieldNames.join(', ')}`);
    }

    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child) {
        printTree(child, depth + 1);
      }
    }
  }

  console.log('\nTree structure:');
  printTree(tree.rootNode);

  // Find expression nodes
  function findExpressionNodes(node, path = '') {
    if (node.type.includes('expression') || node.type.includes('additive') || node.type.includes('binary')) {
      console.log(`\nFound expression node at ${path}: ${node.type}`);
      console.log(`Text: "${node.text}"`);
      console.log(`Named children: ${node.namedChildCount}`);

      // Check for field names
      const leftNode = node.childForFieldName('left');
      const operatorNode = node.childForFieldName('operator');
      const rightNode = node.childForFieldName('right');

      console.log(`Left field: ${leftNode ? leftNode.type + ' "' + leftNode.text + '"' : 'null'}`);
      console.log(`Operator field: ${operatorNode ? operatorNode.type + ' "' + operatorNode.text + '"' : 'null'}`);
      console.log(`Right field: ${rightNode ? rightNode.type + ' "' + rightNode.text + '"' : 'null'}`);
    }

    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child) {
        findExpressionNodes(child, path + '/' + child.type);
      }
    }
  }

  findExpressionNodes(tree.rootNode);

  parser.dispose();
}

debugBinaryExpression().catch(console.error);
