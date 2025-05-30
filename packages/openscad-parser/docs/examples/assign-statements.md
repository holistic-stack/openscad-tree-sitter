# Assign Statement Examples

This document provides comprehensive examples of assign statement parsing using the OpenSCAD Parser. Assign statements are deprecated in OpenSCAD but still supported for legacy code compatibility.

## Overview

Assign statements in OpenSCAD provide a way to assign variables within a specific scope. While deprecated in favor of regular variable assignments, they are still encountered in legacy OpenSCAD code and need to be properly parsed.

### Syntax

```openscad
assign(var1 = value1, var2 = value2, ...) statement_or_block
```

## Basic Examples

### Simple Assign Statement

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

const code = 'assign(x = 5) cube(x);';
const ast = parser.parseAST(code);

console.log(ast[0]); // AssignStatementNode
// {
//   type: 'assign',
//   assignments: [
//     { type: 'assignment', variable: 'x', value: { expressionType: 'literal', value: 5 } }
//   ],
//   body: { type: 'module_instantiation', name: 'cube', arguments: [...] }
// }

parser.dispose();
```

### Multiple Assignments

```typescript
const code = 'assign(x = 5, y = 10, z = 15) cube([x, y, z]);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments.length); // 3
console.log(assignNode.assignments.map(a => a.variable)); // ['x', 'y', 'z']
```

### Different Value Types

```typescript
const code = 'assign(num = 42, str = "hello", flag = true) echo(num, str, flag);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
assignNode.assignments.forEach(assignment => {
  console.log(`${assignment.variable}: ${assignment.value.value}`);
});
// Output:
// num: 42
// str: hello
// flag: true
```

## Complex Examples

### Assign with Arithmetic Expressions

```typescript
const code = 'assign(result = a + b * 2, ratio = width / height) cube([result, ratio, 1]);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments[0].variable); // 'result'
console.log(assignNode.assignments[1].variable); // 'ratio'
```

### Assign with Function Calls

```typescript
const code = 'assign(angle = sin(45), radius = cos(30)) sphere(radius);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
assignNode.assignments.forEach(assignment => {
  console.log(`${assignment.variable}: function call`);
});
```

### Assign with Array Expressions

```typescript
const code = 'assign(points = [[0,0], [1,1], [2,0]]) polygon(points);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments[0].variable); // 'points'
console.log(assignNode.assignments[0].value.expressionType); // 'array'
```

## Block Bodies

### Assign with Block Statement

```typescript
const code = `assign(r = 10) {
  sphere(r);
  translate([r*2, 0, 0]) sphere(r);
}`;
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.body.type); // 'block'
console.log(assignNode.body.statements.length); // 2
```

### Complex Block with Multiple Operations

```typescript
const code = `assign(size = 10, height = 20) {
  cube([size, size, height]);
  translate([size + 5, 0, 0]) {
    cylinder(r = size/2, h = height);
    translate([0, 0, height]) sphere(size/4);
  }
}`;
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments.length); // 2
console.log(assignNode.body.type); // 'block'
```

## Edge Cases

### Empty Assign Statement

```typescript
const code = 'assign() cube(1);';
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments.length); // 0
console.log(assignNode.body.type); // 'module_instantiation'
```

### Assign without Semicolon

```typescript
const code = 'assign(x = 5) cube(x)';
const ast = parser.parseAST(code);

const assignNode = ast[0];
console.log(assignNode.assignments[0].variable); // 'x'
```

### Multiple Assign Statements

```typescript
const code = `
  assign(x = 5) cube(x);
  assign(y = 10) sphere(y);
`;
const ast = parser.parseAST(code);

console.log(ast.length); // 2
console.log(ast[0].type); // 'assign'
console.log(ast[1].type); // 'assign'
```

## Error Handling

### Malformed Assign Statement

```typescript
const code = 'assign(x =) cube(1);';
const ast = parser.parseAST(code);

// Parser handles gracefully, may have incomplete assignment
console.log(ast.length); // 1
console.log(ast[0].type); // 'assign'
```

### Missing Body

```typescript
const code = 'assign(x = 5)';
const ast = parser.parseAST(code);

// Parser handles gracefully
console.log(ast.length); // 1
```

## AST Structure

The assign statement generates an `AssignStatementNode` with the following structure:

```typescript
interface AssignStatementNode extends BaseNode {
  type: 'assign';
  assignments: AssignmentNode[];
  body: ASTNode;
}

interface AssignmentNode extends BaseNode {
  type: 'assignment';
  variable: string;
  value: ExpressionNode;
}
```

## Best Practices

1. **Legacy Code Support**: Use assign statement parsing for maintaining compatibility with older OpenSCAD files
2. **Migration Path**: Consider converting assign statements to regular variable assignments in modern code
3. **Error Handling**: Always check for parsing errors when dealing with legacy syntax
4. **Testing**: Include assign statement test cases when validating OpenSCAD parsers

## Related Documentation

- [Assert Statement Examples](./assert-statements.md)
- [AST Types Reference](../api/ast-types.md)
- [Basic Usage Guide](./basic-usage.md)
- [Error Handling Guide](../api/error-handling.md)
