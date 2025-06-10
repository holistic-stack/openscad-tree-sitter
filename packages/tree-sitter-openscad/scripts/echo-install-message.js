#!/usr/bin/env node

/**
 * Cross-platform script to display install message
 * Works consistently on Windows, Ubuntu, and other platforms
 */

const message = 'Using pre-built WASM file. Native bindings available via node-gyp-build if needed.';

console.log(message);
process.exit(0);
