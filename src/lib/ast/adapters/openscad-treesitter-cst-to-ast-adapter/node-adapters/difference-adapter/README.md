# DifferenceOperation Adapter

This adapter converts Tree-sitter CST nodes for `difference()` operations into DifferenceOperation AST nodes.

## Features

- Separates child nodes into base object and subtracted objects
- Preserves the order of child nodes
- Properly extracts position information
- Follows OpenSCAD's semantics for difference operations

## AST Node Structure

The DifferenceOperation AST node has the following structure:

```typescript
{
  type: 'DifferenceOperation',
  baseObject: ASTNode,  // The first child node (object to subtract from)
  subtractedObjects: ASTNode[],  // All other child nodes (objects to subtract)
  position: Position  // Source code position information
}
```

## Usage

This adapter is automatically used by the main `adaptCstToAst` function when it encounters a `difference()` operation in the CST.

## Example

OpenSCAD code:
```openscad
difference() {
  cube(20, center=true);
  sphere(15);
}
```

Resulting AST node:
```typescript
{
  type: 'DifferenceOperation',
  baseObject: {
    type: 'Cube3D',
    // ... cube properties
  },
  subtractedObjects: [
    {
      type: 'Sphere3D',
      // ... sphere properties
    }
  ],
  position: {
    startLine: 0,
    startColumn: 0,
    endLine: 3,
    endColumn: 1
  }
}
```
