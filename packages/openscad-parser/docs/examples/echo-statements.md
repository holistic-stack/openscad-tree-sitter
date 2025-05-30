# Echo Statement Examples

This document provides comprehensive examples of echo statement parsing using the OpenSCAD parser.

## Overview

Echo statements are essential for debugging and output in OpenSCAD. The parser provides complete support for echo statements with complex expression parsing capabilities.

## Basic Echo Statements

### String Literals

```typescript
import { EnhancedOpenscadParser } from '@openscad/parser';

const parser = new EnhancedOpenscadParser();
await parser.init('./tree-sitter-openscad.wasm');

// Simple string echo
const code = 'echo("Hello World");';
const ast = parser.parseAST(code);

console.log(JSON.stringify(ast[0], null, 2));
// Output:
// {
//   "type": "echo",
//   "arguments": [
//     {
//       "expressionType": "literal",
//       "value": "Hello World",
//       "literalType": "string"
//     }
//   ]
// }
```

### Number Literals

```typescript
// Integer echo
const code1 = 'echo(42);';
const ast1 = parser.parseAST(code1);

// Float echo
const code2 = 'echo(3.14159);';
const ast2 = parser.parseAST(code2);

// Negative number echo
const code3 = 'echo(-10);';
const ast3 = parser.parseAST(code3);
```

### Boolean Literals

```typescript
// Boolean true
const code1 = 'echo(true);';
const ast1 = parser.parseAST(code1);

// Boolean false
const code2 = 'echo(false);';
const ast2 = parser.parseAST(code2);
```

### Variable References

```typescript
// Variable echo
const code = 'echo(x);';
const ast = parser.parseAST(code);

console.log(JSON.stringify(ast[0], null, 2));
// Output:
// {
//   "type": "echo",
//   "arguments": [
//     {
//       "expressionType": "variable",
//       "name": "x"
//     }
//   ]
// }
```

## Multiple Arguments

### Mixed Argument Types

```typescript
// Echo with multiple mixed arguments
const code = 'echo("Value:", x, 42, true);';
const ast = parser.parseAST(code);

console.log(JSON.stringify(ast[0], null, 2));
// Output:
// {
//   "type": "echo",
//   "arguments": [
//     {
//       "expressionType": "literal",
//       "value": "Value:",
//       "literalType": "string"
//     },
//     {
//       "expressionType": "variable",
//       "name": "x"
//     },
//     {
//       "expressionType": "literal",
//       "value": 42,
//       "literalType": "number"
//     },
//     {
//       "expressionType": "literal",
//       "value": true,
//       "literalType": "boolean"
//     }
//   ]
// }
```

### Multiple String Arguments

```typescript
// Multiple strings
const code = 'echo("Hello", "World");';
const ast = parser.parseAST(code);
```

### Many Arguments

```typescript
// Many variable arguments
const code = 'echo(a, b, c, d, e);';
const ast = parser.parseAST(code);
```

## Complex Expressions

### Arithmetic Expressions

```typescript
// Binary arithmetic expression
const code = 'echo(x + y);';
const ast = parser.parseAST(code);

console.log(JSON.stringify(ast[0], null, 2));
// Output:
// {
//   "type": "echo",
//   "arguments": [
//     {
//       "expressionType": "binary_expression",
//       "operator": "+",
//       "left": {
//         "expressionType": "variable",
//         "name": "x"
//       },
//       "right": {
//         "expressionType": "variable",
//         "name": "y"
//       },
//       "text": "x + y"
//     }
//   ]
// }
```

### Complex Arithmetic

```typescript
// Multiple operations
const code1 = 'echo(x * y + z);';
const ast1 = parser.parseAST(code1);

// Parenthesized expressions
const code2 = 'echo((x + y) * z);';
const ast2 = parser.parseAST(code2);

// Mixed operations
const code3 = 'echo(x / y - z * 2);';
const ast3 = parser.parseAST(code3);
```

### Function Calls (Future Support)

```typescript
// Function call in echo (planned feature)
const code = 'echo(sin(45));';
// Note: Currently not fully supported, planned for future enhancement
```

### Array Expressions (Future Support)

```typescript
// Array in echo (planned feature)
const code = 'echo([1, 2, 3]);';
// Note: Currently not fully supported, planned for future enhancement
```

## Edge Cases

### Empty Echo

```typescript
// Empty echo statement
const code = 'echo();';
const ast = parser.parseAST(code);

console.log(JSON.stringify(ast[0], null, 2));
// Output:
// {
//   "type": "echo",
//   "arguments": []
// }
```

### Echo Without Semicolon

```typescript
// Echo without semicolon (still valid)
const code = 'echo("test")';
const ast = parser.parseAST(code);
```

### Multiple Echo Statements

```typescript
// Multiple echo statements
const code = `
  echo("First");
  echo("Second");
  echo("Third");
`;
const ast = parser.parseAST(code);

// Results in 3 separate echo statement nodes
expect(ast).toHaveLength(3);
expect(ast[0].type).toBe('echo');
expect(ast[1].type).toBe('echo');
expect(ast[2].type).toBe('echo');
```

## Error Handling

### Missing Closing Parenthesis

```typescript
// Malformed echo with missing closing parenthesis
const code = 'echo("test";';
const ast = parser.parseAST(code);

// Parser handles gracefully and still creates echo node
expect(ast).toHaveLength(1);
expect(ast[0].type).toBe('echo');
```

### Extra Commas

```typescript
// Echo with extra commas
const code = 'echo("test",, "value");';
const ast = parser.parseAST(code);

// Parser filters out invalid arguments and processes valid ones
expect(ast[0].arguments).toHaveLength(2); // Only valid arguments
```

## Real-World Usage Examples

### Debug Output

```typescript
// Debugging variable values
const debugCode = `
  x = 10;
  y = 20;
  echo("Debug: x =", x, "y =", y);
  echo("Sum:", x + y);
  echo("Product:", x * y);
`;

const ast = parser.parseAST(debugCode);
```

### Conditional Debug

```typescript
// Conditional echo statements
const conditionalCode = `
  debug = true;
  if (debug) {
    echo("Debug mode enabled");
    echo("Processing data...");
  }
`;

const ast = parser.parseAST(conditionalCode);
```

### Loop Debug

```typescript
// Echo in loops
const loopCode = `
  for (i = [0:5]) {
    echo("Iteration:", i);
    echo("Value:", i * 2);
  }
`;

const ast = parser.parseAST(loopCode);
```

## Testing Echo Statements

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '@openscad/parser';

describe('Echo Statement Parsing', () => {
  let parser: EnhancedOpenscadParser;
  
  beforeEach(async () => {
    parser = new EnhancedOpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });
  
  afterEach(() => {
    parser.dispose();
  });
  
  it('should parse basic echo statement', () => {
    const code = 'echo("Hello World");';
    const ast = parser.parseAST(code);
    
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('echo');
    expect(ast[0].arguments).toHaveLength(1);
    expect(ast[0].arguments[0].expressionType).toBe('literal');
    expect(ast[0].arguments[0].value).toBe('Hello World');
  });
  
  it('should parse arithmetic expression', () => {
    const code = 'echo(x + y);';
    const ast = parser.parseAST(code);
    
    expect(ast[0].arguments[0].expressionType).toBe('binary_expression');
    expect(ast[0].arguments[0].operator).toBe('+');
    expect(ast[0].arguments[0].left.name).toBe('x');
    expect(ast[0].arguments[0].right.name).toBe('y');
  });
});
```

## Performance Considerations

### Efficient Echo Processing

```typescript
// Reuse parser instance for multiple echo statements
const parser = new EnhancedOpenscadParser();
await parser.init('./tree-sitter-openscad.wasm');

const echoStatements = [
  'echo("Statement 1");',
  'echo("Statement 2");',
  'echo("Statement 3");'
];

const results = echoStatements.map(code => parser.parseAST(code));

parser.dispose(); // Clean up when done
```

## Current Limitations

### Known Issues

1. **Boolean Literal Detection**: `true`/`false` may be processed as variables instead of literals
2. **Function Call Support**: Function calls within echo statements need enhancement
3. **Array Expression Support**: Array expressions within echo statements need enhancement

### Workarounds

```typescript
// For boolean literals, check the expressionType
if (arg.expressionType === 'variable' && (arg.name === 'true' || arg.name === 'false')) {
  // Handle as boolean literal
  const boolValue = arg.name === 'true';
}
```

## Future Enhancements

### Planned Features

1. **Enhanced Function Call Support**: Complete support for function calls in echo arguments
2. **Array Expression Support**: Full support for array expressions in echo arguments
3. **Complex Expression Evaluation**: Runtime evaluation of complex expressions
4. **Enhanced Error Recovery**: Better error handling for malformed echo statements

### Extension Points

The echo statement visitor can be extended to support:

- Custom expression types
- Enhanced debugging features
- Performance monitoring
- Custom output formatting
