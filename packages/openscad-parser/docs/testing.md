# Testing Guide

This document provides comprehensive guidance for testing with the OpenSCAD Parser library using the Real Parser Pattern.

## Real Parser Pattern

The OpenSCAD Parser library follows the "Real Parser Pattern" - a testing approach that uses real parser instances instead of mocks. This ensures tests accurately reflect real-world usage and catch integration issues.

### Why No Mocks?

1. **Accuracy**: Real parsers behave exactly like production code
2. **Integration Testing**: Catches issues between components
3. **Confidence**: Tests provide higher confidence in functionality
4. **Simplicity**: No complex mock setup or maintenance
5. **Performance**: Tests actual performance characteristics

### Core Principles

- **Always use real parser instances** in tests
- **Proper lifecycle management** with beforeEach/afterEach
- **No mocking** of OpenSCADParser or EnhancedOpenscadParser
- **Test isolation** through proper cleanup
- **Error handling** using real error handlers

## Standard Test Setup

### Basic Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

describe('OpenSCAD Parser Tests', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    // Create fresh instances for each test
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    
    // Initialize the parser
    await parser.init();
  });

  afterEach(() => {
    // Always clean up to prevent memory leaks
    parser.dispose();
  });

  it('should parse basic primitives', () => {
    const ast = parser.parseAST('cube([10, 20, 30]);');
    
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('cube');
    expect(ast[0].size).toEqual([10, 20, 30]);
  });
});
```

### Advanced Test Setup

For more complex testing scenarios:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser, SimpleErrorHandler, type ASTNode } from '@openscad/parser';

describe('Advanced Parser Tests', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
    
    // Optional: Verify no errors were collected unexpectedly
    const errors = errorHandler.getErrors();
    if (errors.length > 0) {
      console.warn('Unexpected errors in test:', errors);
    }
  });

  it('should handle complex nested structures', () => {
    const complexCode = `
      difference() {
        union() {
          cube([20, 20, 20]);
          translate([10, 0, 0]) sphere(5);
        }
        cylinder(h=30, r=3, center=true);
      }
    `;

    const ast = parser.parseAST(complexCode);
    
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('difference');
    
    const difference = ast[0] as DifferenceNode;
    expect(difference.children).toHaveLength(2);
    expect(difference.children[0].type).toBe('union');
    expect(difference.children[1].type).toBe('cylinder');
  });
});
```

## Test Categories

### Unit Tests

Test individual components in isolation:

```typescript
describe('Primitive Parsing', () => {
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

  describe('Cube Parsing', () => {
    it('should parse cube with single dimension', () => {
      const ast = parser.parseAST('cube(10);');
      
      expect(ast[0].type).toBe('cube');
      expect(ast[0].size).toBe(10);
      expect(ast[0].center).toBe(false);
    });

    it('should parse cube with vector dimensions', () => {
      const ast = parser.parseAST('cube([10, 20, 30]);');
      
      expect(ast[0].type).toBe('cube');
      expect(ast[0].size).toEqual([10, 20, 30]);
    });

    it('should parse cube with center parameter', () => {
      const ast = parser.parseAST('cube(10, center=true);');
      
      expect(ast[0].type).toBe('cube');
      expect(ast[0].center).toBe(true);
    });
  });
});
```

### Integration Tests

Test interactions between components:

```typescript
describe('Parser Integration', () => {
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

  it('should integrate CST and AST parsing', () => {
    const code = 'translate([5, 0, 0]) cube(10);';
    
    // Test CST parsing
    const cst = parser.parseCST(code);
    expect(cst).toBeDefined();
    expect(cst?.rootNode.type).toBe('source_file');
    
    // Test AST generation from same code
    const ast = parser.parseAST(code);
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('translate');
  });

  it('should handle incremental parsing', () => {
    const originalCode = 'cube(10);';
    const originalAST = parser.parseAST(originalCode);
    
    const updatedCode = 'cube(20);';
    const startIndex = originalCode.indexOf('10');
    const oldEndIndex = startIndex + 2;
    const newEndIndex = startIndex + 2;
    
    const updatedAST = parser.updateAST(updatedCode, startIndex, oldEndIndex, newEndIndex);
    
    expect(updatedAST[0].type).toBe('cube');
    expect(updatedAST[0].size).toBe(20);
  });
});
```

### Error Handling Tests

Test error scenarios and recovery:

```typescript
describe('Error Handling', () => {
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

  it('should handle syntax errors gracefully', () => {
    const invalidCode = 'cube([10, 20, 30);'; // Missing closing bracket
    
    // Should not throw, but collect errors
    const ast = parser.parseAST(invalidCode);
    
    const errors = errorHandler.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('bracket');
  });

  it('should recover from errors and continue parsing', () => {
    const mixedCode = `
      cube(10);           // Valid
      sphere([5, 10);     // Invalid
      cylinder(h=20, r=5); // Valid
    `;
    
    const ast = parser.parseAST(mixedCode);
    
    // Should have some valid nodes despite errors
    expect(ast.length).toBeGreaterThan(0);
    
    const errors = errorHandler.getErrors();
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

### Performance Tests

Test parsing performance with real data:

```typescript
describe('Performance Tests', () => {
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

  it('should parse large files efficiently', () => {
    // Generate large OpenSCAD code
    const largeCodes = Array.from({ length: 1000 }, (_, i) => 
      `translate([${i}, 0, 0]) cube(${i + 1});`
    );
    const largeCode = largeCodes.join('\n');
    
    const startTime = performance.now();
    const ast = parser.parseAST(largeCode);
    const endTime = performance.now();
    
    expect(ast).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(1000); // Should parse in under 1 second
  });

  it('should reuse parser instances efficiently', () => {
    const codes = [
      'cube(10);',
      'sphere(5);',
      'cylinder(h=20, r=3);'
    ];
    
    const startTime = performance.now();
    const results = codes.map(code => parser.parseAST(code));
    const endTime = performance.now();
    
    expect(results).toHaveLength(3);
    results.forEach(ast => {
      expect(ast).toHaveLength(1);
    });
    
    // Reusing parser should be fast
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Test Utilities

### Helper Functions

Create reusable test utilities:

```typescript
// test-utils.ts
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

export async function createTestParser(): Promise<{
  parser: EnhancedOpenscadParser;
  errorHandler: SimpleErrorHandler;
}> {
  const errorHandler = new SimpleErrorHandler();
  const parser = new EnhancedOpenscadParser(errorHandler);
  await parser.init();
  
  return { parser, errorHandler };
}

export function expectNoErrors(errorHandler: SimpleErrorHandler): void {
  const errors = errorHandler.getErrors();
  if (errors.length > 0) {
    throw new Error(`Unexpected errors: ${errors.map(e => e.message).join(', ')}`);
  }
}

export function expectErrors(errorHandler: SimpleErrorHandler, count: number): void {
  const errors = errorHandler.getErrors();
  expect(errors).toHaveLength(count);
}
```

### Custom Matchers

Create custom Jest/Vitest matchers:

```typescript
// custom-matchers.ts
import { expect } from 'vitest';
import type { ASTNode } from '@openscad/parser';

expect.extend({
  toBeValidAST(received: ASTNode[]) {
    const pass = Array.isArray(received) && received.every(node => 
      typeof node === 'object' && 
      typeof node.type === 'string'
    );
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be valid AST`
        : `Expected ${received} to be valid AST`
    };
  },

  toHaveNodeType(received: ASTNode, expected: string) {
    const pass = received.type === expected;
    
    return {
      pass,
      message: () => pass
        ? `Expected node not to have type ${expected}`
        : `Expected node to have type ${expected}, got ${received.type}`
    };
  }
});
```

## Running Tests

### Test Commands

Use the provided npm scripts for running tests:

```bash
# Run all tests
pnpm test

# Run parser-specific tests
pnpm test:parser

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test:parser:file --testFile src/lib/primitives.test.ts

# Run tests matching pattern
pnpm test:parser:file --testFile "**/cube*.test.ts"
```

### Test Configuration

The project uses Vitest with the following key configurations:

- **Environment**: Node.js with JSDOM for browser compatibility
- **Setup**: Automatic WASM loading and fetch mocking
- **Coverage**: Istanbul for code coverage reporting
- **Isolation**: Each test file runs in isolation

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Test both success and failure cases**
5. **Include edge cases** and boundary conditions

### Test Data

```typescript
// Use realistic OpenSCAD code in tests
const testCases = [
  {
    name: 'simple cube',
    code: 'cube(10);',
    expected: { type: 'cube', size: 10 }
  },
  {
    name: 'complex difference',
    code: `
      difference() {
        cube([20, 20, 20]);
        translate([10, 10, 10]) sphere(8);
      }
    `,
    expected: { type: 'difference', childCount: 2 }
  }
];

testCases.forEach(({ name, code, expected }) => {
  it(`should parse ${name}`, () => {
    const ast = parser.parseAST(code);
    expect(ast[0].type).toBe(expected.type);
    // Additional assertions...
  });
});
```

### Memory Management

```typescript
// Always dispose parsers in afterEach
afterEach(() => {
  parser.dispose();
  
  // Optional: Check for memory leaks in development
  if (process.env.NODE_ENV === 'development') {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
});
```

### Debugging Tests

```typescript
// Add debugging helpers for failing tests
it('should parse complex structure', () => {
  const code = 'complex OpenSCAD code...';
  
  // Debug CST if needed
  const cst = parser.parseCST(code);
  console.log('CST:', cst?.rootNode.toString());
  
  const ast = parser.parseAST(code);
  
  // Debug AST structure
  console.log('AST:', JSON.stringify(ast, null, 2));
  
  // Check for errors
  const errors = errorHandler.getErrors();
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
  
  expect(ast).toHaveLength(1);
});
```
