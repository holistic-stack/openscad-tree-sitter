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

# OpenSCAD Tree-sitter WebAssembly Test

This directory contains a browser-based test for the OpenSCAD Tree-sitter grammar using WebAssembly.

## Prerequisites

Before using this test, you need to build the WebAssembly version of the parser using Docker:

1. Build the WebAssembly module using Docker:
   ```bash
   # From the root directory of the project
   npm run docker:build-wasm
   npm run docker:extract-wasm
   ```

This will create the `tree-sitter-openscad.wasm` file in this directory.

## Running the Test

There are several ways to run the test:

### Using a Local Web Server

1. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/
   ```

### Using Visual Studio Code

If you're using Visual Studio Code, you can use the Live Server extension:

1. Install the "Live Server" extension
2. Right-click on `index.html` and select "Open with Live Server"

## Using the Test Page

The test page provides:

1. A dropdown menu to select example OpenSCAD code
2. A text area to edit or enter your own OpenSCAD code
3. A "Parse" button to trigger parsing
4. An output area showing the parse tree result

## Troubleshooting

If you encounter issues:

1. **WASM file not found**: Make sure you've built the WebAssembly module using Docker
2. **CORS errors**: You must use a web server, opening the HTML file directly might cause CORS issues
3. **Parser initialization fails**: Check the browser console for more detailed error messages

## Building a Complete WebAssembly Integration

For a complete WebAssembly integration in a real application:

1. Create a proper npm package for browser use
2. Add TypeScript typings for improved developer experience
3. Implement proper error handling and recovery
4. Add syntax highlighting and code navigation using the query files
5. Consider using a bundler like webpack or rollup
6. Follow the memory management practices in the implementation (tree.delete()) 