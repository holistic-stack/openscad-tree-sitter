# OpenSCAD Tree-sitter - Next Steps

This document outlines the progress made and the next steps to further enhance the OpenSCAD Tree-sitter grammar.

## Project Setup Completed

We've successfully set up the OpenSCAD Tree-sitter grammar:

✅ Project structure with all necessary directories
✅ Package.json with dependencies and scripts
✅ OpenSCAD grammar definition in grammar.js
✅ Syntax highlighting queries (highlights.scm)
✅ Code navigation tag queries (tags.scm)
✅ Basic test cases (all passing)
✅ Sample OpenSCAD files for testing
✅ Node.js bindings
✅ WebAssembly test UI

## Completed Tasks

### 1. Grammar Implementation
- ✅ Implemented all core OpenSCAD language constructs
- ✅ Fixed node field labeling for proper AST structure
- ✅ Handled operator precedence correctly
- ✅ Implemented string literals with different quotation types
- ✅ Added proper handling for module instantiations and function calls

### 2. Testing
- ✅ All test cases passing
- ✅ Verified grammar against real-world examples
- ✅ Implemented proper error recovery

### 3. Syntax Highlighting
- ✅ Created working highlights.scm query file
- ✅ Added highlighting for all important language constructs
- ✅ Fixed issues with node type references

### 4. Code Navigation
- ✅ Implemented tags.scm for symbol definitions and references
- ✅ Properly marked function and module definitions
- ✅ Added support for variable references

### 5. WebAssembly Test
- ✅ Created browser-based test UI
- ✅ Implemented JavaScript wrapper for WebAssembly module
- ✅ Added sample code examples for all language features
- ✅ Created documentation for building and running the test

## Next Steps

### 1. WebAssembly Support

```bash
# Install Emscripten SDK
# For Windows: 
# 1. Download the Emscripten SDK installer from https://emscripten.org/docs/getting_started/downloads.html
# 2. Run the installer and follow the instructions
# 3. Initialize the Emscripten environment

# Build the WebAssembly module
npx tree-sitter build --wasm

# Copy the WASM file to the web-test directory
copy tree-sitter-openscad.wasm web-test/

# Serve the web-test directory
cd web-test
python -m http.server 8000
# Or 
npx serve
```

### 2. Integration with Editors

#### For VSCode
1. Create a dedicated extension
2. Implement language configuration
3. Set up Tree-sitter WebAssembly integration
4. Add code intelligence features

#### For Neovim
1. Create a proper plugin
2. Add TreeSitter configuration
3. Implement custom queries for folding and indentation

### 3. Additional Language Features

1. **External Scanner**: If you encounter limitations with the current grammar, consider implementing an external scanner in C.
2. **Advanced Constructs**: Add support for more advanced OpenSCAD features like custom functions in scope.
3. **Error Recovery**: Enhance error recovery for common syntax errors.

### 4. Documentation and Examples

1. **Editor Integration Guides**: Create specific guides for different editors.
2. **Advanced Usage Examples**: Document how to use the grammar in custom applications.
3. **Performance Optimization**: Profile and optimize the parser for large files.

## Running the Project

### Generate the Parser

```bash
npx tree-sitter generate
```

### Run Tests

```bash
npx tree-sitter test
```

### Test with Real Files

```bash
npx tree-sitter parse examples/sample.scad
```

### Test WebAssembly (Once Built)

```bash
# Navigate to a browser at http://localhost:8000 after starting a local server
cd web-test
python -m http.server 8000
```

## Resources

- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [OpenSCAD Language Reference](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/The_OpenSCAD_Language)
- [Tree-sitter JavaScript Grammar](https://github.com/tree-sitter/tree-sitter-javascript) (good reference)
- [Emscripten Documentation](https://emscripten.org/docs/index.html)
- [web-tree-sitter Documentation](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web) 