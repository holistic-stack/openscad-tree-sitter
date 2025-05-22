# OpenSCAD Tree-Sitter Monorepo

This monorepo contains packages for parsing and working with OpenSCAD files using Tree-sitter.

## Repository Structure

This is an Nx monorepo with PNPM workspaces containing the following packages:

- **packages/tree-sitter-openscad**: Tree-sitter grammar for OpenSCAD
- **packages/openscad-parser**: TypeScript parser for OpenSCAD using the tree-sitter grammar

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PNPM (v7 or later)

### Installation

```bash
# Clone the repository
git clone https://github.com/user/openscad-tree-sitter.git
cd openscad-tree-sitter

# Install dependencies
pnpm install
```

## Development Workflow

### Building Packages

```bash
# Build all packages
pnpm nx run-many --target=build --all

# Build a specific package
pnpm nx build tree-sitter-openscad
pnpm nx build openscad-parser
```

### Running Tests

```bash
# Run all tests
pnpm nx run-many --target=test --all

# Test a specific package
pnpm nx test tree-sitter-openscad
pnpm nx test openscad-parser
```

### Development Server

For the parser package, you can start a development server:

```bash
pnpm nx serve openscad-parser
```

### Linting

```bash
# Lint all packages
pnpm nx run-many --target=lint --all

# Lint a specific package
pnpm nx lint tree-sitter-openscad
pnpm nx lint openscad-parser
```

## Package Details

### tree-sitter-openscad

This package contains the Tree-sitter grammar for OpenSCAD. It includes:

- Grammar definition (`grammar.js`)
- Query files for syntax highlighting and code folding
- Bindings for Node.js and WebAssembly
- Test corpus and examples

#### Usage

```javascript
const Parser = require('@openscad/tree-sitter-openscad');
const parser = new Parser();
const tree = parser.parse('cube([10, 10, 10]);');
```

### openscad-parser

This package provides a TypeScript parser for OpenSCAD that uses the tree-sitter grammar to generate an Abstract Syntax Tree (AST).

#### Usage

```typescript
import { OpenscadParser } from '@openscad/parser';

const parser = new OpenscadParser();
const ast = parser.parse('cube([10, 10, 10]);');
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `pnpm nx affected:test`
4. Submit a pull request

## Nx Commands

This repository uses Nx for task running and dependency management. Here are some useful commands:

```bash
# Run a target for all affected projects
pnpm nx affected --target=build

# View the project dependency graph
pnpm nx graph

# Run a target with caching
pnpm nx build tree-sitter-openscad --skip-nx-cache=false
```

## License

MIT
