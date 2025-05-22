/**
 * @file Web bindings for the tree-sitter-openscad grammar
 *
 * This module provides the OpenSCAD grammar for web-tree-sitter.
 * It exports the path to the WebAssembly file and the language name.
 */

const path = require('path');

/**
 * Path to the WebAssembly file containing the compiled tree-sitter grammar
 */
const wasmPath = path.join(__dirname, 'tree-sitter-openscad.wasm');

/**
 * Language name for the OpenSCAD grammar
 */
const languageName = 'openscad';

module.exports = {
  wasmPath,
  languageName
};

// Include node types information if available
try {
  module.exports.nodeTypeInfo = require("../../src/node-types.json");
} catch (_) {}
