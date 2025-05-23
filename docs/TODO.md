# OpenSCAD Tree-sitter Parser - TODO List

## High Priority Tasks

### 1. Enhance Expression Handling [IN PROGRESS]
- **Goal**: Improve support for complex expressions
- **Status**: In progress
- **Description**: Refactor and enhance the ExpressionVisitor to properly handle all expression types
- **Subtasks**:
  - [x] Create specialized visitors for different expression types
  - [x] Implement FunctionCallVisitor to handle function calls in expressions
  - [x] Update ExpressionVisitor to use FunctionCallVisitor
  - [x] Implement BinaryExpressionVisitor to handle binary operations
  - [x] Enhance visitBinaryExpression to handle all binary operators with proper precedence
  - [x] Implement UnaryExpressionVisitor to handle unary operations
  - [x] Improve visitUnaryExpression to handle all unary operators
  - [ ] Implement ConditionalExpressionVisitor to handle conditional expressions
  - [ ] Enhance visitConditionalExpression to use ConditionalExpressionVisitor
  - [ ] Add support for nested expressions with different operators
  - [ ] Implement proper handling of parenthesized expressions
  - [ ] Add comprehensive tests with real CST nodes
- **Dependencies**: None
- **Priority**: High
- **Assignee**: TBD
- **Estimated Time**: 8 hours
- **Implementation Details**:
  - ✅ Binary operations now handle: +, -, *, /, %, ==, !=, <, <=, >, >=, &&, ||
  - ✅ Unary operations now handle: +, -, !
  - ✅ Function calls now extract function name and arguments properly
  - The current visitConditionalExpression implementation still relies on string manipulation
  - Need to implement ConditionalExpressionVisitor following the same pattern as other expression visitors
  - Create conditional-expression-visitor.ts in the expression-visitor directory
  - Add ConditionalExpressionVisitor to ExpressionVisitor constructor
  - Update visitConditionalExpression to delegate to ConditionalExpressionVisitor
  - Implement proper handling of parenthesized expressions
  - Tests should use real OpenscadParser instances and CST nodes
  - Use `pnpm test:parser` to run tests for the parser package
  - Use `nx test openscad-parser --testFile=src/lib/openscad-parser/ast/visitors/expression-visitor/conditional-expression-visitor.test.ts` to run specific test files

### 2. Improve Error Handling and Reporting
- **Goal**: Enhance error messages and recovery mechanisms
- **Status**: Planned
- **Description**: Add better error handling and recovery strategies throughout the parser
- **Subtasks**:
  - [ ] Create a centralized error handling system
  - [ ] Implement detailed error messages for parsing failures
  - [ ] Add context information to error messages (line numbers, code snippets)
  - [ ] Implement error recovery strategies for common syntax errors
  - [ ] Add error logging and telemetry
  - [ ] Create error types for different kinds of parsing errors
  - [ ] Add error handling for expression parsing
  - [ ] Implement graceful degradation for unparseable expressions
- **Dependencies**: None
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 6 hours
- **Implementation Details**:
  - Create a centralized ErrorHandler class to manage error reporting
  - Use location information from CST nodes to provide context
  - Implement specific error types for different parsing failures
  - Add recovery strategies to continue parsing after errors
  - Provide helpful suggestions for fixing common errors
  - Add logging with different severity levels
  - Implement in the openscad-parser package
  - Test with `pnpm test:parser` to verify error handling

## Medium Priority Tasks

### 3. Enhance AST with Semantic Information
- **Goal**: Add semantic information to AST nodes for better downstream processing
- **Status**: Planned
- **Description**: Augment AST nodes with additional semantic information
- **Subtasks**:
  - [ ] Create a type system for OpenSCAD expressions
  - [ ] Add type inference for expressions
  - [ ] Implement scope tracking for variables
  - [ ] Create a symbol table for variable and function declarations
  - [ ] Add symbol resolution for identifiers
  - [ ] Implement basic semantic validation
  - [ ] Add type checking for function arguments
  - [ ] Implement warnings for type mismatches
- **Dependencies**: Task #1 (Enhance Expression Handling)
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 8 hours
- **Implementation Details**:
  - Create a TypeSystem class to manage type information
  - Implement type inference rules for OpenSCAD expressions
  - Create a ScopeManager to track variable scopes
  - Implement a SymbolTable for variable and function declarations
  - Add type checking for function arguments
  - Provide warnings for potential type mismatches
  - Enhance AST nodes with type and scope information

### 4. Optimize Parser Performance
- **Goal**: Improve parsing speed and memory usage
- **Status**: Planned
- **Description**: Profile and optimize parser performance
- **Subtasks**:
  - [ ] Profile parser performance with large files
  - [ ] Identify and fix performance bottlenecks
  - [ ] Optimize memory usage during parsing
  - [ ] Implement incremental parsing for better editor integration
- **Dependencies**: None
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 5 hours

### 5. Add Support for Include and Use Statements
- **Goal**: Handle file inclusion and library usage
- **Status**: Planned
- **Description**: Implement handling for include and use statements
- **Subtasks**:
  - [ ] Implement IncludeVisitor
  - [ ] Implement UseVisitor
  - [ ] Add file resolution logic
  - [ ] Implement content merging for included files
  - [ ] Add tests for include and use statements
  - [ ] Update grammar if needed to better support include/use statements
- **Dependencies**: None
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 4 hours
- **Implementation Details**:
  - Implement in both packages: tree-sitter-openscad (grammar) and openscad-parser (visitor)
  - Test with `pnpm test:grammar` and `pnpm test:parser`
  - Use `pnpm parse examples/include-example.scad` to verify parsing

## Low Priority Tasks

### 6. Implement Pretty Printer
- **Goal**: Create a pretty printer for AST nodes
- **Status**: Planned
- **Description**: Implement a pretty printer to convert AST back to formatted OpenSCAD code
- **Subtasks**:
  - [ ] Implement basic pretty printing for expressions
  - [ ] Add formatting options for indentation and spacing
  - [ ] Implement pretty printing for all node types
  - [ ] Add comment preservation
- **Dependencies**: None
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 5 hours

### 7. Add Documentation Generator
- **Goal**: Generate documentation from OpenSCAD code
- **Status**: Planned
- **Description**: Create a documentation generator based on AST analysis
- **Subtasks**:
  - [ ] Implement comment extraction
  - [ ] Add support for documentation annotations
  - [ ] Create HTML/Markdown documentation generator
  - [ ] Implement cross-reference generation
- **Dependencies**: None
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 6 hours

## Completed Tasks

### Implemented Control Structure Visitors
- **Goal**: Support control flow structures like if-else, for loops, etc.
- **Status**: Completed
- **Description**: Created visitor implementations for control structures
- **Subtasks**:
  - [x] Implement IfElseVisitor
  - [x] Implement ForLoopVisitor
  - [x] Add support for conditional expressions
  - [x] Implement iterator handling for loop constructs
  - [x] Add tests for control structures
- **Completed Date**: 2025-05-24

### Implemented Module and Function Definition Handling
- **Goal**: Support parsing and AST generation for module and function definitions
- **Status**: Completed
- **Description**: Created visitor implementations for module and function definitions
- **Subtasks**:
  - [x] Implement ModuleDefinitionVisitor
  - [x] Implement FunctionDefinitionVisitor
  - [x] Add parameter extraction utilities for function and module parameters
  - [x] Support default values for parameters
  - [x] Add tests for module and function definitions
- **Completed Date**: 2025-05-23

### Implemented Visitor Pattern for CST Traversal
- **Goal**: Create a visitor-based approach for CST traversal
- **Status**: Completed
- **Description**: Implemented visitor pattern for converting CST to AST
- **Subtasks**:
  - [x] Create BaseASTVisitor class
  - [x] Implement specialized visitors for different node types
  - [x] Create CompositeVisitor for delegation
  - [x] Update OpenscadParser to use visitor-based AST generator
- **Completed Date**: 2025-05-21

### Updated Test Files to Use Real Parser
- **Goal**: Remove mock implementations and use real parser in tests
- **Status**: Completed
- **Description**: Updated all test files to use the real parser instead of mocks
- **Subtasks**:
  - [x] Update intersection.test.ts
  - [x] Update minkowski.test.ts
  - [x] Update module-function.test.ts
  - [x] Update control-structures.test.ts
- **Completed Date**: 2025-05-21
