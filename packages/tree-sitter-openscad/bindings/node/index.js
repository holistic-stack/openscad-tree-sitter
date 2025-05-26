const path = require('path');
const root = path.join(__dirname, '..', '..');

let binding;
try {
  binding = require('node-gyp-build')(root);
} catch (e) {
  console.error('Failed to load native binding', e);
  throw e;
}

try {
  binding.nodeTypeInfo = require('../../src/node-types.json');
} catch (_) {}

module.exports = binding;