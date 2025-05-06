# OpenSCAD Tree-sitter Grammar

A Tree-sitter grammar for the OpenSCAD language, providing parsing capabilities for Node.js and TypeScript applications.

## Project Structure

This project follows the recommended Tree-sitter project organization:

```
openscad-tree-sitter/
├── bindings/            # Language bindings
│   ├── c/               # C bindings
│   ├── go/              # Go bindings
│   ├── node/            # Node.js bindings
│   ├── rust/            # Rust bindings
│   └── swift/           # Swift bindings
├── examples/            # Example OpenSCAD files
├── grammar.js           # The grammar definition
├── queries/             # Tree-sitter queries
│   ├── highlights.scm   # Syntax highlighting
│   └── tags.scm         # Code navigation
├── src/                 # Generated parser code
├── test/                # Test files
│   ├── corpus/          # Test corpus
│   └── grammar/         # Vitest grammar tests
```

## Installation

```bash
npm install openscad-tree-sitter
# or
pnpm add openscad-tree-sitter
# or
yarn add openscad-tree-sitter
```

## Usage with Node.js

```javascript
const Parser = require('openscad-tree-sitter');

// Parse OpenSCAD code
const code = `cylinder(h=10, r=5);`;
const tree = Parser.parse(code);

// Access the parsed syntax tree
console.log(tree.rootNode.toString());
```

## Usage with TypeScript

```typescript
import { Parser } from 'openscad-tree-sitter';

// Parse OpenSCAD code
const code = `cylinder(h=10, r=5);`;
const tree = Parser.parse(code);

// Access the parsed syntax tree
console.log(tree.rootNode.toString());
```

## Development

### Prerequisites

- Node.js 12+
- pnpm, npm, or yarn

### Building the Project

```bash
# Clone the repository
git clone https://github.com/yourusername/openscad-tree-sitter.git
cd openscad-tree-sitter

# Install dependencies
pnpm install

# Generate the parser
pnpm build

# Run tests
pnpm test
```

### Building WebAssembly Version

```bash
# Build the WebAssembly module
pnpm build:wasm
```

## Testing

The project uses Vitest for all testing. Tests are organized into two main categories:

1. **Corpus Tests** - These validate the grammar against a collection of OpenSCAD code examples.
2. **Grammar Tests** - Targeted tests for specific grammar features.

### Running Tests

You can run tests using npm/pnpm scripts:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage report
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

The test suite checks various aspects of the grammar, including:
- Basic syntax elements (comments, variable assignments, modules, functions)
- Advanced features (list comprehensions, special variables, control structures)
- Improved language features (range expressions, array indexing, object literals)
- Grammar improvements and edge cases

## Improved Grammar Features

This grammar supports the full OpenSCAD language specification with additional improvements:

### Core Features
- Module definitions and instantiations
- Function definitions and calls
- Mathematical expressions
- Conditional statements
- For loops
- Include/use directives
- Variables and assignments

### Advanced Features
- List comprehensions with conditions
- Special variables ($fa, $fs, $fn, etc.)
- Multi-dimensional arrays
- Array slicing with range expressions
- Object literals for structured data
- Let expressions for local variable definitions
- Member access expressions
- Improved type handling (numbers, strings, booleans, undef)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tree-sitter team for the amazing parser generator
- OpenSCAD developers for the language specification 