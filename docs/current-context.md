# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project aims to create a parser for OpenSCAD code using tree-sitter to generate a Concrete Syntax Tree (CST), and then convert that CST to an Abstract Syntax Tree (AST) with structured types. The parser leverages tree-sitter's capabilities, including treeCursor, queries, and other features to facilitate this transformation.

The project is structured as an Nx monorepo with PNPM workspaces, containing two main packages:
- **packages/tree-sitter-openscad**: Tree-sitter grammar for OpenSCAD
- **packages/openscad-parser**: TypeScript parser for OpenSCAD using the tree-sitter grammar

## Current Status

We have successfully completed the implementation of control structure visitors and are now focusing on enhancing expression handling:

1. **Expression Visitor Enhancement Progress**:
   - Implemented a dedicated FunctionCallVisitor to handle function calls in expressions
   - The FunctionCallVisitor extracts function names and arguments from CST nodes
   - Updated the ExpressionVisitor to use the FunctionCallVisitor for function calls
   - Added comprehensive tests with real CST nodes (no mocks)

2. **Expression Types to Support**:
   - Binary expressions (arithmetic, logical, relational): +, -, *, /, %, ==, !=, <, <=, >, >=, &&, ||
   - Unary expressions: +, -, ! (negation, logical not)
   - Conditional expressions: condition ? thenExpr : elseExpr
   - Variable references: identifiers that refer to variables
   - Literal values: numbers, strings, booleans
   - Array/vector expressions: [1, 2, 3]
   - Function calls: len(v), sin(x), etc. (✓ Implemented)

3. **Next Steps**:
   - Implement BinaryExpressionVisitor to handle binary operations with proper precedence
   - Implement UnaryExpressionVisitor to handle unary operations
   - Update the main ExpressionVisitor to use the specialized visitors
   - Add comprehensive tests for complex nested expressions
   - Ensure proper handling of operator precedence

## Current Task Focus

With the Control Structure Visitors implementation complete, we are now shifting focus to the next priority areas:

1. **Expression Visitor Refactoring**:
   - Refactor the ExpressionVisitor to properly use the visitor pattern
   - Implement proper CST traversal instead of string manipulation
   - Create specialized methods for different expression types
   - Ensure proper handling of operator precedence
   - Implement proper function call handling in expressions

2. **Binary Operation Enhancement**:
   - Implement dedicated visitors for different binary operation types:
     - Arithmetic operations: +, -, *, /, %
     - Logical operations: &&, ||
     - Relational operations: ==, !=, <, <=, >, >=
   - Ensure proper operator precedence handling
   - Support nested binary expressions with different operators
   - Handle parenthesized expressions correctly

3. **Unary Operation Enhancement**:
   - Implement dedicated visitors for unary operations:
     - Arithmetic negation: -
     - Logical negation: !
   - Support nested unary expressions
   - Handle unary operations with complex operands

4. **Function Call Support**:
   - Implement proper function call handling in expressions
   - Support built-in functions like len(), sin(), cos(), etc.
   - Handle function calls with complex arguments
   - Support nested function calls

## Next Steps

1. **Immediate Implementation Tasks**:
   - Create a proper implementation of createASTNodeForFunction in ExpressionVisitor
   - Refactor visitBinaryExpression to use proper CST traversal
   - Implement specialized visitors for different binary operation types
   - Enhance unary expression handling with proper CST traversal
   - Add support for function calls in expressions

2. **Testing Strategy**:
   - Create tests with real CST nodes instead of mocks
   - Test complex nested expressions with different operators
   - Test expressions with function calls
   - Test expressions with variable references
   - Ensure proper operator precedence handling

## Architecture

The parser follows a visitor-based approach for CST to AST conversion:

1. **Parsing Phase**: Tree-sitter generates a CST from OpenSCAD code
2. **Visitation Phase**: Specialized visitors traverse the CST and convert nodes to AST
3. **Transformation Phase**: AST nodes are created based on extracted parameters and children

### Monorepo Structure

The project is organized as an Nx monorepo with the following structure:

```
openscad-tree-sitter/
├── packages/
│   ├── tree-sitter-openscad/   # Tree-sitter grammar package
│   │   ├── bindings/           # Language bindings
│   │   ├── examples/           # Example OpenSCAD files
│   │   ├── grammar.js          # The grammar definition
│   │   ├── queries/            # Tree-sitter queries
│   │   ├── src/                # Source code
│   │   ├── test/               # Tests for the grammar
│   │   └── project.json        # Nx project configuration
│   │
│   └── openscad-parser/        # TypeScript parser package
│       ├── src/                # Source code
│       │   └── lib/            # Library code
│       ├── test/               # Tests for the parser
│       └── project.json        # Nx project configuration
│
├── nx.json                     # Nx configuration
└── pnpm-workspace.yaml         # PNPM workspace configuration
```

### Parser Components

Key components include:
- `BaseASTVisitor`: Base implementation of the visitor pattern
- Specialized visitors for different node types (primitives, transformations, CSG operations, modules, functions, control structures)
- Parameter extractors for handling arguments and parameters in different formats
- Module parameter extractor for handling module and function parameters with default values
- Control structure visitors for handling if-else statements and for loops
- Type evaluators for converting parsed values to appropriate types

## Implementation Details

The implementation uses a combination of:
- Tree-sitter queries for identifying node patterns
- Visitor pattern for traversal and transformation
- Adapter pattern for node conversion
- Factory methods for AST node creation
- Type guards for runtime type safety

## Documentation and Testing

Comprehensive documentation and testing are essential for this project:
- Each AST node type has documented parameter patterns
- Tests cover both valid and invalid inputs
- Edge cases are explicitly tested to ensure robustness
- Performance considerations are documented for critical paths

### Testing Commands

```bash
# Run all tests
pnpm test

# Run tests for specific packages
pnpm test:grammar   # Test the tree-sitter grammar
pnpm test:parser    # Test the TypeScript parser

# Run tests with watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test files
nx test openscad-parser --testFile=src/lib/feature/feature.test.ts
```

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build:grammar  # Build the tree-sitter grammar
pnpm build:parser   # Build the TypeScript parser

# Development mode (watch mode)
pnpm dev
pnpm dev:parser     # Development mode for parser only
```

### Debugging Commands

```bash
# Parse OpenSCAD files with tree-sitter
pnpm parse <file.scad>

# Open the tree-sitter playground
pnpm playground
```
