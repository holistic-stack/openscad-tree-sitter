/**
 * @file test-native-binding.js
 * @description Test for the native tree-sitter bindings using node:test
 */

const test = require('node:test');
const assert = require('node:assert');

test('Native binding availability and properties', async (t) => {
  await t.test('Load native binding', () => {
    // Load the binding
    const binding = require('../../bindings/node');

    // Assertions
    assert.ok(binding, 'Binding should be loaded');
    assert.ok(binding.name, 'Binding should have a name property');
    assert.ok(binding.language, 'Binding should have a language property');

    // Log binding information for debugging
    console.log('Binding name:', binding.name);
    console.log('Binding language:', binding.language ? 'Available' : 'Not available');
    console.log('Node type info:', binding.nodeTypeInfo ? 'Available' : 'Not available');
  });

  await t.test('Binding properties', () => {
    const binding = require('../../bindings/node');

    // Check binding properties
    assert.strictEqual(typeof binding.name, 'string', 'Binding name should be a string');
    assert.ok(binding.language, 'Binding language should be available');

    // Check if the language has the expected properties
    // Note: Some properties might not be available in all versions of tree-sitter
    if (binding.language.nodeTypeCount !== undefined) {
      assert.ok(binding.language.nodeTypeCount > 0, 'Language should have node types');
    }

    if (binding.language.fieldCount !== undefined) {
      assert.ok(binding.language.fieldCount >= 0, 'Language should have field count');
    }
  });
});
