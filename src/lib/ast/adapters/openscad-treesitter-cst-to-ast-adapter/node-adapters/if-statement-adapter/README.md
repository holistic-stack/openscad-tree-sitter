# IfStatement Adapter

This adapter converts Tree-sitter CST nodes for `if` statements into IfStatement AST nodes.

## Features

- Extracts condition expressions
- Handles 'then' branch body nodes
- Supports optional 'else' branch
- Preserves position information

## AST Node Structure

The IfStatement AST node has the following structure:

```typescript
{
  type: 'IfStatement',
  condition: Expression,  // The condition expression
  thenBranch: ASTNode[],  // Nodes to execute if condition is true
  elseBranch?: ASTNode[], // Optional nodes to execute if condition is false
  position: Position      // Source code position information
}
```

## Usage

This adapter is automatically used by the main `adaptCstToAst` function when it encounters an `if` statement in the CST.

## Example

OpenSCAD code:
```openscad
if (x > 10) {
  cube(20);
} else {
  sphere(15);
}
```

Resulting AST node:
```typescript
{
  type: 'IfStatement',
  condition: {
    type: 'BinaryExpression',
    operator: '>',
    left: {
      type: 'VariableReference',
      name: 'x',
      position: { ... }
    },
    right: {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 10,
      position: { ... }
    },
    position: { ... }
  },
  thenBranch: [
    {
      type: 'Cube3D',
      // ... cube properties
    }
  ],
  elseBranch: [
    {
      type: 'Sphere3D',
      // ... sphere properties
    }
  ],
  position: {
    startLine: 0,
    startColumn: 0,
    endLine: 5,
    endColumn: 1
  }
}
```
