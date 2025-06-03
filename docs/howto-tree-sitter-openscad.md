# Tree-Sitter OpenSCAD Commands

## Build Commands

```bash
# Generate grammar only
nx generate-grammar tree-sitter-openscad

# Build native bindings
nx build:native tree-sitter-openscad

# Build WebAssembly
nx build:wasm tree-sitter-openscad

# Build Node.js bindings
nx build:node tree-sitter-openscad
```

## Test Commands

```bash
# Run all tests
nx test tree-sitter-openscad

# Test specific file from corpus
nx test tree-sitter-openscad --file-name=advanced.txt
nx test tree-sitter-openscad --file-name=examples/example.scad
nx test tree-sitter-openscad --file-name=test/corpus/modules.txt
nx test tree-sitter-openscad --file-name=test/corpus/functions.txt

# Run tests with additional arguments
nx test tree-sitter-openscad -- --verbose
```

## Parse Commands

```bash
# Parse a specific file (interactive mode)
nx parse tree-sitter-openscad

# Parse specific file with direct command
nx parse tree-sitter-openscad -- examples/real-world/example020.scad
nx parse tree-sitter-openscad -- examples/basic/cube.scad
nx parse tree-sitter-openscad -- examples/advanced/modules.scad

# Parse with debug information
nx parse tree-sitter-openscad -- --debug examples/cube.scad

# Parse all real-world examples
nx parse:all tree-sitter-openscad
```

## Development Tools

```bash
# Launch Tree-sitter playground
nx playground tree-sitter-openscad
```

## Workflow Examples

```bash
# Full development cycle
nx generate-grammar tree-sitter-openscad
nx test tree-sitter-openscad
nx test tree-sitter-openscad --file-name=advanced.txt
nx parse tree-sitter-openscad -- examples/your-test-file.scad
nx parse:all tree-sitter-openscad
```