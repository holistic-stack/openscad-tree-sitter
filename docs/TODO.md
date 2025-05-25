# OpenSCAD Parser TODO List

This document outlines the remaining tasks and future enhancements for the OpenSCAD parser.

## CRITICAL PRIORITY: Test Infrastructure Modernization with Real Parser Pattern
- **Objective**: Complete the systematic application of real parser pattern to all test files, eliminating mocks and ensuring proper test infrastructure to enable comprehensive testing.
- **Status**: In Progress - 30% improvement achieved (52 errors fixed, 121 remaining)
- **Current Phase**: Test Infrastructure Modernization
- **Tasks**:
  - **Real Parser Pattern Application**:
    - [x] Applied to `binary-expression-visitor.test.ts` - Updated with real OpenscadParser instances
    - [x] Applied to `primitive-visitor.test.ts` - Added proper beforeEach/afterEach setup
    - [x] Applied to `control-structure-visitor.test.ts` - Added ErrorHandler parameter
    - [x] Applied to `composite-visitor.test.ts` - Added ErrorHandler imports and setup
    - [ ] **CRITICAL: Apply to remaining ~70+ test files**: Systematically update all remaining test files with real parser pattern
  - **Constructor Parameter Issues (121 errors)**:
    - [ ] Fix ~70+ test files that need ErrorHandler parameters added to visitor constructors
    - [ ] Update all visitor instantiations in tests to include ErrorHandler parameter
    - [ ] Ensure consistent constructor pattern across all visitor classes
  - **Import Path Issues**:
    - [ ] Fix incorrect import paths in test files (e.g., '../expression-visitor' paths)
    - [ ] Correct relative import paths for ErrorHandler and other dependencies
    - [ ] Standardize import patterns across all test files
  - **Type Mismatch Issues**:
    - [ ] Fix error context properties that have type conflicts (string vs string[])
    - [ ] Resolve remaining type compatibility issues in error handling strategies
    - [ ] Ensure consistent typing across all visitor interfaces
  - **Missing Abstract Method Implementations**:
    - [ ] Implement missing `createASTNodeForFunction` methods in visitor classes
    - [ ] Add missing `getLocation` methods where required
    - [ ] Complete visitor class implementations to satisfy abstract base class requirements
  - **Comprehensive Testing**:
    - [ ] Run `pnpm nx test openscad-parser` and ensure all tests pass after infrastructure fixes
    - [ ] Validate that real parser instances work correctly in all test scenarios
    - [ ] Ensure proper test isolation and cleanup with new pattern

## Implementation Guidelines and Templates

### Real Parser Pattern Template
Use this template for all test files:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenscadParser } from '../../openscad-parser';
import { ErrorHandler } from '../../error-handling';
import { VisitorName } from './visitor-name';

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

  // Test cases here...
});
```

### Constructor Pattern for Visitors
All visitor constructors should follow this pattern:

```typescript
constructor(
  sourceCode: string,
  errorHandler: ErrorHandler,
  // additional parameters as needed
) {
  super(sourceCode);
  this.errorHandler = errorHandler;
}
```

### Systematic Approach for Fixing Test Files

1. **Add Required Imports**:
   ```typescript
   import { ErrorHandler } from '../../error-handling';
   import { OpenscadParser } from '../../openscad-parser';
   ```

2. **Update Test Setup**:
   - Add `beforeEach` with parser initialization
   - Add `afterEach` with parser disposal
   - Create ErrorHandler instance

3. **Fix Constructor Calls**:
   - Add ErrorHandler parameter to all visitor constructors
   - Update any mock visitor instances

4. **Fix Import Paths**:
   - Correct relative paths for imports
   - Ensure all dependencies are properly imported

5. **Test and Validate**:
   - Run individual test file to verify fixes
   - Ensure no new errors introduced

### Priority Order for Test File Updates

**High Priority (Core Functionality)**:
1. Expression visitor tests
2. Primitive visitor tests
3. Transform visitor tests
4. CSG visitor tests
5. Control structure visitor tests

**Medium Priority (Supporting Features)**:
6. Function visitor tests
7. Module visitor tests
8. Variable visitor tests
9. Query visitor tests

**Low Priority (Utilities)**:
10. Utility function tests
11. Helper class tests

## COMPLETED: Consolidate Parser on Pure Tree-sitter
- **Objective**: Remove all ANTLR remnants. Ensure `ExpressionVisitor.ts` and its sub-visitors are purely Tree-sitter based, correctly implemented, and robustly tested.
- **Status**: ✅ COMPLETED - Sub-visitor implementation and integration complete
- **Tasks**:
  - **`ExpressionVisitor.ts` Core Logic**:
    - [x] Initial repair of `visitExpression` to delegate to `createExpressionNode` or handle simple cases
    - [x] **COMPLETED**: Review and Refine `ExpressionVisitor.visitExpression` - Thoroughly reviewed and restored dispatch method
  - **Sub-Visitor Implementation (All Completed)**:
    - [x] **`BinaryExpressionVisitor` (Tree-sitter)**: All implementation and integration tasks completed
    - [x] **`UnaryExpressionVisitor` (Tree-sitter)**: All implementation and integration tasks completed
    - [x] **`ConditionalExpressionVisitor` (Tree-sitter)**: All implementation and integration tasks completed
    - [x] **`ParenthesizedExpressionVisitor` (Tree-sitter)**: All implementation and integration tasks completed
  - **Cleanup and Finalization**:
    - [x] Removed obsolete placeholder methods from `ExpressionVisitor.ts`
    - [x] Removed temporary `console.log`/`console.warn` statements
    - [x] Removed ANTLR-specific code and comments

## High Priority Tasks

### 1. Implement Full Test Coverage for All Visitors
- **Goal**: Achieve near 100% test coverage for all visitor classes.
- **Status**: Partially Done (Error handling and some expression visitors have good coverage)
- **Description**: Ensure all visitor classes have comprehensive unit tests covering normal behavior, edge cases, and error conditions.
- **Subtasks**:
  - [ ] Review existing test coverage for each visitor.
  - [ ] Identify gaps in test coverage.
  - [ ] Write new tests to cover missing scenarios.
  - [ ] Ensure tests cover both valid and invalid inputs.
  - [ ] Verify correct AST node generation and error reporting.
- **Priority**: High
- **Assignee**: TBD
- **Estimated Time**: 10-12 hours

### 2. Refine and Test Error Recovery Strategies
- **Goal**: Improve the robustness and effectiveness of error recovery strategies.
- **Status**: Partially Done (Basic strategies implemented and tested)
- **Description**: Further test and refine existing error recovery strategies. Implement new strategies for common OpenSCAD syntax errors not yet covered.
- **Subtasks**:
  - [ ] Test existing recovery strategies with a wider range of syntax errors.
  - [ ] Identify common syntax errors not yet handled by recovery strategies.
  - [ ] Implement new recovery strategies (e.g., for mismatched block delimiters, incomplete statements).
  - [ ] Ensure recovery strategies do not cause cascading errors or infinite loops.
  - [ ] Evaluate the performance impact of recovery strategies.
- **Priority**: High
- **Assignee**: TBD
- **Estimated Time**: 8-10 hours

## Medium Priority Tasks

### 3. Advanced Feature Support
- **Goal**: Implement parsing for advanced OpenSCAD features.
- **Status**: Planned
- **Description**: Add support for features like `let`, `assign` (as distinct from variable declaration), `assert`, list comprehensions, and potentially the `offset` module if its syntax is distinct.
- **Subtasks**:
  - [ ] `let` statements/expressions.
  - [ ] `assign` statements.
  - [ ] `assert` module/statement.
  - [ ] List comprehensions (including `for` and `if` clauses within them).
  - [ ] `offset` module (if syntax requires special handling beyond a normal module call).
  - [ ] Add corresponding visitor implementations and tests.
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 12-16 hours

### 4. Enhance AST with Semantic Information (Deferred)
- **Goal**: Add semantic information to AST nodes for better downstream processing.
- **Status**: Planned (Deferred until core parsing is stable)
- **Description**: Augment AST nodes with semantic information like type information, scope details, and resolved references.
- **Subtasks**:
  - [ ] Implement basic type inference.
  - [ ] Add scope resolution for variables and functions.
  - [ ] Link variable references to their declarations.
  - [ ] Add type checking for function calls and assignments.
- **Dependencies**: Requires stable core AST generation.
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 15-20 hours

### 5. Performance Optimization for Large Files
- **Goal**: Ensure the parser performs efficiently on large OpenSCAD files.
- **Status**: Planned
- **Description**: Profile the parser with large and complex OpenSCAD files to identify performance bottlenecks. Optimize critical code paths.
- **Subtasks**:
  - [ ] Create benchmark tests with large OpenSCAD files.
  - [ ] Profile parser performance to identify bottlenecks.
  - [ ] Optimize CST traversal and AST node creation.
  - [ ] Investigate memory usage and optimize if necessary.
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 8-10 hours

### 6. Include/Use Statement Enhancements (Deferred)
- **Goal**: Enhance parsing and AST representation for `include` and `use` statements.
- **Status**: Planned (Deferred)
- **Description**: Improve how `include` and `use` statements are handled, potentially resolving paths or linking to external file ASTs if feasible within the scope of a standalone parser.
- **Subtasks**:
  - [ ] Consider path resolution strategies (e.g., relative to current file).
  - [ ] Explore options for representing the content of included/used files in the AST (e.g., as nested ASTs or through a separate mechanism).
  - [ ] Add tests for various include/use scenarios.
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 6-8 hours

## Low Priority Tasks

### 7. Implement Pretty Printer
- **Goal**: Create a pretty printer for AST nodes.
- **Status**: Planned
- **Description**: Implement a pretty printer to convert AST back to formatted OpenSCAD code.
- **Subtasks**:
  - [ ] Implement basic pretty printing for expressions.
  - [ ] Add formatting options for indentation and spacing.
  - [ ] Implement pretty printing for all node types.
  - [ ] Add comment preservation (if comments are included in AST).
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 5-8 hours

### 8. Add Documentation Generator
- **Goal**: Generate documentation from OpenSCAD code.
- **Status**: Planned
- **Description**: Create a documentation generator based on AST analysis, potentially extracting comments associated with modules, functions, and variables.
- **Subtasks**:
  - [ ] Implement comment extraction and association with AST nodes.
  - [ ] Add support for documentation annotations (e.g., JSDoc-like syntax in comments).
  - [ ] Create HTML/Markdown documentation generator.
  - [ ] Implement cross-reference generation.
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 6-10 hours

## Completed Tasks

### Initial Setup and Basic Parsing (Completed 2025-05-21)
- Nx Monorepo with PNPM workspaces.
- Tree-sitter grammar integration.
- Basic CST to AST conversion framework.
- Visitor pattern implementation (`BaseASTVisitor`, `CompositeVisitor`).

### Module and Function Definition Handling (Completed 2025-05-23)
- `ModuleDefinitionVisitor`, `FunctionDefinitionVisitor`.
- Parameter extraction with default value support.

### Control Structure Visitors (Completed 2025-05-24)
- `IfElseVisitor`, `ForLoopVisitor`.
- Iterator handling for loop constructs.

### Variable Visitor (Completed 2025-05-24)
- `VariableVisitor` for assignments and references.
- Support for special OpenSCAD variables (`$fn`, `$fa`, `$fs`).

### Error Handling System Implementation (Completed 2025-05-24)
- `ErrorHandler`, `Logger`, `RecoveryStrategyRegistry`.
- Various error types and basic recovery strategies.
- Comprehensive integration tests for error handling.
