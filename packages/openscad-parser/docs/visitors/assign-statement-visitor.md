# AssignStatementVisitor

The `AssignStatementVisitor` is responsible for parsing OpenSCAD assign statements and converting them into structured AST nodes. Assign statements are deprecated in OpenSCAD but still supported for legacy code compatibility.

## Overview

The AssignStatementVisitor handles the parsing of assign statements which follow the pattern:
```openscad
assign(var1 = value1, var2 = value2, ...) { statements }
```

## Class Definition

```typescript
export class AssignStatementVisitor extends BaseASTVisitor {
  constructor(sourceCode: string, errorHandler: ErrorHandler);
  
  visitAssignStatement(node: TSNode): AssignStatementNode | null;
  private processAssignAssignment(node: TSNode): AssignmentNode | null;
  private processExpression(node: TSNode): ExpressionNode | null;
}
```

## Key Features

### Multiple Assignment Support
- Handles single assignments: `assign(x = 5) cube(x);`
- Handles multiple assignments: `assign(x = 5, y = 10) cube([x, y, 1]);`
- Supports complex expressions in assignment values

### Expression Integration
- Leverages existing expression visitor system for assignment values
- Supports arithmetic expressions, function calls, arrays, and ranges
- Proper type handling for different expression types

### Error Handling
- Comprehensive error handling for malformed assign statements
- Graceful degradation for missing components
- Meaningful error messages with context information

### Real CST Parsing
- Uses actual tree-sitter `assign_statement` nodes
- Processes `assign_assignment` child nodes for individual assignments
- Extracts body statements or blocks correctly

## Usage Examples

### Basic Usage

```typescript
import { AssignStatementVisitor } from '@openscad/parser';
import { SimpleErrorHandler } from '@openscad/parser';

const sourceCode = 'assign(x = 5) cube(x);';
const errorHandler = new SimpleErrorHandler();
const visitor = new AssignStatementVisitor(sourceCode, errorHandler);

// Assuming you have a parsed CST node
const assignNode = visitor.visitAssignStatement(cstNode);

console.log(assignNode);
// {
//   type: 'assign',
//   assignments: [
//     { type: 'assignment', variable: 'x', value: {...} }
//   ],
//   body: { type: 'module_instantiation', name: 'cube', ... }
// }
```

### Integration with Parser

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
await parser.init();

const code = 'assign(x = 5, y = 10) cube([x, y, 1]);';
const ast = parser.parseAST(code);

// The AssignStatementVisitor is automatically used by the parser
console.log(ast[0].type); // 'assign'
console.log(ast[0].assignments.length); // 2

parser.dispose();
```

## AST Output Structure

The visitor generates `AssignStatementNode` objects with the following structure:

```typescript
interface AssignStatementNode extends BaseNode {
  type: 'assign';
  assignments: AssignmentNode[];
  body: ASTNode;
  location: SourceLocation;
}

interface AssignmentNode extends BaseNode {
  type: 'assignment';
  variable: string;
  value: ExpressionNode;
  location: SourceLocation;
}
```

## Supported Assign Statement Patterns

### Single Assignment
```openscad
assign(x = 5) cube(x);
```

### Multiple Assignments
```openscad
assign(x = 5, y = 10, z = 15) cube([x, y, z]);
```

### Complex Expressions
```openscad
assign(result = a + b * 2) cube(result);
assign(angle = sin(45), radius = cos(30)) sphere(radius);
```

### Block Bodies
```openscad
assign(r = 10) {
  sphere(r);
  translate([r*2, 0, 0]) sphere(r);
}
```

### Array and Range Expressions
```openscad
assign(points = [[0,0], [1,1], [2,0]]) polygon(points);
assign(range = [1:5]) for(i = range) cube(i);
```

## Error Handling

The visitor provides comprehensive error handling:

### Missing Components
- Handles missing assignment names gracefully
- Manages missing assignment values
- Processes incomplete assign statements

### Malformed Syntax
- Recovers from syntax errors in assignments
- Handles missing parentheses or braces
- Provides meaningful error messages

### Expression Errors
- Delegates expression parsing to expression visitor system
- Handles complex expression parsing failures
- Maintains parsing context for error reporting

## Implementation Details

### Tree-sitter Integration
The visitor works with the tree-sitter grammar rules:
```javascript
assign_statement: seq(
  'assign',
  '(',
  optional(commaSep1(assign_assignment)),
  ')',
  choice(block, statement)
)

assign_assignment: seq(
  field('name', choice(identifier, special_variable)),
  '=',
  field('value', expression)
)
```

### Processing Flow
1. **Node Validation**: Verify the CST node is an `assign_statement`
2. **Assignment Extraction**: Process all `assign_assignment` child nodes
3. **Body Processing**: Extract and process the statement or block body
4. **AST Generation**: Create the final `AssignStatementNode`

### Expression Processing
The visitor integrates with the expression system:
- Uses `processExpression()` for assignment values
- Supports all expression types (literals, variables, function calls, arrays)
- Maintains proper type information and location data

## Testing

The visitor includes comprehensive test coverage:

### Test Categories
- Basic assign statements with single assignments
- Multiple assignments within assign statements
- Complex expressions in assignment values
- Block bodies vs single statements
- Edge cases and error handling

### Test Examples
```typescript
describe('AssignStatementVisitor', () => {
  it('should parse basic assign statement', () => {
    const code = 'assign(x = 5) cube(x);';
    const ast = parser.parseAST(code);
    
    expect(ast[0].type).toBe('assign');
    expect(ast[0].assignments).toHaveLength(1);
    expect(ast[0].assignments[0].variable).toBe('x');
  });
  
  it('should handle multiple assignments', () => {
    const code = 'assign(x = 5, y = 10) cube([x, y, 1]);';
    const ast = parser.parseAST(code);
    
    expect(ast[0].assignments).toHaveLength(2);
    expect(ast[0].assignments[0].variable).toBe('x');
    expect(ast[0].assignments[1].variable).toBe('y');
  });
});
```

## Integration

The AssignStatementVisitor is automatically integrated into the parser system:

### CompositeVisitor Integration
- Added to the visitor array in `VisitorASTGenerator`
- Automatically called for `assign_statement` nodes
- Proper error handler integration

### BaseASTVisitor Enhancement
- Added `visitAssignStatement` method to base visitor
- Integrated assign_statement detection in `visitStatement`
- Proper delegation to specialized visitor

## Related Documentation

- [Assert Statement Visitor](./assert-statement-visitor.md)
- [Base AST Visitor](../api/base-ast-visitor.md)
- [AST Types Reference](../api/ast-types.md)
- [Assign Statement Examples](../examples/assign-statements.md)
