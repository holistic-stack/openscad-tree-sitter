/**
 * @file improved-wasm-test.js
 * @description Improved test for the WebAssembly build of the OpenSCAD Tree-sitter grammar
 */

const fs = require('fs');
const path = require('path');
const { Parser } = require('web-tree-sitter');

// Path to the WebAssembly file
const WASM_PATH = path.join(__dirname, '../../tree-sitter-openscad.wasm');

// Test OpenSCAD code examples
const TEST_EXAMPLES = {
  basic: `
module test(size = 10) {
  cube(size);
  sphere(size/2);
}

test();
`,
  complex: `
module gear(num_teeth, thickness, hole_diameter) {
  difference() {
    union() {
      cylinder(h = thickness, r = num_teeth * 2, $fn = num_teeth * 2);
      
      for (i = [0:num_teeth-1]) {
        rotate([0, 0, i * 360 / num_teeth])
          translate([num_teeth * 2, 0, thickness / 2])
            cube([2, 1, thickness], center = true);
      }
    }
    
    // Center hole
    cylinder(h = thickness * 2, r = hole_diameter / 2, center = true, $fn = 30);
  }
}

gear(20, 5, 5);
`,
  controlFlow: `
if (true) {
  cube(10);
} else {
  sphere(5);
}

for (i = [0:5]) {
  translate([i * 10, 0, 0])
    cube(5);
}

size = true ? 10 : 5;
cube(size);
`
};

/**
 * Format a syntax tree for display
 * @param {Object} node - The tree node
 * @param {number} indent - Indentation level
 * @returns {string} Formatted tree
 */
function formatTree(node, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let result = `${indentStr}${node.type}`;
  
  if (node.childCount === 0) {
    result += ` "${node.text}"`;
  } else {
    result += '\n';
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      const fieldName = node.fieldNameForChild(i);
      
      if (fieldName) {
        result += `${indentStr}  ${fieldName}:\n`;
      }
      
      result += formatTree(child, indent + 2);
      
      if (i < node.childCount - 1) {
        result += '\n';
      }
    }
  }
  
  return result;
}

/**
 * Test parsing an example
 * @param {Object} parser - The tree-sitter parser
 * @param {string} name - Example name
 * @param {string} code - OpenSCAD code
 */
function testExample(parser, name, code) {
  console.log(`\n=== Testing example: ${name} ===`);
  
  try {
    const tree = parser.parse(code);
    console.log(`Parsing successful.`);
    console.log(`Root node type: ${tree.rootNode.type}`);
    console.log(`Root node child count: ${tree.rootNode.childCount}`);
    
    // Print a simplified tree (first 2 levels only)
    console.log('\nSyntax tree (simplified):');
    const rootNode = tree.rootNode;
    console.log(rootNode.type);
    
    for (let i = 0; i < rootNode.childCount; i++) {
      const child = rootNode.child(i);
      console.log(`  ${child.type}${child.childCount === 0 ? ` "${child.text}"` : ''}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error parsing example ${name}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== OpenSCAD Tree-sitter WebAssembly Test ===');
  
  try {
    // Check if the WebAssembly file exists
    if (!fs.existsSync(WASM_PATH)) {
      console.error(`WebAssembly file not found at: ${WASM_PATH}`);
      console.log('Please run "pnpm build:wasm" to generate the WebAssembly file.');
      process.exit(1);
    }
    
    console.log(`WebAssembly file found at: ${WASM_PATH}`);
    
    // Initialize the parser
    console.log('Initializing parser...');
    await Parser.init();
    const parser = new Parser();
    
    // Load the language
    console.log('Loading OpenSCAD language...');
    const language = await Parser.Language.load(WASM_PATH);
    parser.setLanguage(language);
    
    console.log('Parser initialized with OpenSCAD language.');
    
    // Test each example
    let allPassed = true;
    
    for (const [name, code] of Object.entries(TEST_EXAMPLES)) {
      const passed = testExample(parser, name, code);
      allPassed = allPassed && passed;
    }
    
    // Test a more complex example with full tree output
    console.log('\n=== Testing detailed tree output ===');
    const detailedTree = parser.parse(TEST_EXAMPLES.basic);
    console.log('\nDetailed syntax tree:');
    console.log(formatTree(detailedTree.rootNode));
    
    if (allPassed) {
      console.log('\n=== All tests passed! ===');
      process.exit(0);
    } else {
      console.error('\n=== Some tests failed! ===');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error testing WebAssembly build:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
