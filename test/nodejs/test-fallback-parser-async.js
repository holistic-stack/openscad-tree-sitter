/**
 * @file test-fallback-parser-async.js
 * @description Test for parsing OpenSCAD code with the fallback parser using node:test
 */

const test = require('node:test');
const assert = require('node:assert');
const { createFallbackParser } = require('../../src/fallback-parser');

// Test OpenSCAD code
const TEST_CODE = 'module test() { cube(10); }';

test('Fallback parser initialization and parsing', async (t) => {
  // Test fallback parser creation
  await t.test('Create fallback parser', async () => {
    const parser = await createFallbackParser();
    assert.ok(parser, 'Fallback parser should be created');
    assert.ok(typeof parser.parse === 'function', 'Fallback parser should have a parse method');
  });

  // Test parsing OpenSCAD code
  await t.test('Parse OpenSCAD code with fallback parser', async () => {
    // Create the parser
    const parser = await createFallbackParser();

    // Parse the code
    const tree = parser.parse(TEST_CODE);

    // Assertions
    assert.ok(tree, 'Parse tree should be created');
    assert.ok(tree.rootNode, 'Parse tree should have a root node');
    assert.strictEqual(tree.rootNode.type, 'source_file', 'Root node should be source_file');
    assert.strictEqual(tree.rootNode.text, TEST_CODE, 'Root node text should match input code');

    // Check for module_definition node or similar structure
    // Note: The fallback parser might have a different structure than the native parser
    const hasModuleNode = tree.rootNode.children.some(node =>
      node.type === 'module_definition' ||
      node.type.includes('module') ||
      (node.children && node.children.some(child =>
        child.type === 'module_definition' || child.type.includes('module')
      ))
    );

    assert.ok(hasModuleNode, 'Tree should contain a module-related node');
  });
});
