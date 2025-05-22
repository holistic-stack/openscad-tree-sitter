# OpenSCAD Tree-sitter Parser - TODO List

## High Priority Tasks

### 1. Complete Transform Visitor Implementation [IN PROGRESS]
- **Goal**: Ensure robust handling of all transform parameters
- **Status**: In progress
- **Description**: Fix type compatibility issues and parameter handling in transform-visitor.ts
- **Subtasks**:
  - [x] Export `ExtractedParameter` and `ExtractedNamedArgument` types from argument-extractor.ts
  - [x] Update `BaseASTVisitor.createASTNodeForFunction` to use `ExtractedParameter[]`
  - [ ] Fix vector dimension handling in transform node creators (Vector2D vs Vector3D)
  - [ ] Implement proper type guards for parameter access in `getParametersMap`
  - [ ] Fix color node handling for both string and vector color formats
  - [ ] Add comprehensive error handling and validation for all transform parameters
  - [ ] Ensure consistent handling of default values across all transform types
- **Dependencies**: None
- **Priority**: High
- **Assignee**: TBD
- **Estimated Time**: 4 hours

### 2. Expand Test Coverage for Transform Parameters
- **Goal**: Ensure all parameter variations and edge cases are tested
- **Status**: Planned
- **Description**: Create comprehensive tests for different parameter patterns in transform nodes
- **Subtasks**:
  - [ ] Add tests for named vs. unnamed parameters
  - [ ] Test vector dimension handling (2D vs 3D)
  - [ ] Test default value handling for missing parameters
  - [ ] Test error handling for invalid parameters
  - [ ] Add tests for color handling (string vs vector)
- **Dependencies**: Task #1
- **Priority**: High
- **Assignee**: TBD
- **Estimated Time**: 3 hours

### 3. Implement Module and Function Definition Handling
- **Goal**: Support parsing and AST generation for module and function definitions
- **Status**: Planned
- **Description**: Create visitor implementations for module and function definitions
- **Subtasks**:
  - [ ] Implement ModuleDefinitionVisitor
  - [ ] Implement FunctionDefinitionVisitor
  - [ ] Add parameter extraction utilities for function parameters
  - [ ] Implement scope handling for nested definitions
  - [ ] Add tests for module and function definitions
- **Dependencies**: None
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 5 hours

## Medium Priority Tasks

### 4. Improve Error Handling and Reporting
- **Goal**: Enhance error messages and recovery mechanisms
- **Status**: Planned
- **Description**: Add better error handling and recovery strategies throughout the parser
- **Subtasks**:
  - [ ] Implement detailed error messages for parsing failures
  - [ ] Add context information to error messages
  - [ ] Implement error recovery strategies for common syntax errors
  - [ ] Add error logging and telemetry
- **Dependencies**: None
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 4 hours

### 5. Enhance AST with Semantic Information
- **Goal**: Add semantic information to AST nodes for better downstream processing
- **Status**: Planned
- **Description**: Augment AST nodes with additional semantic information
- **Subtasks**:
  - [ ] Add type information to expressions
  - [ ] Implement scope tracking for variables
  - [ ] Add symbol resolution for identifiers
  - [ ] Implement basic semantic validation
- **Dependencies**: None
- **Priority**: Medium
- **Assignee**: TBD
- **Estimated Time**: 6 hours

### 6. Optimize Parser Performance
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

## Low Priority Tasks

### 7. Add Support for Include and Use Statements
- **Goal**: Handle file inclusion and library usage
- **Status**: Planned
- **Description**: Implement handling for include and use statements
- **Subtasks**:
  - [ ] Implement IncludeVisitor
  - [ ] Implement UseVisitor
  - [ ] Add file resolution logic
  - [ ] Implement content merging for included files
- **Dependencies**: None
- **Priority**: Low
- **Assignee**: TBD
- **Estimated Time**: 4 hours

### 8. Implement Pretty Printer
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

### 9. Add Documentation Generator
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