#!/usr/bin/env node

/**
 * @file test-parser.js
 * @description Utility script to test the parser initialization
 *
 * Usage:
 *   node scripts/test-parser.js [options] [file]
 *
 * Options:
 *   --debug                 Enable debug logging
 *   --disable-web           Disable web-tree-sitter parser
 *   --disable-native        Disable native tree-sitter parser
 *   --force-mock            Force the use of the mock parser
 *   --info                  Show parser information
 *   --help                  Show this help message
 *
 * If a file is provided, the script will parse it and print the syntax tree.
 * Otherwise, it will parse a simple OpenSCAD code snippet.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments first
const args = process.argv.slice(2);
const options = {
  debug: args.includes('--debug'),
  disableWeb: args.includes('--disable-web'),
  disableNative: args.includes('--disable-native'),
  forceMock: args.includes('--force-mock'),
  info: args.includes('--info'),
  help: args.includes('--help')
};

// Set environment variables BEFORE requiring the fallback-parser module
process.env.OPENSCAD_PARSER_DEBUG = options.debug ? '1' : '0';
process.env.OPENSCAD_PARSER_DISABLE_WEB = options.disableWeb ? '1' : '0';
process.env.OPENSCAD_PARSER_DISABLE_NATIVE = options.disableNative ? '1' : '0';
process.env.OPENSCAD_PARSER_FORCE_MOCK = options.forceMock ? '1' : '0';

// Log the environment variables if debug is enabled
if (options.debug) {
  console.log('Environment variables:');
  console.log(`OPENSCAD_PARSER_DEBUG: ${process.env.OPENSCAD_PARSER_DEBUG}`);
  console.log(`OPENSCAD_PARSER_DISABLE_WEB: ${process.env.OPENSCAD_PARSER_DISABLE_WEB}`);
  console.log(`OPENSCAD_PARSER_DISABLE_NATIVE: ${process.env.OPENSCAD_PARSER_DISABLE_NATIVE}`);
  console.log(`OPENSCAD_PARSER_FORCE_MOCK: ${process.env.OPENSCAD_PARSER_FORCE_MOCK}`);
}

// Now require the fallback-parser module
const { createFallbackParser } = require('../src/fallback-parser');

// Extract file path if provided
const filePath = args.find(arg => !arg.startsWith('--'));

// Show help message if requested
if (options.help) {
  console.log(`
Usage:
  node scripts/test-parser.js [options] [file]

Options:
  --debug                 Enable debug logging
  --disable-web           Disable web-tree-sitter parser
  --disable-native        Disable native tree-sitter parser
  --force-mock            Force the use of the mock parser
  --info                  Show parser information
  --help                  Show this help message

If a file is provided, the script will parse it and print the syntax tree.
Otherwise, it will parse a simple OpenSCAD code snippet.
  `);
  process.exit(0);
}

// Environment variables are already set above

// Sample OpenSCAD code to parse if no file is provided
const sampleCode = `
module test() {
  cube(10);
}

test();
`;

// Main function
async function main() {
  try {
    console.log('Initializing parser...');
    const parser = await createFallbackParser();

    // Show parser information if requested
    if (options.info) {
      const info = parser.getParserInfo();
      console.log('\nParser Information:');
      console.log('-------------------');
      console.log(`Using Web Parser: ${info.usingWebParser}`);
      console.log(`Using Native Parser: ${info.usingNativeParser}`);
      console.log(`Using Mock Parser: ${info.usingMockParser}`);
      console.log(`Web Parser Available: ${info.webParserAvailable}`);
      console.log(`Native Parser Available: ${info.nativeParserAvailable}`);
      console.log(`Mock Parser Available: ${info.mockParserAvailable}`);
      console.log('-------------------\n');
    }

    // Parse the code
    let code = sampleCode;
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }
      code = fs.readFileSync(filePath, 'utf8');
      console.log(`Parsing file: ${filePath}`);
    } else {
      console.log('Parsing sample code:');
      console.log('-------------------');
      console.log(sampleCode);
      console.log('-------------------');
    }

    // Parse the code and measure the time
    const startTime = Date.now();
    const tree = parser.parse(code);
    const endTime = Date.now();

    console.log(`Parsing completed in ${endTime - startTime}ms`);

    // Print the syntax tree (simplified)
    console.log('\nSyntax Tree (simplified):');
    console.log('------------------------');
    printSyntaxTree(tree.rootNode);

    console.log('\nParsing successful!');
  } catch (error) {
    console.error('Error:', error.message);
    if (options.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Helper function to print a simplified syntax tree
function printSyntaxTree(node, indent = 0) {
  const indentStr = '  '.repeat(indent);
  console.log(`${indentStr}${node.type}`);

  // Print children (up to a maximum depth to avoid excessive output)
  if (indent < 5 && node.children && node.children.length > 0) {
    for (const child of node.children) {
      printSyntaxTree(child, indent + 1);
    }
  } else if (indent >= 5 && node.childCount > 0) {
    console.log(`${indentStr}  ... (${node.childCount} more children)`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
