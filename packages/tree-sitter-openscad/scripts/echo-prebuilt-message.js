#!/usr/bin/env node

/**
 * Cross-platform script to display pre-built WASM message
 * Works consistently on Windows, Ubuntu, and other platforms
 */

const message = 'Grammar package uses pre-built WASM file. Use build:native or build:wasm for local development.';

console.log(message);
process.exit(0);
