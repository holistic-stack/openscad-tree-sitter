# OpenSCAD Tree-Sitter Fallback Parser

This document describes the fallback parser mechanism implemented in the OpenSCAD Tree-Sitter project.

## Overview

The fallback parser is designed to provide a robust parsing mechanism that gracefully degrades when the primary parsing methods fail. It attempts to use the following parsers in order:

1. **Web Tree-Sitter Parser**: Uses the WebAssembly-based tree-sitter parser
2. **Native Tree-Sitter Parser**: Falls back to the native Node.js bindings if the web parser fails
3. **Mock Parser**: Uses a JavaScript-based mock implementation if both the web and native parsers fail

This approach ensures that the parsing functionality remains available even in environments where the WebAssembly or native modules cannot be loaded.

## Implementation Details

The fallback parser is implemented in `src/fallback-parser.js` and provides a unified interface for parsing OpenSCAD code. The main function `createFallbackParser()` returns a parser object with the following methods:

- `parse(code)`: Parses the given code and returns a syntax tree
- `setLanguage(language)`: Sets the language for the parser

## Usage

To use the fallback parser in your code:

```javascript
const { createFallbackParser } = require('./src/fallback-parser');

async function parseOpenSCAD(code) {
  const parser = await createFallbackParser();
  return parser.parse(code);
}
```

## Mock Parser

The mock parser is a JavaScript-based implementation that simulates the tree-sitter parser API. It provides a basic syntax tree structure that can be used for testing and development when the tree-sitter parsers are not available.

The mock parser uses regular expressions to identify common OpenSCAD syntax elements such as:

- Module definitions
- Function definitions
- Variable assignments
- Control structures (if, for, while)
- Module instantiations
- Special variables

## Troubleshooting

If you encounter issues with the parser initialization:

1. Check that the WebAssembly file (`tree-sitter-openscad.wasm`) is available in the project root
2. Ensure that the native bindings are properly compiled for your platform
3. If both parsers fail, the mock parser will be used, which may not provide full syntax tree functionality

## Configuration

The fallback parser behavior can be configured by setting environment variables:

- `OPENSCAD_PARSER_DISABLE_WEB=1`: Disables the web tree-sitter parser
- `OPENSCAD_PARSER_DISABLE_NATIVE=1`: Disables the native tree-sitter parser
- `OPENSCAD_PARSER_FORCE_MOCK=1`: Forces the use of the mock parser

## Testing

The fallback parser is tested in the project's test suite. The tests are designed to work with any of the three parser implementations, ensuring that the core functionality remains available regardless of the environment.
