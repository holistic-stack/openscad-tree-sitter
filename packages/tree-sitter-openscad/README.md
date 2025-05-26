# Tree-sitter OpenSCAD Grammar

A Tree-sitter grammar for the OpenSCAD language, providing syntax highlighting, parsing, and code analysis capabilities.

## Overview

This package contains the Tree-sitter grammar definition for OpenSCAD and provides both WebAssembly (WASM) and native Node.js bindings for parsing OpenSCAD code.

## Pre-built Distribution

**For most users**: This package ships with a pre-built WASM file (`tree-sitter-openscad.wasm`) that works out-of-the-box without requiring any native compilation toolchain. The WASM file is automatically used by the `packages/openscad-parser` package.

## Native Development Setup

**For grammar developers only**: If you need to modify the grammar or rebuild the parser from source, you'll need to install the native compilation toolchain.

### Prerequisites

#### Windows
- **Visual Studio Build Tools** or **Visual Studio Community** with C++ development tools
- **Python 3.x** (required by node-gyp)
- **Node.js** (latest LTS version)
- **PNPM** (v10.10.0 or later)

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`
- **Python 3.x** (usually pre-installed)
- **Node.js** (latest LTS version)
- **PNPM** (v10.10.0 or later)

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install build-essential python3 python3-dev
```

#### Linux (CentOS/RHEL/Fedora)
```bash
sudo yum groupinstall "Development Tools"
sudo yum install python3 python3-devel
```

### Native Build Commands

Once you have the prerequisites installed, you can use these commands for local development:

#### Build WASM Only
```bash
# From monorepo root
pnpm build:grammar:wasm

# Or from package directory
cd packages/tree-sitter-openscad
pnpm build:wasm
```

#### Build Native + WASM
```bash
# From monorepo root
pnpm build:grammar:native

# Or from package directory
cd packages/tree-sitter-openscad
pnpm build:native
```

#### Build Node.js Bindings Only
```bash
# From package directory
cd packages/tree-sitter-openscad
pnpm build:node
```

### Development Workflow

1. **Modify Grammar**: Edit `grammar.js` to add or modify language rules
2. **Test Grammar**: Run `pnpm test` to validate grammar changes
3. **Rebuild Parser**: Run `pnpm build:wasm` to generate new WASM file
4. **Test Integration**: Test with the `openscad-parser` package

### Troubleshooting

#### Common Issues

**"Python not found" or "Visual Studio not found"**
- Ensure you have the correct build tools installed for your platform
- On Windows, make sure Visual Studio Build Tools includes the C++ compiler

**"node-gyp rebuild failed"**
- Check that Python and build tools are properly installed
- Try clearing node_modules and reinstalling: `pnpm clean && pnpm install`

**"tree-sitter command not found"**
- The tree-sitter CLI is installed as a dev dependency
- Use `pnpm` commands which will use the local installation

#### Getting Help

If you encounter issues with native compilation:
1. Check that all prerequisites are installed
2. Try the troubleshooting steps above
3. For grammar development questions, open an issue in the repository

## Files and Structure

### Source Files
- `grammar.js` - Main grammar definition
- `queries/` - Tree-sitter queries for syntax highlighting
- `examples/` - Sample OpenSCAD files for testing

### Generated Files (created during build)
- `src/parser.c` - Generated C parser implementation
- `src/grammar.json` - JSON representation of the grammar
- `src/node-types.json` - AST node type definitions
- `tree-sitter-openscad.wasm` - WebAssembly binary

### Bindings
- `bindings/node/` - Node.js native bindings
- `bindings/web/` - Web/WASM bindings
- `bindings/c/` - C library bindings
- `bindings/python/` - Python bindings
- `bindings/rust/` - Rust bindings
- `bindings/go/` - Go bindings

## Usage

### In Node.js
```javascript
const Parser = require('tree-sitter');
const OpenSCAD = require('@openscad/tree-sitter-openscad');

const parser = new Parser();
parser.setLanguage(OpenSCAD);

const sourceCode = 'cube(10);';
const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### In Browser (WASM)
```javascript
import Parser from 'web-tree-sitter';

await Parser.init();
const parser = new Parser();
const OpenSCAD = await Parser.Language.load('/path/to/tree-sitter-openscad.wasm');
parser.setLanguage(OpenSCAD);

const sourceCode = 'cube(10);';
const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

## Contributing

When contributing to the grammar:
1. Modify `grammar.js` with your changes
2. Add test cases to the `test/corpus/` directory
3. Run `pnpm test` to validate your changes
4. Rebuild the parser with `pnpm build:wasm`
5. Test integration with the parser package

## License

MIT License - see LICENSE file for details.
