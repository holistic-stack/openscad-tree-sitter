# Sphere3D Adapter

This adapter converts Tree-sitter CST nodes for `sphere()` calls into Sphere3D AST nodes.

## Features

- Handles `r` (radius) parameter
- Handles `d` (diameter) parameter (internally converts to radius)
- Supports `$fn` special variable for sphere resolution
- Preserves position information from the original source code

## AST Node Structure

The Sphere3D AST node has the following structure:

```typescript
{
  type: 'Sphere3D',
  radius: Expression,  // An expression that resolves to a number
  resolution: Expression | undefined,  // Optional resolution ($fn parameter)
  position: Position    // Source code position information
}
```

## Usage

This adapter is automatically used by the main `adaptCstToAst` function when it encounters a `sphere()` call in the CST.

## Example

OpenSCAD code:
```openscad
sphere(r=10, $fn=32);
```

Resulting AST node:
```typescript
{
  type: 'Sphere3D',
  radius: {
    type: 'LiteralExpression',
    valueType: 'number',
    value: 10,
    position: { ... }
  },
  resolution: {
    type: 'LiteralExpression',
    valueType: 'number',
    value: 32,
    position: { ... }
  },
  position: {
    startLine: 0,
    startColumn: 0,
    endLine: 0,
    endColumn: 19
  }
}
```
