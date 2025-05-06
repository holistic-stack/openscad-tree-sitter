# OpenSCAD Tree-sitter Grammar

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the [OpenSCAD](https://openscad.org/) language. This grammar provides incremental parsing capabilities for OpenSCAD files, enabling syntax highlighting, code navigation, and more in editors that support Tree-sitter.

## Current Status

- ✅ Core grammar implementation complete
- ✅ All tests passing
- ✅ Node.js bindings working
- ✅ Syntax highlighting queries (highlights.scm)
- ✅ Code navigation queries (tags.scm)
- ❌ WebAssembly build (requires Emscripten)

The grammar supports all core OpenSCAD syntax features:
- Module definitions and instantiations
- Function definitions and calls
- Variables and assignments
- Mathematical and boolean expressions
- Conditionals
- Let expressions
- Include and use statements
- Vector expressions and indexing
- Range expressions
- Comments (line and block)

## Features

- Complete OpenSCAD syntax support
- Real-time incremental parsing
- Syntax highlighting rules
- Code navigation (symbols, definitions, references)
- Error recovery

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (>=14.0.0)
- A C compiler (for building the parser)

### For Development

1. Clone the repository:
   ```
   git clone https://github.com/user/openscad-tree-sitter.git
   cd openscad-tree-sitter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate the parser:
   ```
   npx tree-sitter generate
   ```

4. Run tests:
   ```
   npx tree-sitter test
   ```

5. Parse a sample file:
   ```
   npx tree-sitter parse test.scad
   ```

## Structure

- `grammar.js` - The main grammar definition
- `queries/highlights.scm` - Syntax highlighting rules
- `queries/tags.scm` - Code navigation rules
- `test/corpus/` - Test cases
- `examples/` - Example OpenSCAD files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Work

- Add WebAssembly support
- Implement playground for interactive testing
- Expand test corpus for edge cases
- Add specific editor integration guides
- Support for more complex OpenSCAD features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- [OpenSCAD](https://openscad.org/) team for the language
- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) team for the parsing technology 