# RotateTransform Adapter

This adapter converts Tree-sitter CST nodes for `rotate()` calls into RotateTransform AST nodes.

## Features

- Supports both vector [x,y,z] and scalar (z-axis only) rotation angles
- Extracts body nodes from the transform statement
- Preserves node order and position information
- Handles all required parameter forms according to OpenSCAD specification

## AST Node Structure

The RotateTransform AST node has the following structure:

```typescript
{
  type: 'RotateTransform',
  angles: {
    x: Expression,  // X rotation angle in degrees
    y: Expression,  // Y rotation angle in degrees
    z: Expression   // Z rotation angle in degrees
  },
  body: ASTNode[],  // Child nodes to be rotated
  position: Position  // Source code position information
}
```

## Usage

This adapter is automatically used by the main `adaptCstToAst` function when it encounters a `rotate()` call in the CST.

## Example

OpenSCAD code:
```openscad
rotate([30, 60, 90]) {
  cube(10);
}
```

Resulting AST node:
```typescript
{
  type: 'RotateTransform',
  angles: {
    x: {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 30,
      position: { ... }
    },
    y: {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 60,
      position: { ... }
    },
    z: {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 90,
      position: { ... }
    }
  },
  body: [
    {
      type: 'Cube3D',
      // ... cube properties
    }
  ],
  position: {
    startLine: 0,
    startColumn: 0,
    endLine: 2,
    endColumn: 1
  }
}
```
