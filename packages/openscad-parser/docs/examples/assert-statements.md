# Assert Statement Examples

This document provides comprehensive examples of using assert statements with the OpenSCAD parser.

## Overview

Assert statements in OpenSCAD are used for runtime validation and debugging. They allow you to verify assumptions about your code and provide meaningful error messages when those assumptions are violated.

## Basic Assert Statements

### Simple Boolean Assertions

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Basic true assertion
const basicTrue = parser.parseAST('assert(true);');
console.log(basicTrue[0]);
// Output: { type: 'assert', condition: { expressionType: 'literal', value: 'true' } }

// Basic false assertion
const basicFalse = parser.parseAST('assert(false);');
console.log(basicFalse[0]);
// Output: { type: 'assert', condition: { expressionType: 'literal', value: 'false' } }

// Variable assertion
const variableAssert = parser.parseAST('assert(x);');
console.log(variableAssert[0]);
// Output: { type: 'assert', condition: { expressionType: 'literal', value: 'x' } }

parser.dispose();
```

## Assert Statements with Conditions

### Comparison Operations

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Greater than comparison
const greaterThan = parser.parseAST('assert(x > 0);');
console.log(greaterThan[0]);
// Output: { type: 'assert', condition: { expressionType: 'literal', value: 'x > 0' } }

// Less than comparison
const lessThan = parser.parseAST('assert(y < 100);');
console.log(lessThan[0]);

// Equality comparison
const equality = parser.parseAST('assert(z == 42);');
console.log(equality[0]);

// Not equal comparison
const notEqual = parser.parseAST('assert(value != 0);');
console.log(notEqual[0]);

parser.dispose();
```

### Logical Operations

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Logical AND
const logicalAnd = parser.parseAST('assert(x > 0 && y < 100);');
console.log(logicalAnd[0]);

// Logical OR
const logicalOr = parser.parseAST('assert(x == 0 || y == 0);');
console.log(logicalOr[0]);

// Complex logical expression
const complex = parser.parseAST('assert((x > 0 && y > 0) || z == 0);');
console.log(complex[0]);

parser.dispose();
```

### Function Call Conditions

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Function call in condition
const functionCall = parser.parseAST('assert(len(points) == 3);');
console.log(functionCall[0]);

// Multiple function calls
const multipleCalls = parser.parseAST('assert(len(points) >= 3 && len(points) <= 10);');
console.log(multipleCalls[0]);

// Nested function calls
const nested = parser.parseAST('assert(abs(sin(angle)) < 1);');
console.log(nested[0]);

parser.dispose();
```

## Assert Statements with Messages

### String Literal Messages

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Basic message
const withMessage = parser.parseAST('assert(x > 0, "x must be positive");');
console.log(withMessage[0]);
// Output: {
//   type: 'assert',
//   condition: { expressionType: 'literal', value: 'x > 0' },
//   message: { expressionType: 'literal', value: '"x must be positive"' }
// }

// Descriptive message
const descriptive = parser.parseAST('assert(len(points) >= 3, "Need at least 3 points for polygon");');
console.log(descriptive[0]);

// Error context message
const contextual = parser.parseAST('assert(radius > 0, "Radius must be positive for sphere creation");');
console.log(contextual[0]);

parser.dispose();
```

### Variable Messages

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Variable as message
const variableMessage = parser.parseAST('assert(x > 0, error_msg);');
console.log(variableMessage[0]);

// Function call as message
const functionMessage = parser.parseAST('assert(valid, get_error_message());');
console.log(functionMessage[0]);

parser.dispose();
```

## Edge Cases and Syntax Variations

### Missing Semicolons

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Assert without semicolon
const noSemicolon = parser.parseAST('assert(true)');
console.log(noSemicolon[0]);

// Assert with message but no semicolon
const messageNoSemicolon = parser.parseAST('assert(x > 0, "error")');
console.log(messageNoSemicolon[0]);

parser.dispose();
```

### Multiple Assert Statements

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

const multipleAsserts = parser.parseAST(`
  assert(x > 0);
  assert(y < 100, "y too large");
  assert(z != 0);
`);

console.log(`Parsed ${multipleAsserts.length} statements`);
multipleAsserts.forEach((node, index) => {
  if (node.type === 'assert') {
    console.log(`Assert ${index + 1}:`, node);
  }
});

parser.dispose();
```

## Real-World Examples

### Geometric Validation

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

const geometricValidation = parser.parseAST(`
  // Validate sphere radius
  assert(radius > 0, "Sphere radius must be positive");
  
  // Validate cube dimensions
  assert(width > 0 && height > 0 && depth > 0, "All cube dimensions must be positive");
  
  // Validate polygon points
  assert(len(points) >= 3, "Polygon requires at least 3 points");
  
  // Validate angle range
  assert(angle >= 0 && angle <= 360, "Angle must be between 0 and 360 degrees");
`);

console.log(`Parsed ${geometricValidation.length} validation statements`);

parser.dispose();
```

### Parameter Validation

```typescript
const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

const parameterValidation = parser.parseAST(`
  // Module parameter validation
  module validated_cylinder(radius, height) {
    assert(radius > 0, "Cylinder radius must be positive");
    assert(height > 0, "Cylinder height must be positive");
    assert(radius < height, "Radius should be less than height for proper proportions");
    
    cylinder(r=radius, h=height);
  }
`);

console.log('Parameter validation example parsed successfully');

parser.dispose();
```

## Testing Assert Statements

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

describe('Assert Statement Parsing', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should parse basic assert statement', () => {
    const ast = parser.parseAST('assert(true);');
    
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('assert');
    expect(ast[0].condition).toBeDefined();
    expect(ast[0].message).toBeUndefined();
  });

  it('should parse assert statement with message', () => {
    const ast = parser.parseAST('assert(x > 0, "x must be positive");');
    
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('assert');
    expect(ast[0].condition).toBeDefined();
    expect(ast[0].message).toBeDefined();
  });
});
```

## Best Practices

1. **Use Descriptive Messages**: Always provide clear, actionable error messages
2. **Validate Early**: Place assertions at the beginning of modules and functions
3. **Check Preconditions**: Validate input parameters and assumptions
4. **Avoid Side Effects**: Keep assertion conditions pure (no side effects)
5. **Test Edge Cases**: Include assertions for boundary conditions

## Common Patterns

- **Range Validation**: `assert(value >= min && value <= max, "Value out of range")`
- **Non-Zero Check**: `assert(value != 0, "Division by zero")`
- **Array Length**: `assert(len(array) > 0, "Array cannot be empty")`
- **Positive Values**: `assert(value > 0, "Value must be positive")`
- **Type Validation**: `assert(is_num(value), "Expected numeric value")`
