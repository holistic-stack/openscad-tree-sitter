# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project aims to create a parser for OpenSCAD code using tree-sitter to generate a Concrete Syntax Tree (CST), and then convert that CST to an Abstract Syntax Tree (AST) with structured types. The parser leverages tree-sitter's capabilities, including treeCursor, queries, and other features to facilitate this transformation.

The project is structured as an Nx monorepo with PNPM workspaces, containing two main packages:
- **packages/tree-sitter-openscad**: Tree-sitter grammar for OpenSCAD
- **packages/openscad-parser**: TypeScript parser for OpenSCAD using the tree-sitter grammar

## Current Status

We have successfully completed the implementation of control structure visitors and are making excellent progress on enhancing expression handling:

1. **Expression Visitor Enhancement Progress**:
   - Implemented a dedicated FunctionCallVisitor to handle function calls in expressions
   - The FunctionCallVisitor extracts function names and arguments from CST nodes
   - Implemented a dedicated BinaryExpressionVisitor to handle binary operations in expressions
   - The BinaryExpressionVisitor extracts operators and operands from CST nodes with proper precedence
   - Implemented a dedicated UnaryExpressionVisitor to handle unary operations in expressions
   - The UnaryExpressionVisitor extracts operators and operands from CST nodes with fallback mechanisms
   - Implemented a dedicated ConditionalExpressionVisitor to handle conditional expressions
   - Implemented a dedicated ParenthesizedExpressionVisitor to handle parenthesized expressions
   - Updated the ExpressionVisitor to use the specialized visitors for all expression types
   - Added comprehensive tests with real CST nodes (no mocks)

2. **Expression Types to Support**:
   - Binary expressions (arithmetic, logical, relational): +, -, *, /, %, ==, !=, <, <=, >, >=, &&, || (✓ Implemented)
   - Unary expressions: +, -, ! (negation, logical not) (✓ Implemented)
   - Conditional expressions: condition ? thenExpr : elseExpr (✓ Implemented)
   - Variable references: identifiers that refer to variables (✓ Implemented)
   - Literal values: numbers, strings, booleans (✓ Implemented)
   - Array/vector expressions: [1, 2, 3] (✓ Implemented)
   - Function calls: len(v), sin(x), etc. (✓ Implemented)
   - Parenthesized expressions: (expr) (✓ Implemented)

3. **Next Priority Tasks**:
   - ✅ Add support for nested expressions with different operators
   - ✅ Implement proper handling of parenthesized expressions
   - Fix test failures in expression visitors:
     - Fix ParenthesizedExpressionVisitor tests
     - Fix ConditionalExpressionVisitor tests
     - Fix complex expression tests
     - Fix query visitor tests
   - Fix tree-sitter API compatibility issues
   - Fix transformation visitor tests

## Current Task Focus

We've made significant progress in fixing the expression visitor issues, but there are still several test failures that need to be addressed:

1. **Test Failures to Fix**:
   - Fix ParenthesizedExpressionVisitor tests:
     - The visitor is returning null instead of processing expressions
     - Need to implement proper handling of expressions inside parentheses
     - Need to fix the extraction of inner expressions
   - Fix ConditionalExpressionVisitor tests:
     - The visitor is returning null instead of processing conditional expressions
     - Need to implement proper handling of condition, consequence, and alternative
   - Fix complex expression tests:
     - The expressions are not being parsed correctly
     - Need to fix the handling of mixed operators and parentheses
   - Fix query visitor tests:
     - The query visitor is not finding the expected nodes
     - Need to ensure the query manager is properly handling different API formats

2. **Tree-sitter API Compatibility Issues**:
   - ✅ Fixed query manager to handle different API formats for tree-sitter queries
   - ✅ Added support for both the new array-based API and the old object-based API
   - ✅ Improved error handling in query execution
   - [ ] Fix remaining issues with query.matches function
   - [ ] Ensure compatibility with different tree-sitter versions

3. **Expression Visitor Implementation Issues**:
   - ✅ Implemented dedicated visitors for all expression types
   - ✅ Fixed circular dependency between ExpressionVisitor and specialized visitors
   - [ ] Fix inheritance structure for ParenthesizedExpressionVisitor
   - [ ] Fix inheritance structure for ConditionalExpressionVisitor
   - [ ] Implement proper visitExpression method in specialized visitors
   - [ ] Fix method delegation in ExpressionVisitor

4. **Transformation Visitor Issues**:
   - [ ] Fix vector property extraction in transform visitors
   - [ ] Ensure proper handling of transform parameters
   - [ ] Fix the extraction of transformation parameters
   - [ ] Update tests to match the actual behavior of the parser

5. **Query Visitor Issues**:
   - [ ] Fix query visitor to find the expected nodes
   - [ ] Ensure proper handling of different node types in queries
   - [ ] Update tests to use the correct query syntax
   - [ ] Add better error handling for query failures

## Next Steps

1. **Immediate Implementation Tasks**:
   - Fix ParenthesizedExpressionVisitor implementation:
     - Implement proper visitParenthesizedExpression method
     - Fix the extraction of inner expressions
     - Ensure proper handling of binary expressions inside parentheses
   - Fix ConditionalExpressionVisitor implementation:
     - Implement proper visitConditionalExpression method
     - Fix the extraction of condition, consequence, and alternative
     - Ensure proper handling of complex conditions and branches
   - Fix query manager implementation:
     - Ensure proper handling of different tree-sitter API formats
     - Fix query.matches function to find the expected nodes
     - Add better error handling for query failures
   - Fix transformation visitor implementation:
     - Fix vector property extraction in transform visitors
     - Ensure proper handling of transform parameters
     - Update tests to match the actual behavior of the parser

2. **Testing Strategy**:
   - Fix existing test failures:
     - Fix ParenthesizedExpressionVisitor tests
     - Fix ConditionalExpressionVisitor tests
     - Fix complex expression tests
     - Fix query visitor tests
     - Fix transformation visitor tests
   - Add additional tests:
     - Test expressions with parentheses
     - Test complex nested expressions with different operators
     - Test expressions with mixed operators and parentheses
     - Ensure proper operator precedence handling in complex expressions

3. **Implementation Details for Expression Visitor Fixes**:
   - Fix inheritance structure for specialized visitors:
     - Ensure proper inheritance from BaseASTVisitor
     - Fix circular dependencies between visitors
     - Implement proper method delegation
   - Fix method implementation in specialized visitors:
     - Implement proper visitExpression methods
     - Fix the extraction of inner expressions
     - Ensure proper handling of complex expressions
   - Add better error handling and logging:
     - Add detailed error messages for parsing failures
     - Implement graceful degradation for unparseable expressions
     - Add comprehensive logging for better debugging

4. **Implementation Details for Query Manager Fixes**:
   - Fix API compatibility issues:
     - Support both new and old tree-sitter query APIs
     - Add proper type checking for API methods
     - Implement fallback mechanisms for different API versions
   - Fix query execution:
     - Ensure proper handling of different node types
     - Fix query.matches function to find the expected nodes
     - Add better error handling for query failures

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
