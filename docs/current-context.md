# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project is an Nx monorepo with PNPM workspaces that provides robust parsing of OpenSCAD code. The project converts OpenSCAD code into a structured Abstract Syntax Tree (AST) using tree-sitter for initial parsing.

## Current Status (2025-01-08)

**🔄 CRITICAL PRIORITY: Test Infrastructure Modernization**
**✅ Error Handling Implementation COMPLETED**
**✅ Tree-sitter Expression Sub-Visitor Implementation COMPLETED**

### Current Task: Test Infrastructure Modernization with Real Parser Pattern

**Status**: Phase 3 - Test Infrastructure Fixes (In Progress)

**Objective**: Complete the error handling integration by systematically applying the real parser pattern to all test files, eliminating mocks and ensuring proper test infrastructure as outlined in TODO.md.

### Progress Summary

**Errors Reduced**: From 173 to 121 compilation errors (52 errors fixed - 30% improvement)

**✅ Completed (Phases 1-3)**:
1. **AST Node Type Inheritance**: Updated node types to properly extend ExpressionNode
2. **Return Type Compatibility**: Fixed `visitLetExpression` method signatures across interfaces and implementations
3. **Variable Visitor Issues**: Fixed null assignment and return type issues
4. **QueryVisitor Constructor**: Added ErrorHandler parameter support
5. **Error Context Interface**: Added missing properties for error handling strategies
6. **Type Mismatch Strategy**: Added missing `replaceAtPosition` method and fixed type handling
7. **Real Parser Pattern Implementation**: Successfully applied to multiple test files following best practices

**🔄 In Progress (Phase 3)**:
**Current Focus**: Systematic application of real parser pattern to all test files

**Real Parser Pattern Applied To**:
- ✅ `binary-expression-visitor.test.ts` - Updated with real OpenscadParser instances
- ✅ `primitive-visitor.test.ts` - Added proper beforeEach/afterEach setup
- ✅ `control-structure-visitor.test.ts` - Added ErrorHandler parameter
- ✅ `composite-visitor.test.ts` - Added ErrorHandler imports and setup

**Remaining Critical Issues (121 errors)**:
1. **Constructor Parameter Issues**: ~70+ test files still need ErrorHandler parameters added
2. **Import Path Issues**: Several test files have incorrect import paths
3. **Type Mismatch Issues**: Some error context properties have type conflicts
4. **Missing Abstract Method Implementations**: Some visitor classes missing required abstract methods

## Key Decisions Made

### Real Parser Pattern Implementation
- **Decision**: Eliminate all mocks for OpenscadParser and use real parser instances in tests
- **Impact**: Provides better integration testing and aligns with TDD best practices
- **Pattern**: Use beforeEach/afterEach for proper parser lifecycle management
- **Rationale**: Ensures tests reflect real-world usage and catch integration issues

### Error Handling Integration Strategy
- **Decision**: All visitor constructors require ErrorHandler parameter for consistent error handling
- **Impact**: Requires updating all test files to provide ErrorHandler instances
- **Rationale**: Enables comprehensive error reporting and recovery strategies

### Test Infrastructure Modernization
- **Decision**: Systematically apply real parser pattern to all test files
- **Impact**: Improves test reliability and eliminates mock-related issues
- **Rationale**: Aligns with project coding best practices and TDD principles

## Next Steps

### Phase 3: Complete Test Infrastructure Modernization (Current)
1. **Apply Real Parser Pattern**: Continue systematic application to remaining ~70+ test files
2. **Fix Constructor Issues**: Add ErrorHandler parameters to all visitor constructors in tests
3. **Fix Import Paths**: Correct import paths in test files
4. **Fix Type Mismatches**: Resolve remaining type compatibility issues

### Phase 4: Comprehensive Testing (Next)
1. **Run Full Test Suite**: Execute `pnpm nx test openscad-parser`
2. **Validate Expression Handling**: Ensure all expression types parse correctly
3. **Test Error Recovery**: Verify error handling strategies work as expected

## Implementation Guidelines

### Real Parser Pattern Template
```typescript
describe("VisitorName", () => {
  let parser: OpenscadParser;
  let errorHandler: ErrorHandler;
  let visitor: VisitorName;

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new OpenscadParser();

    // Initialize the parser
    await parser.init();

    errorHandler = new ErrorHandler();
    visitor = new VisitorName('source code', errorHandler);
  });

  afterEach(() => {
    // Clean up after each test
    parser.dispose();
  });
});
```

### Constructor Pattern for Visitors
```typescript
// All visitor constructors should follow this pattern
constructor(
  sourceCode: string,
  errorHandler: ErrorHandler,
  // additional parameters as needed
) {
  super(sourceCode);
  this.errorHandler = errorHandler;
}
```

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
