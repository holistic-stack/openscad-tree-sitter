// Simple test to check if literal parsing works
import { EnhancedOpenscadParser, SimpleErrorHandler } from './dist/index.js';

async function testLiteral() {
  const parser = new EnhancedOpenscadParser();
  await parser.init();

  const code = '42';
  console.log('Testing literal parsing with code:', JSON.stringify(code));

  const tree = parser.parse(code);
  if (!tree) {
    console.log('Failed to parse');
    return;
  }

  console.log('Root node type:', tree.rootNode.type);
  console.log('Root node text:', JSON.stringify(tree.rootNode.text));

  // Find the number node
  function findNumberNode(node) {
    console.log(`Checking node: ${node.type} - "${node.text}"`);
    if (node.type === 'number') {
      return node;
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const result = findNumberNode(child);
        if (result) return result;
      }
    }
    return null;
  }

  const numberNode = findNumberNode(tree.rootNode);
  if (!numberNode) {
    console.log('No number node found');
    return;
  }

  console.log('Found number node:', numberNode.type, JSON.stringify(numberNode.text));

  // Test the expression visitor
  const errorHandler = new SimpleErrorHandler();
  // ExpressionVisitor is not exported, so let's test with the enhanced parser directly

  console.log('Testing with enhanced parser...');
  const ast = parser.parseToAST(code);
  console.log('AST Result:', ast);
  console.log('Errors:', errorHandler.getErrors());

  parser.dispose();
}

testLiteral().catch(console.error);
