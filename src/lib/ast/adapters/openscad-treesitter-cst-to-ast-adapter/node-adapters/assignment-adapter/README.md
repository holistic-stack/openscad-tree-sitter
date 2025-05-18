# AssignmentStatement Adapter

This adapter converts Tree-sitter CST nodes for assignment statements into AssignmentStatement AST nodes.

## Features

- Extracts variable name (left side) and value expression (right side)
- Supports various expression types for values
- Preserves position information correctly
- Follows OpenSCAD's variable assignment semantics

## AST Node Structure

The AssignmentStatement AST node has the following structure:

```typescript
{
  type: 'AssignmentStatement',
  left: {
    type: 'Identifier',
    name: string,   // Variable name
    position: Position
  },
  right: Expression, // Value expression (any expression type)
  position: Position  // Source code position information
}
```

## Usage

This adapter is automatically used by the main `adaptCstToAst` function when it encounters an assignment statement in the CST.

## Example

OpenSCAD code:
```openscad
radius = 10;
```

Resulting AST node:
```typescript
{
  type: 'AssignmentStatement',
  left: {
    type: 'Identifier',
    name: 'radius',
    position: { ... }
  },
  right: {
    type: 'LiteralExpression',
    valueType: 'number',
    value: 10,
    position: { ... }
  },
  position: {
    startLine: 0,
    startColumn: 0,
    endLine: 0,
    endColumn: 11
  }
}
```
