/**
 * @file test-wasm-build.js
 * @description Test the WebAssembly build of the OpenSCAD Tree-sitter grammar
 */

const fs = require('fs');
const path = require('path');
const { Parser } = require('web-tree-sitter');

// Path to the WebAssembly file
const WASM_PATH = path.join(__dirname, '../../tree-sitter-openscad.wasm');

// Test OpenSCAD code
const TEST_CODE = `
module test(size = 10) {
  cube(size);
  sphere(size/2);
}

test();
`;

async function main() {
  try {
    console.log('Testing WebAssembly build...');
    
    // Check if the WebAssembly file exists
    if (!fs.existsSync(WASM_PATH)) {
      console.error(`WebAssembly file not found at: ${WASM_PATH}`);
      console.log('Please run "pnpm build:wasm" to generate the WebAssembly file.');
      process.exit(1);
    }
    
    console.log('WebAssembly file found.');
    
    // Initialize the parser
    await Parser.init();
    const parser = new Parser();
    
    // Load the language
    const language = await Parser.Language.load(WASM_PATH);
    parser.setLanguage(language);
    
    console.log('Parser initialized with OpenSCAD language.');
    
    // Parse the test code
    const tree = parser.parse(TEST_CODE);
    
    console.log('Test code parsed successfully.');
    console.log('Root node type:', tree.rootNode.type);
    console.log('Root node child count:', tree.rootNode.childCount);
    
    // Print the syntax tree
    console.log('\nSyntax tree:');
    console.log(tree.rootNode.toString());
    
    console.log('\nWebAssembly build test completed successfully.');
  } catch (error) {
    console.error('Error testing WebAssembly build:', error);
    process.exit(1);
  }
}

main().catch(console.error);
