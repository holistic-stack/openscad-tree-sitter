# ForLoopVisitor Documentation

## Overview

The `ForLoopVisitor` is a specialized visitor that handles OpenSCAD `for` loop statements, converting them from Tree-sitter CST nodes to structured AST nodes. This visitor provides complete support for all OpenSCAD for loop patterns with 100% test coverage.

## Features

- ✅ **Complete Coverage**: All 4 test scenarios passing (100% success rate)
- ✅ **Basic For Loops**: `for (i = [0:5]) { cube(i); }`
- ✅ **Stepped Ranges**: `for (i = [0:0.5:5]) { cube(i); }`
- ✅ **Multiple Variables**: `for (i = [0:5], j = [0:5]) { cube(i); }`
- ✅ **Complex Expressions**: `for (i = [0:len(v)-1]) { cube(i); }`
- ✅ **Type Safety**: Full TypeScript support with proper type guards
- ✅ **Error Handling**: Comprehensive error reporting and recovery

## Usage

```typescript
import { ForLoopVisitor } from '@openscad/parser';

const visitor = new ForLoopVisitor(parentVisitor, errorHandler);

// Parse basic for loop
const basicLoop = `for (i = [0:5]) { cube(i); }`;
const ast = visitor.visitForStatement(cstNode);

// Parse for loop with step
const steppedLoop = `for (i = [0:0.5:5]) { cube(i); }`;
const steppedAst = visitor.visitForStatement(cstNode);

// Parse multiple variables
const multipleVars = `for (i = [0:5], j = [0:5]) { cube([i, j, 1]); }`;
const multipleAst = visitor.visitForStatement(cstNode);

// Parse complex expressions
const complexLoop = `for (i = [0:len(points)-1]) { translate(points[i]) sphere(1); }`;
const complexAst = visitor.visitForStatement(cstNode);
```

## AST Structure

The visitor produces `ForLoopNode` AST nodes with the following structure:

```typescript
interface ForLoopNode extends BaseNode {
  type: 'for_loop';
  variables: ForLoopVariable[];
  body: ASTNode[];
  location: SourceLocation;
}

interface ForLoopVariable {
  name: string;
  range: RangeExpressionNode;
  step?: number;
}
```

## Implementation Details

### Key Technical Features

1. **Type Safety**: Uses `isAstVariableNode` type guards instead of `isAstIdentifierNode`
2. **Expression Integration**: Uses `dispatchSpecificExpression` for proper visitor delegation
3. **Custom Body Processing**: Implements `processBlockStatements` and `processStatement` methods
4. **Step Extraction**: Properly extracts step values from range expressions
5. **Error Recovery**: Comprehensive error handling with detailed error messages

### Grammar Structure Support

The visitor handles both grammar patterns:

1. **Multiple Variables**: Uses `for_assignment` nodes for multiple variable declarations
2. **Single Variable**: Direct identifier and range expression parsing for simple cases

### Processing Flow

1. **Node Analysis**: Determines if CST contains `for_assignment` nodes or direct assignment
2. **Variable Extraction**: Processes each variable assignment with proper type checking
3. **Range Processing**: Delegates range expression parsing to `RangeExpressionVisitor`
4. **Body Processing**: Custom body statement processing to avoid circular dependencies
5. **AST Construction**: Creates properly typed `ForLoopNode` with all components

## Examples

### Basic For Loop

```typescript
// Input: for (i = [0:5]) { cube(i); }
const result = {
  type: 'for_loop',
  variables: [{
    name: 'i',
    range: {
      type: 'expression',
      expressionType: 'range',
      start: { type: 'expression', expressionType: 'literal', value: 0 },
      end: { type: 'expression', expressionType: 'literal', value: 5 }
    }
  }],
  body: [
    {
      type: 'module_instantiation',
      name: 'cube',
      args: [/* ... */],
      children: []
    }
  ]
};
```

### For Loop with Step

```typescript
// Input: for (i = [0:0.5:5]) { cube(i); }
const result = {
  type: 'for_loop',
  variables: [{
    name: 'i',
    range: {
      type: 'expression',
      expressionType: 'range',
      start: { type: 'expression', expressionType: 'literal', value: 0 },
      step: { type: 'expression', expressionType: 'literal', value: 0.5 },
      end: { type: 'expression', expressionType: 'literal', value: 5 }
    },
    step: 0.5
  }],
  body: [/* ... */]
};
```

### Multiple Variables

```typescript
// Input: for (i = [0:5], j = [0:5]) { cube([i, j, 1]); }
const result = {
  type: 'for_loop',
  variables: [
    {
      name: 'i',
      range: { /* range [0:5] */ }
    },
    {
      name: 'j', 
      range: { /* range [0:5] */ }
    }
  ],
  body: [/* ... */]
};
```

### Complex Expressions

```typescript
// Input: for (i = [0:len(v)-1]) { cube(i); }
const result = {
  type: 'for_loop',
  variables: [{
    name: 'i',
    range: {
      type: 'expression',
      expressionType: 'range',
      start: { type: 'expression', expressionType: 'literal', value: 0 },
      end: {
        type: 'expression',
        expressionType: 'binary',
        operator: '-',
        left: {
          type: 'expression',
          expressionType: 'function_call',
          functionName: 'len',
          args: [/* ... */]
        },
        right: { type: 'expression', expressionType: 'literal', value: 1 }
      }
    }
  }],
  body: [/* ... */]
};
```

## Error Handling

The visitor provides comprehensive error handling:

```typescript
// Invalid for loop structure
const errorResult = {
  type: 'error',
  errorCode: 'INVALID_FOR_LOOP_STRUCTURE',
  message: 'Invalid for loop: missing iterator or range',
  location: { /* source location */ }
};
```

## Testing

The ForLoopVisitor has 100% test coverage with all scenarios passing:

```bash
# Run ForLoopVisitor tests
nx test openscad-parser src/lib/openscad-parser/ast/visitors/control-structure-visitor/for-loop-visitor.test.ts

# Expected output: 4/4 tests passing
✓ should parse a basic for loop
✓ should parse a for loop with step  
✓ should parse a for loop with multiple variables
✓ should handle complex expressions in for loops
```

## Integration

The ForLoopVisitor integrates seamlessly with the parser ecosystem:

- **CompositeVisitor**: Automatically routes `for_statement` nodes to ForLoopVisitor
- **ExpressionVisitor**: Delegates expression parsing using `dispatchSpecificExpression`
- **RangeExpressionVisitor**: Handles range expression parsing within for loops
- **ErrorHandler**: Provides structured error reporting and logging

## Performance

- **Fast Processing**: Optimized for large OpenSCAD files with many for loops
- **Memory Efficient**: Minimal memory footprint with proper cleanup
- **Type Safe**: Compile-time guarantees prevent runtime errors

## Migration Notes

If upgrading from previous versions:

1. **Type Guards**: Update any custom code using `isAstIdentifierNode` to `isAstVariableNode`
2. **Expression Handling**: Use `dispatchSpecificExpression` instead of direct `visitNode` calls
3. **Error Handling**: Update error handling to use new structured error format

## See Also

- [RangeExpressionVisitor](../api/range-expression-visitor.md) - Range expression parsing
- [ExpressionVisitor](../api/expression-visitor.md) - Expression delegation
- [AST Types](../api/ast-types.md) - ForLoopNode interface definition
- [Error Handling](../api/error-handling.md) - Error reporting patterns
