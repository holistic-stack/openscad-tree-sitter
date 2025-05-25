# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project is an Nx monorepo with PNPM workspaces that provides robust parsing of OpenSCAD code. The project converts OpenSCAD code into a structured Abstract Syntax Tree (AST) using tree-sitter for initial parsing.

## Current Status (2025-05-24)

**✅ Error Handling Implementation COMPLETED**
**✅ Tree-sitter Expression Sub-Visitor Implementation COMPLETED**

### Recent Accomplishments
- ✅ **COMPLETED**: Implemented comprehensive error handling system with recovery strategies
- ✅ **COMPLETED**: Added support for various error types (SyntaxError, TypeError, ValidationError, ReferenceError)
- ✅ **COMPLETED**: Created recovery strategies for common syntax errors (missing semicolons, unclosed brackets)
- ✅ **COMPLETED**: Enhanced error reporting with detailed context information
- ✅ **COMPLETED**: Implemented core error handling classes (ErrorHandler, Logger, RecoveryStrategyRegistry)
- ✅ **COMPLETED**: All error handling integration tests passing (13/13 tests)
- ✅ **COMPLETED**: Implemented and integrated Tree-sitter based expression sub-visitors (`BinaryExpressionVisitor`, `UnaryExpressionVisitor`, `ConditionalExpressionVisitor`, `ParenthesizedExpressionVisitor`).

### Current Focus (as of 2025-05-24)
- **Refining Tree-sitter Based Expression Parsing**:
  - **Goal**: Ensure robust and correct parsing of all OpenSCAD expressions using the newly integrated Tree-sitter visitors.
  - **Priorities**:
    1.  **✅ COMPLETED (2025-05-24)**: **Review and Refine `ExpressionVisitor.visitExpression`**: Critically reviewed and restored the main dispatch method in `ExpressionVisitor.ts`. It now correctly handles all expression types, delegates appropriately to existing or new stub methods, and uses the `ErrorHandler` for logging. Concerns about previously lost logic have been addressed.
    2.  **✅ COMPLETED (2025-05-24)**: **Cleanup `ExpressionVisitor.ts` and Sub-Visitors**: Reviewed `ExpressionVisitor.ts` and its sub-visitors (`BinaryExpressionVisitor`, `UnaryExpressionVisitor`, `ConditionalExpressionVisitor`, `ParenthesizedExpressionVisitor`). `ExpressionVisitor.ts` was updated via overwrite, ensuring no temporary logs and that obsolete methods were handled. Sub-visitors were found to be already clean, using `this.errorHandler` correctly and containing no temporary logs or obsolete methods. Intentional stubs for future work remain. Ensured consistent use of `this.errorHandler` for logging.
    3.  **Comprehensive Testing**: Execute all parser tests (`pnpm nx test openscad-parser`) to validate the new expression handling logic and fix any identified issues.

### Next Steps
- Complete the review and cleanup of `ExpressionVisitor.ts` and its sub-visitors.
- Achieve a stable and fully tested Tree-sitter based expression parsing module.
- Proceed with remaining items in `TODO.md` once expression parsing is solidified.

## Key Components and Architecture

### AST Node Types
- `ExpressionNode`: Base type for all expressions
- `BinaryExpressionNode`: For binary operations (+, -, *, /, &&, ||, ==, etc.)
- `UnaryExpressionNode`: For unary operations (-, !)
- `ConditionalExpressionNode`: For ternary operator (condition ? then : else)
- `LiteralNode`: For numbers, strings, booleans
- `VariableReferenceNode`: For variable usage
- `FunctionCallNode`: For function calls
- `ModuleInstantiationNode`: For module calls
- `AssignmentNode`: For variable assignments
- `IncludeNode`, `UseNode`: For including/using external files
- `BlockNode`: For groups of statements
- `IfNode`, `ForLoopNode`, `IntersectionForNode`: For control structures
- `ModuleDefinitionNode`, `FunctionDefinitionNode`: For defining modules/functions
- `EmptyNode`: Represents an empty statement or placeholder

### Visitor Implementation
- `BaseASTVisitor`: Abstract base class for all visitors
- Specialized visitors for each AST node type (e.g., `BinaryExpressionVisitor`, `FunctionCallVisitor`)
- `ExpressionVisitor`: Handles dispatching to various expression sub-visitors
- `StatementVisitor`: Handles dispatching to various statement visitors
- `OpenSCADParser`: Main parser class orchestrating the parsing process and CST to AST conversion

### Utility Functions
- `location-utils`: For extracting node location information (start/end line/column)
- `node-utils`: For common CST node operations (finding descendants, checking types)
- `value-extractor`: For converting literal string values from CST to their actual types (number, boolean, string)

### Error Handling Components
- `ErrorHandler`: Centralized error handling and reporting system
- Error types: `SyntaxError`, `TypeError`, `ValidationError`, `ReferenceError`
- Recovery strategies: `MissingClosingParenthesisStrategy`, `MissingSemicolonStrategy`, `UnbalancedBracesStrategy`
- `RecoveryStrategyRegistry`: Manages and applies recovery strategies
- `Logger`: System for logging messages with different severity levels

## Implementation Details

The implementation uses a combination of:
- Tree-sitter queries for identifying node patterns
- Visitor pattern for traversal and transformation
- Adapter pattern for node conversion
- Factory methods for AST node creation
- Type guards for runtime type safety
- Strategy pattern for error recovery
- Observer pattern for logging and error reporting
- Chain of responsibility for error handling

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
