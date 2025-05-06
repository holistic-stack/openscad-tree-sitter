/**
 * Test script to parse examples/sample.scad with the WebAssembly parser
 * Run this script in Node.js with:
 * node test-sample.js
 */

// Import dependencies
const fs = require('fs');
const path = require('path');
const treeSitter = require('web-tree-sitter');

// Load the sample.scad file
const samplePath = path.join(__dirname, '..', 'examples', 'sample.scad');
const sampleContent = fs.readFileSync(samplePath, 'utf8');

console.log(`Loaded sample.scad (${sampleContent.length} bytes)`);
console.log(`First 100 characters: ${sampleContent.substring(0, 100)}`);

// Parse the sample.scad file
async function main() {
  try {
    // Initialize the tree-sitter parser
    await treeSitter.init();
    console.log('TreeSitter initialized');

    // Create a parser
    const parser = new treeSitter();
    console.log('Parser created');

    // Load the OpenSCAD language
    const wasmPath = path.join(__dirname, 'tree-sitter-openscad.wasm');
    console.log(`Loading language from: ${wasmPath}`);
    
    const language = await treeSitter.Language.load(wasmPath);
    console.log('Language loaded');

    // Set the parser language
    parser.setLanguage(language);
    console.log('Language set to parser');

    // Parse the content
    console.log('Parsing sample.scad...');
    const tree = parser.parse(sampleContent);
    console.log('Parsing completed');

    // Display information about the parse tree
    console.log(`Root node type: ${tree.rootNode.type}`);
    console.log(`Number of top-level nodes: ${tree.rootNode.childCount}`);

    // Print the first few top-level nodes
    console.log('\nTop-level nodes:');
    for (let i = 0; i < Math.min(5, tree.rootNode.childCount); i++) {
      const node = tree.rootNode.child(i);
      console.log(`${i + 1}. ${node.type} (${node.startPosition.row},${node.startPosition.column}) - (${node.endPosition.row},${node.endPosition.column})`);
    }

    // Clean up
    tree.delete();
    parser.delete();
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
}); 