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
   - Updated the ExpressionVisitor to use the specialized visitors for function calls, binary operations, and unary operations
   - Added comprehensive tests with real CST nodes (no mocks)

2. **Expression Types to Support**:
   - Binary expressions (arithmetic, logical, relational): +, -, *, /, %, ==, !=, <, <=, >, >=, &&, || (✓ Implemented)
   - Unary expressions: +, -, ! (negation, logical not) (✓ Implemented)
   - Conditional expressions: condition ? thenExpr : elseExpr (✓ Implemented)
   - Variable references: identifiers that refer to variables (✓ Implemented)
   - Literal values: numbers, strings, booleans (✓ Implemented)
   - Array/vector expressions: [1, 2, 3] (✓ Implemented)
   - Function calls: len(v), sin(x), etc. (✓ Implemented)

3. **Next Priority Tasks**:
   - Implement proper handling of array expressions
   - Add support for nested expressions with different operators
   - Add support for complex nested expressions with mixed operators
   - Add comprehensive tests for conditional expressions and parenthesized expressions

## Current Task Focus

With the UnaryExpressionVisitor implementation complete, we are now shifting focus to implementing the ConditionalExpressionVisitor:

1. **Expression Visitor Refactoring**:
   - ✅ Refactor the ExpressionVisitor to properly use the visitor pattern
   - ✅ Implement proper CST traversal instead of string manipulation
   - ✅ Create specialized methods for different expression types
   - ✅ Ensure proper handling of operator precedence
   - ✅ Implement proper function call handling in expressions

2. **Binary Operation Enhancement**:
   - ✅ Implement dedicated visitors for different binary operation types:
     - ✅ Arithmetic operations: +, -, *, /, %
     - ✅ Logical operations: &&, ||
     - ✅ Relational operations: ==, !=, <, <=, >, >=
   - ✅ Ensure proper operator precedence handling
   - ✅ Support nested binary expressions with different operators
   - [ ] Handle parenthesized expressions correctly

3. **Unary Operation Enhancement**:
   - ✅ Implement dedicated visitors for unary operations:
     - ✅ Arithmetic negation: -
     - ✅ Logical negation: !
     - ✅ Unary plus: +
   - ✅ Support nested unary expressions
   - ✅ Handle unary operations with complex operands

4. **Function Call Support**:
   - ✅ Implement proper function call handling in expressions
   - ✅ Support built-in functions like len(), sin(), cos(), etc.
   - ✅ Handle function calls with complex arguments
   - ✅ Support nested function calls

5. **Conditional Expression Enhancement**:
   - ✅ Implement ConditionalExpressionVisitor class
   - ✅ Extract condition, then branch, and else branch from CST nodes
   - ✅ Handle different node structures with fallback mechanisms
   - ✅ Support nested conditional expressions
   - ✅ Handle conditional expressions with complex conditions and branches
   - ✅ Update ExpressionVisitor to use ConditionalExpressionVisitor

6. **Parenthesized Expression Enhancement**:
   - ✅ Implement ParenthesizedExpressionVisitor class
   - ✅ Extract inner expressions from parenthesized expression nodes
   - ✅ Handle different node structures with fallback mechanisms
   - ✅ Support nested parenthesized expressions
   - ✅ Handle binary expressions inside parentheses
   - ✅ Update ExpressionVisitor to use ParenthesizedExpressionVisitor

## Next Steps

1. **Immediate Implementation Tasks**:
   - ✅ Create a proper implementation of createASTNodeForFunction in ExpressionVisitor
   - ✅ Refactor visitBinaryExpression to use proper CST traversal
   - ✅ Implement specialized visitors for different binary operation types
   - ✅ Implement UnaryExpressionVisitor for handling unary operations
   - ✅ Enhance visitUnaryExpression to use the UnaryExpressionVisitor
   - ✅ Create conditional-expression-visitor.ts file in the expression-visitor directory
   - ✅ Implement ConditionalExpressionVisitor class with proper CST traversal
   - ✅ Add ConditionalExpressionVisitor to ExpressionVisitor constructor
   - ✅ Update visitConditionalExpression to delegate to ConditionalExpressionVisitor
   - ✅ Create parenthesized-expression-visitor.ts file in the expression-visitor directory
   - ✅ Implement ParenthesizedExpressionVisitor class with proper CST traversal
   - ✅ Add ParenthesizedExpressionVisitor to ExpressionVisitor constructor
   - ✅ Update visitExpression to delegate to ParenthesizedExpressionVisitor
   - Implement proper handling of array expressions
   - Add support for nested expressions with different operators
   - [ ] Add support for complex nested expressions with mixed operators

2. **Testing Strategy**:
   - ✅ Create tests with real CST nodes instead of mocks
   - ✅ Test binary expressions with different operators
   - ✅ Test expressions with function calls
   - ✅ Test expressions with unary operations
   - ✅ Create conditional-expression-visitor.test.ts file
   - ✅ Test conditional expressions with different condition types
   - ✅ Test conditional expressions with complex then/else branches
   - ✅ Test nested conditional expressions
   - ✅ Create parenthesized-expression-visitor.test.ts file
   - ✅ Test basic parenthesized expressions
   - ✅ Test nested parenthesized expressions
   - ✅ Test parenthesized binary expressions
   - [ ] Test expressions with parentheses
   - [ ] Test complex nested expressions with different operators
   - [ ] Ensure proper operator precedence handling in complex expressions

3. **Implementation Details for ConditionalExpressionVisitor**:
   - ✅ Followed the same pattern as BinaryExpressionVisitor and UnaryExpressionVisitor
   - ✅ Used node.childForFieldName to extract condition, consequence, and alternative nodes
   - ✅ Implemented fallback mechanisms for different node structures
   - ✅ Added support for nested conditional expressions
   - ✅ Handled complex conditions and branches
   - ✅ Added comprehensive logging for better debugging
   - ✅ Created tests with real CST nodes (no mocks)

4. **Implementation Details for ParenthesizedExpressionVisitor**:
   - ✅ Followed the same pattern as other expression visitors
   - ✅ Used node.namedChild to extract inner expression nodes
   - ✅ Implemented fallback mechanisms for different node structures
   - ✅ Added support for nested parenthesized expressions
   - ✅ Handled binary expressions inside parentheses
   - ✅ Added comprehensive logging for better debugging
   - ✅ Created tests with real CST nodes (no mocks)

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
