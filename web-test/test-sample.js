/**
 * Test script to parse examples/sample.scad with the WebAssembly parser
 * Run this script in Node.js with:
 * node test-sample.js
 */

// Import dependencies
const fs = require('fs');
const path = require('path');

// Load the sample.scad file
const samplePath = path.join(__dirname, '..', 'examples', 'sample.scad');
const sampleContent = fs.readFileSync(samplePath, 'utf8');

console.log(`Loaded sample.scad (${sampleContent.length} bytes)`);
console.log(`First 100 characters: ${sampleContent.substring(0, 100)}`);

// Function to test the parser in Node.js environment
async function testParser() {
  try {
    // Import the web-tree-sitter library
    const Parser = require('web-tree-sitter');
    
    // Initialize the parser
    await Parser.init();
    
    // Create a new parser instance
    const parser = new Parser();
    
    // Load the WebAssembly language module
    const wasmPath = path.join(__dirname, 'tree-sitter-openscad.wasm');
    const language = await Parser.Language.load(wasmPath);
    
    // Set the language for the parser
    parser.setLanguage(language);
    
    console.log('Parser initialized successfully');
    
    // Parse the sample.scad content
    console.log('Parsing sample.scad...');
    const tree = parser.parse(sampleContent);
    
    // Output some information about the parsed tree
    console.log(`Parsing successful! Root node type: ${tree.rootNode.type}`);
    console.log(`Tree contains ${countNodes(tree.rootNode)} nodes`);
    console.log(`Tree depth: ${getTreeDepth(tree.rootNode)}`);
    
    // Print the first few child nodes
    console.log('\nFirst-level nodes:');
    for (let i = 0; i < Math.min(tree.rootNode.childCount, 5); i++) {
      const child = tree.rootNode.child(i);
      console.log(`${i + 1}. ${child.type} [${child.startPosition.row},${child.startPosition.column}] - [${child.endPosition.row},${child.endPosition.column}]`);
    }
    
    // Clean up resources
    tree.delete();
    parser.delete();
    
    console.log('\nParser test completed successfully');
  } catch (error) {
    console.error('Error testing parser:', error);
  }
}

// Helper function to count nodes in the tree
function countNodes(node) {
  let count = 1; // Count the current node
  
  for (let i = 0; i < node.childCount; i++) {
    count += countNodes(node.child(i));
  }
  
  return count;
}

// Helper function to get the depth of the tree
function getTreeDepth(node, depth = 0) {
  if (node.childCount === 0) {
    return depth;
  }
  
  let maxChildDepth = depth;
  
  for (let i = 0; i < node.childCount; i++) {
    const childDepth = getTreeDepth(node.child(i), depth + 1);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }
  
  return maxChildDepth;
}

// Run the test
testParser().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 