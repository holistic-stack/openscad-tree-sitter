# Assert Statement Visitor Documentation

## Overview

The `AssertStatementVisitor` provides complete support for parsing OpenSCAD assert statements, enabling runtime validation and debugging capabilities. This visitor handles all variations of assert statements including basic assertions, complex conditions, and optional error messages.

## Features

### ✅ Supported Assert Statement Types

- **Basic Assert Statements**: `assert(true)`, `assert(false)`, `assert(x)`
- **Complex Conditions**: `assert(x > 0)`, `assert(x > 0 && y < 100)`, `assert(len(points) == 3)`
- **Assert with Messages**: `assert(x > 0, "x must be positive")`, `assert(len(points) >= 3, "Need at least 3 points")`
- **Edge Cases**: Missing semicolons, malformed syntax, multiple assert statements

### ✅ Technical Implementation

- **Real CST Parsing**: Uses actual tree-sitter `assert_statement` nodes instead of hardcoded patterns
- **Expression System Integration**: Leverages existing expression visitor system for conditions and messages
- **Proper Message Detection**: Correctly distinguishes between condition expressions and message expressions
- **Type Safety**: Full TypeScript support with proper AST node types
- **Error Handling**: Comprehensive error handling for malformed assert statements

## Architecture

### Integration with Visitor System

The `AssertStatementVisitor` is integrated into the parser's visitor system through:

1. **CompositeVisitor Integration**: Added to the list of visitors in `VisitorASTGenerator`
2. **BaseASTVisitor Enhancement**: Added `assert_statement` detection in `visitStatement` method
3. **Expression System Integration**: Uses existing expression visitors for parsing conditions and messages

### AST Node Structure

```typescript
interface AssertStatementNode extends ASTNode {
  type: 'assert';
  condition: ExpressionNode;
  message?: ExpressionNode;
  location: NodeLocation;
}
```

## Usage Examples

### Basic Assert Statements

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad-parser/core';

const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

// Basic assertion
const ast1 = parser.parseAST('assert(true);');
console.log(ast1[0]); // AssertStatementNode with condition

// Variable assertion
const ast2 = parser.parseAST('assert(x > 0);');
console.log(ast2[0]); // AssertStatementNode with binary expression condition
```

### Assert Statements with Messages

```typescript
// Assert with string message
const ast3 = parser.parseAST('assert(x > 0, "x must be positive");');
console.log(ast3[0]); // AssertStatementNode with condition and message

// Assert with variable message
const ast4 = parser.parseAST('assert(len(points) >= 3, error_msg);');
console.log(ast4[0]); // AssertStatementNode with function call condition and variable message
```

### Complex Conditions

```typescript
// Logical operations
const ast5 = parser.parseAST('assert(x > 0 && y < 100);');
console.log(ast5[0]); // AssertStatementNode with logical AND condition

// Function calls in conditions
const ast6 = parser.parseAST('assert(len(points) == 3);');
console.log(ast6[0]); // AssertStatementNode with function call condition
```

## Implementation Details

### Message Detection Logic

The visitor uses a sophisticated message detection algorithm that:

1. **Looks for comma separators**: Identifies the comma that separates condition from message
2. **Finds direct child expressions**: Only considers direct child expressions after commas
3. **Avoids nested expressions**: Prevents false positives from complex condition expressions

```typescript
private findMessageExpression(node: TSNode): TSNode | null {
  // Look for direct child expressions separated by commas
  // The structure should be: assert ( expression , expression )
  let foundComma = false;
  
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;
    
    // Look for comma separator
    if (child.type === ',' || child.text === ',') {
      foundComma = true;
      continue;
    }
    
    // If we found a comma and this is an expression, it's the message
    if (foundComma && child.type === 'expression') {
      return child;
    }
  }
  
  return null;
}
```

### Error Handling

The visitor provides comprehensive error handling for:

- **Missing conditions**: When assert statement has no condition expression
- **Malformed syntax**: When the CST structure is unexpected
- **Expression parsing errors**: When condition or message expressions fail to parse

## Testing

The implementation includes comprehensive test coverage with 15 test cases covering:

- **Basic functionality**: Simple boolean and variable conditions
- **Complex expressions**: Binary operations, logical operations, function calls
- **Message handling**: String literals and variable messages
- **Syntax variations**: With and without semicolons, multiple statements
- **Error scenarios**: Malformed syntax and invalid expressions

### Test Results

✅ **15/15 tests passing (100% success rate)**

## Files

### Core Implementation
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/assert-statement-visitor/assert-statement-visitor.ts`
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/assert-statement-visitor/assert-statement-visitor.test.ts`

### Integration Points
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitor-ast-generator.ts`
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/base-ast-visitor.ts`

## Impact

This implementation provides complete support for OpenSCAD's assert statements, enabling:

- **Runtime Validation**: Developers can add assertions to validate assumptions
- **Debugging Support**: Error messages help identify issues in OpenSCAD code
- **Code Quality**: Assertions improve code reliability and maintainability
- **Parser Completeness**: Eliminates gaps in OpenSCAD language support
