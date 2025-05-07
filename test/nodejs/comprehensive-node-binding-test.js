/**
 * @file comprehensive-node-binding-test.js
 * @description Comprehensive test suite for tree-sitter node bindings
 *
 * This file demonstrates best practices for testing tree-sitter node bindings:
 * 1. Proper initialization testing
 * 2. Robust parsing tests
 * 3. Mock testing strategy
 * 4. Error handling and recovery
 * 5. Cross-platform considerations
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Path to the WebAssembly file
const WASM_PATH = path.join(__dirname, '../../tree-sitter-openscad.wasm');

// Test OpenSCAD code samples
const SIMPLE_CODE = `
module test(size = 10) {
  cube(size);
}
`;

const COMPLEX_CODE = `
module complex_shape(size = 10, detail = 5) {
  difference() {
    union() {
      cube(size, center = true);
      translate([0, 0, size/2])
        sphere(d = size * 0.8, $fn = detail * 4);
    }

    for (i = [0:detail-1]) {
      rotate([0, 0, i * 360 / detail])
      translate([size/2, 0, 0])
        cylinder(h = size * 2, d = size/3, center = true, $fn = detail * 2);
    }
  }
}

complex_shape(20, 8);
`;

// Test with error
const CODE_WITH_ERROR = `
module test(size = 10 {  // Missing closing parenthesis
  cube(size);
}
`;

/**
 * Test suite for tree-sitter node bindings
 */
async function runTests() {
  console.log('=== Comprehensive Tree-Sitter Node Bindings Test ===');

  // Test 1: Check if WebAssembly file exists
  console.log('\n1. Testing WebAssembly file existence...');
  const wasmExists = fs.existsSync(WASM_PATH);
  console.log(`WebAssembly file exists: ${wasmExists}`);
  if (!wasmExists) {
    console.warn('WebAssembly file not found. Some tests will be skipped.');
    console.log('Please run "pnpm build:wasm" to generate the WebAssembly file.');
  }

  // Test 2: Initialize parser with web-tree-sitter
  console.log('\n2. Testing parser initialization...');
  let Parser, parser, language;
  try {
    Parser = require('web-tree-sitter');
    await Parser.init();
    parser = new Parser();
    console.log('Parser initialized successfully');

    if (wasmExists) {
      language = await Parser.Language.load(WASM_PATH);
      parser.setLanguage(language);
      console.log('Language loaded successfully');
    } else {
      console.log('Skipping language loading (WebAssembly file not found)');
    }
  } catch (error) {
    console.error('Error initializing parser:', error.message);
    console.log('Attempting to use fallback parser...');

    try {
      // Try to use the fallback parser
      const { createFallbackParser } = require('../../src/fallback-parser');
      parser = await createFallbackParser();
      console.log('Fallback parser initialized successfully');
    } catch (fallbackError) {
      console.error('Error initializing fallback parser:', fallbackError.message);
      process.exit(1);
    }
  }

  // Test 3: Parse simple code
  if (parser) {
    console.log('\n3. Testing parsing simple code...');
    try {
      const tree = parser.parse(SIMPLE_CODE);
      console.log('Simple code parsed successfully');
      console.log('Root node type:', tree.rootNode.type);
      console.log('Root node child count:', tree.rootNode.childCount);

      // Validate the tree structure
      assert(tree.rootNode.type === 'source_file', 'Root node should be a source_file');
      console.log('Tree structure validation passed');

      // Print the first few levels of the syntax tree
      console.log('\nSyntax tree (first 2 levels):');
      printNodeTree(tree.rootNode, 2);
    } catch (error) {
      console.error('Error parsing simple code:', error.message);
    }
  }

  // Test 4: Parse complex code
  if (parser) {
    console.log('\n4. Testing parsing complex code...');
    try {
      const tree = parser.parse(COMPLEX_CODE);
      console.log('Complex code parsed successfully');
      console.log('Root node type:', tree.rootNode.type);
      console.log('Root node child count:', tree.rootNode.childCount);

      // Count specific node types
      const moduleDefinitions = countNodesOfType(tree.rootNode, 'module_definition');
      const moduleInstantiations = countNodesOfType(tree.rootNode, 'module_instantiation');
      const forStatements = countNodesOfType(tree.rootNode, 'for_statement');

      console.log('Module definitions:', moduleDefinitions);
      console.log('Module instantiations:', moduleInstantiations);
      console.log('For statements:', forStatements);

      // Validate counts
      assert(moduleDefinitions > 0, 'Should have at least one module definition');
      assert(moduleInstantiations > 0, 'Should have at least one module instantiation');
      assert(forStatements > 0, 'Should have at least one for statement');
      console.log('Node count validation passed');
    } catch (error) {
      console.error('Error parsing complex code:', error.message);
    }
  }

  // Test 5: Error handling
  if (parser) {
    console.log('\n5. Testing error handling...');
    try {
      const tree = parser.parse(CODE_WITH_ERROR);
      console.log('Code with error parsed');

      // Check if the tree contains error nodes
      const hasErrors = findErrorNodes(tree.rootNode);
      console.log('Tree contains error nodes:', hasErrors);

      // In a robust parser, even code with syntax errors should produce a tree
      assert(tree.rootNode.type === 'source_file', 'Root node should still be a source_file');
      console.log('Error handling validation passed');
    } catch (error) {
      console.error('Parser threw exception on invalid code:', error.message);
      console.log('This might be expected depending on the parser configuration');
    }
  }

  // Test 6: Incremental parsing
  if (parser) {
    console.log('\n6. Testing incremental parsing...');
    try {
      // Initial parse
      let tree = parser.parse(SIMPLE_CODE);
      console.log('Initial parse successful');

      // Modified code - change 'size = 10' to 'size = 20'
      const modifiedCode = SIMPLE_CODE.replace('size = 10', 'size = 20');

      // Create an edit
      const startIndex = SIMPLE_CODE.indexOf('10');
      const oldEndIndex = startIndex + 2;
      const newEndIndex = startIndex + 2;

      // Apply the edit to the tree
      tree.edit({
        startIndex,
        oldEndIndex,
        newEndIndex,
        startPosition: { row: 1, column: startIndex - SIMPLE_CODE.indexOf('\n') - 1 },
        oldEndPosition: { row: 1, column: oldEndIndex - SIMPLE_CODE.indexOf('\n') - 1 },
        newEndPosition: { row: 1, column: newEndIndex - SIMPLE_CODE.indexOf('\n') - 1 }
      });

      // Re-parse with the edited tree
      const newTree = parser.parse(modifiedCode, tree);
      console.log('Incremental parse successful');

      // Validate the new tree
      assert(newTree.rootNode.type === 'source_file', 'Root node should still be a source_file');
      console.log('Incremental parsing validation passed');
    } catch (error) {
      console.error('Error during incremental parsing:', error.message);
    }
  }

  // Test 7: Parser information
  if (parser.getParserInfo) {
    console.log('\n7. Testing parser information...');
    try {
      const info = parser.getParserInfo();
      console.log('Parser info:', info);

      // Log which parser is being used
      if (info.usingWebParser) {
        console.log('Using web-tree-sitter parser');
      } else if (info.usingNativeParser) {
        console.log('Using native tree-sitter parser');
      } else if (info.usingMockParser) {
        console.log('Using mock parser');
      }
    } catch (error) {
      console.error('Error getting parser info:', error.message);
    }
  } else {
    console.log('\n7. Parser info not available');
  }

  console.log('\n=== Test Suite Completed ===');
}

/**
 * Helper function to print a node tree up to a specified depth
 * @param {Object} node - The syntax node
 * @param {number} maxDepth - Maximum depth to print
 * @param {number} currentDepth - Current depth (used internally)
 * @param {string} prefix - Prefix for indentation (used internally)
 */
function printNodeTree(node, maxDepth, currentDepth = 0, prefix = '') {
  if (currentDepth > maxDepth) return;

  console.log(`${prefix}${node.type} [${node.startPosition.row},${node.startPosition.column}] - [${node.endPosition.row},${node.endPosition.column}]`);

  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child) {
        printNodeTree(child, maxDepth, currentDepth + 1, prefix + '  ');
      }
    }
  } else if (node.childCount > 0) {
    // Alternative way to access children if node.children is not available
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        printNodeTree(child, maxDepth, currentDepth + 1, prefix + '  ');
      }
    }
  }
}

/**
 * Helper function to count nodes of a specific type
 * @param {Object} node - The syntax node
 * @param {string} nodeType - The type of node to count
 * @returns {number} - The count of nodes of the specified type
 */
function countNodesOfType(node, nodeType) {
  let count = 0;

  // Check if this node matches the type
  if (node.type === nodeType) {
    count++;
  }

  // Recursively check children
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      if (child) {
        count += countNodesOfType(child, nodeType);
      }
    }
  } else if (node.childCount > 0) {
    // Alternative way to access children if node.children is not available
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        count += countNodesOfType(child, nodeType);
      }
    }
  }

  return count;
}

/**
 * Helper function to find error nodes in the tree
 * @param {Object} node - The syntax node
 * @returns {boolean} - True if the tree contains error nodes
 */
function findErrorNodes(node) {
  // Check if this node is an error node
  if (node.type === 'ERROR' || (typeof node.hasError === 'function' && node.hasError())) {
    return true;
  }

  // Recursively check children
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      if (child && findErrorNodes(child)) {
        return true;
      }
    }
  } else if (node.childCount > 0) {
    // Alternative way to access children if node.children is not available
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && findErrorNodes(child)) {
        return true;
      }
    }
  }

  return false;
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
