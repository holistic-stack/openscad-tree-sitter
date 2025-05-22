# OpenSCAD Tree-sitter Parser - Current Context

## Project Overview

The OpenSCAD Tree-sitter Parser project aims to create a parser for OpenSCAD code using tree-sitter to generate a Concrete Syntax Tree (CST), and then convert that CST to an Abstract Syntax Tree (AST) with structured types. The parser leverages tree-sitter's capabilities, including treeCursor, queries, and other features to facilitate this transformation.

## Current Status

We are focusing on refining the argument parsing logic for transformation nodes:

1. **Argument Extraction and Parameter Handling**:
   - Updated the `extractArguments` function in `argument-extractor.ts` to correctly handle `array_literal` nodes
   - Exported the `ExtractedParameter` and `ExtractedNamedArgument` types from `argument-extractor.ts`
   - Modified `BaseASTVisitor.createASTNodeForFunction` to use `ExtractedParameter[]` instead of `ast.Parameter[]`
   - Enhanced the `TransformVisitor` methods to properly handle different parameter types and vector values

2. **Type Safety Improvements**:
   - Added proper type handling for vector parameters in transform methods
   - Implemented type guards for checking `ExtractedParameter` and `ast.Value` types
   - Fixed vector assignments to ensure proper dimensionality (Vector2D vs Vector3D vs Vector4D)
   - Enhanced type compatibility in vector evaluation functions

3. **Testing and Debugging**:
   - Added comprehensive logging throughout the code to trace execution flow
   - Working on resolving test failures and addressing lint errors
   - Focusing on ensuring robust behavior across different parameter patterns

## Current Task Focus

We are currently addressing type compatibility issues between `ExtractedParameter` and `ast.Parameter`, particularly in the transform nodes:

1. **Vector Type Handling**:
   - Ensuring proper casting and validation for vector values in transform nodes
   - Adding safety checks for vector dimensions to prevent runtime errors
   - Implementing appropriate defaults when invalid vector values are provided

2. **Parameter Map Access**:
   - Implementing safe access patterns for named parameters
   - Adding type guards to handle the dual nature of `ExtractedParameter` (named vs. unnamed)
   - Ensuring proper extraction of numeric and vector values from parameters

3. **Color Transformation**:
   - Handling both string color names and RGBA vector values
   - Properly managing alpha values for transparency
   - Ensuring type safety for Vector4D color values

## Next Steps

1. Complete the refactoring of the `TransformVisitor` class to handle all parameter variations
2. Expand test coverage to include edge cases for parameter parsing
3. Address any remaining lint errors and type incompatibilities
4. Implement additional AST node types as needed to support complex OpenSCAD features
5. Enhance documentation with examples of each supported syntax pattern

## Architecture

The parser follows a visitor-based approach for CST to AST conversion:

1. **Parsing Phase**: Tree-sitter generates a CST from OpenSCAD code
2. **Visitation Phase**: Specialized visitors traverse the CST and convert nodes to AST
3. **Transformation Phase**: AST nodes are created based on extracted parameters and children

Key components include:
- `BaseASTVisitor`: Base implementation of the visitor pattern
- Specialized visitors for different node types (primitives, transformations, CSG operations)
- Parameter extractors for handling arguments in different formats
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