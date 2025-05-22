# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project aims to create a parser for OpenSCAD code using tree-sitter to generate a Concrete Syntax Tree (CST), and then convert that CST to an Abstract Syntax Tree (AST) with structured types. The parser leverages tree-sitter's capabilities, including treeCursor, queries, and other features to facilitate this transformation.

## Current Status

We have successfully completed the implementation of module and function definition handling:

1. **Module Parameter Extractor**:
   - Created a dedicated module parameter extractor for handling module and function parameters
   - Implemented support for default parameter values of different types (number, string, boolean, vector)
   - Added proper handling of vector parameters with 2D and 3D variants
   - Ensured robust parsing of parameter lists with mixed parameter types

2. **Module Visitor Enhancement**:
   - Updated ModuleVisitor to use the new module parameter extractor
   - Improved module definition parsing to handle parameters with default values
   - Enhanced module instantiation handling for better test compatibility
   - Added comprehensive tests for module definitions and instantiations

3. **Function Visitor Enhancement**:
   - Updated FunctionVisitor to use the new module parameter extractor
   - Improved function definition parsing to handle parameters with default values
   - Enhanced function call handling for better test compatibility
   - Added comprehensive tests for function definitions and calls

## Current Task Focus

With the Module and Function Definition handling complete, we are now shifting focus to the next priority areas:

1. **Control Structure Implementation**:
   - Developing visitors for if-else statements, for loops, and other control structures
   - Supporting conditional execution based on boolean expressions
   - Implementing iterator handling for loop constructs

2. **Expression Evaluation Enhancement**:
   - Improving support for complex expressions
   - Handling function calls and variable references
   - Supporting list comprehensions and advanced expressions

3. **Error Handling and Reporting**:
   - Enhancing error messages and recovery mechanisms
   - Adding context information to error messages
   - Implementing error recovery strategies for common syntax errors

## Next Steps

1. Implement IfElseVisitor for handling conditional statements
2. Develop ForLoopVisitor for handling loop constructs
3. Enhance expression handling with advanced operators
4. Improve error handling and reporting mechanisms
5. Expand test coverage for the new components

## Architecture

The parser follows a visitor-based approach for CST to AST conversion:

1. **Parsing Phase**: Tree-sitter generates a CST from OpenSCAD code
2. **Visitation Phase**: Specialized visitors traverse the CST and convert nodes to AST
3. **Transformation Phase**: AST nodes are created based on extracted parameters and children

Key components include:
- `BaseASTVisitor`: Base implementation of the visitor pattern
- Specialized visitors for different node types (primitives, transformations, CSG operations, modules, functions)
- Parameter extractors for handling arguments and parameters in different formats
- Module parameter extractor for handling module and function parameters with default values
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