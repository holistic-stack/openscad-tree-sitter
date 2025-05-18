# OpenSCAD AST Adapters

This document describes the AST adapters implemented in the OpenSCAD Tree-sitter library. These adapters convert the concrete syntax tree (CST) produced by the tree-sitter parser into an abstract syntax tree (AST) that more closely represents the semantics of OpenSCAD code.

## Design Philosophy

The adapters follow these core principles:

1. **Test-Driven Development (TDD)**: All adapters are implemented following TDD principles, with tests written before implementation.
2. **Cursor-Based Approach**: For better performance and memory management, adapters use tree-sitter's cursor API for traversal.
3. **No Mocks**: Tests use real tree-sitter instances rather than mocks to ensure accurate behavior.
4. **Type Safety**: Proper type guards are used throughout to ensure type safety.
5. **Modularity**: Each adapter is contained in its own directory with its own tests.

## Adapter Types

### Primitive Adapters

#### 2D Primitives

1. **Circle2D Adapter**
   - Converts `circle()` CST nodes to AST nodes
   - Handles `r` (radius) and `d` (diameter) parameters
   - Supports `$fn` special variable for circle resolution

2. **Square2D Adapter**
   - Converts `square()` CST nodes to AST nodes
   - Handles scalar and vector sizes
   - Supports `center` parameter for positioning

#### 3D Primitives

1. **Cube3D Adapter**
   - Converts `cube()` CST nodes to AST nodes
   - Handles scalar and vector sizes
   - Supports `center` parameter for positioning

2. **Sphere3D Adapter**
   - Converts `sphere()` CST nodes to AST nodes
   - Handles `r` (radius) and `d` (diameter) parameters
   - Supports `$fn` special variable for sphere resolution

### Transformation Adapters

1. **TranslateTransform Adapter**
   - Converts `translate()` CST nodes to AST nodes
   - Extracts the vector parameter for translation
   - Preserves child nodes (body) of the transformation

2. **RotateTransform Adapter**
   - Converts `rotate()` CST nodes to AST nodes
   - Supports both vector [x,y,z] and scalar (z-axis only) rotation
   - Preserves child nodes (body) of the transformation
   - Handles position information correctly

### Operation Adapters

1. **UnionOperation Adapter**
   - Converts `union()` CST nodes to AST nodes
   - Preserves all child nodes and their order
   - Handles position information correctly

2. **DifferenceOperation Adapter**
   - Converts `difference()` CST nodes to AST nodes
   - Separates the first child as the base object
   - Collects all other children as subtracted objects
   - Preserves original order of children
   - Handles position information correctly

### Control Flow Adapters

1. **IfStatement Adapter**
   - Converts `if()` CST nodes to AST nodes
   - Extracts the condition expression
   - Handles the 'then' branch body nodes
   - Supports optional 'else' branch
   - Preserves position information correctly

### Expression Adapters

1. **AssignmentStatement Adapter**
   - Converts assignment CST nodes to AST nodes
   - Extracts variable name (left side) and value (right side)
   - Supports various expression types for values
   - Preserves position information correctly

## Usage

The adapters are used by the main `adaptCstToAst` function in `adapt-cst-to-ast.ts`. This function takes a CST node or syntax tree and returns an AST node:

```typescript
import { adaptCstToAst } from './lib/ast/adapters/openscad-treesitter-cst-to-ast-adapter/adapt-cst-to-ast';
import { SyntaxTree } from './lib/types/cst-types';

// Parse OpenSCAD code using tree-sitter to get a syntax tree
const syntaxTree: SyntaxTree = /* ... */;

// Convert the syntax tree to an AST
const ast = adaptCstToAst(syntaxTree);
```

## Fallback Handling

The adapter system includes a fallback for unknown node types to ensure robustness. If a CST node type is encountered that doesn't have a specific adapter, it will be converted to an "Unknown" AST node with position information preserved.

## Future Enhancements

Additional adapters planned for future implementation:

1. **More 3D Primitives**:
   - Cylinder3D
   - Polyhedron3D

2. **More 2D Primitives**:
   - Polygon2D
   - Text2D

3. **More Transformations**:
   - ScaleTransform
   - MirrorTransform
   - MultmatrixTransform

4. **More Operations**:
   - IntersectionOperation
   - MinkowskiOperation
   - HullOperation

5. **More Control Flow**:
   - ForStatement
   - ForEachStatement
   - ModuleDeclaration
   - ModuleInstance
