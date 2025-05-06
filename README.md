# OpenSCAD Tree-sitter Grammar

A Tree-sitter grammar for the OpenSCAD language, providing parsing capabilities for Node.js and TypeScript applications.

## Project Structure

This project follows the recommended Tree-sitter project organization:

```
openscad-tree-sitter/
├── bindings/            # Language bindings
│   └── node/            # Node.js bindings
├── examples/            # Example OpenSCAD files
├── grammar.js           # The grammar definition
├── queries/             # Tree-sitter queries
│   ├── highlights.scm   # Syntax highlighting
│   └── tags.scm         # Code navigation
├── src/                 # Generated parser code
├── test/                # Test files
│   └── corpus/          # Test corpus
└── web-test/            # WebAssembly testing (planned)
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

## Features

This grammar supports:

- Module definitions and instantiations
- Function definitions and calls
- Mathematical expressions
- Conditional statements
- For loops
- Include/use directives
- Variables and assignments
- And more...

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