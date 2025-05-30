# AST Approach: Operator Access in All Expression Types

## Overview

This document provides comprehensive guidance on accessing operators and structural elements across all expression types in our OpenSCAD tree-sitter grammar. It extends beyond binary expressions to cover unary expressions, conditional expressions, and other operator-containing constructs.

## Expression Types and Operator Access

### 1. Binary Expressions

**Structure**: `[left_operand, operator, right_operand]`

```typescript
function getBinaryOperator(node: SyntaxNode): string {
  // Operator is always at child index 1
  return node.child(1)?.text || '';
}

// Example: "a + b" -> "+"
// Example: "x && y" -> "&&"
// Example: "value == 10" -> "=="
```

**All Binary Operators**:
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `^`
- Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
- Logical: `&&`, `||`

### 2. Unary Expressions

**Structure**: `[operator, operand]`

```typescript
function getUnaryOperator(node: SyntaxNode): string {
  // Operator is always at child index 0
  return node.child(0)?.text || '';
}

function getUnaryOperand(node: SyntaxNode): SyntaxNode | null {
  // Operand is always the first named child
  return node.namedChild(0);
}

// Example: "!true" -> operator: "!", operand: "true"
// Example: "-x" -> operator: "-", operand: "x"
```

**All Unary Operators**:
- Logical NOT: `!`
- Arithmetic negation: `-`

### 3. Conditional Expressions (Ternary)

**Structure**: `[condition, "?", consequence, ":", alternative]`

```typescript
function getConditionalOperators(node: SyntaxNode): {question: string, colon: string} {
  // Question mark is at child index 1
  // Colon is at child index 3
  return {
    question: node.child(1)?.text || '',
    colon: node.child(3)?.text || ''
  };
}

function getConditionalParts(node: SyntaxNode): {
  condition: SyntaxNode | null,
  consequence: SyntaxNode | null,
  alternative: SyntaxNode | null
} {
  return {
    condition: node.namedChild(0),    // condition field
    consequence: node.namedChild(1),  // consequence field
    alternative: node.namedChild(2)   // alternative field
  };
}

// Example: "x > 0 ? 'positive' : 'negative'"
// Operators: "?" and ":"
// Parts: condition="x > 0", consequence="'positive'", alternative="'negative'"
```

### 4. Assignment Expressions

**Structure**: `[identifier, "=", value]`

```typescript
function getAssignmentOperator(node: SyntaxNode): string {
  // Assignment operator is at child index 1
  return node.child(1)?.text || '';
}

function getAssignmentParts(node: SyntaxNode): {
  name: SyntaxNode | null,
  value: SyntaxNode | null
} {
  return {
    name: node.namedChild(0),   // name field
    value: node.namedChild(1)   // value field
  };
}

// Example: "x = 10" -> operator: "=", name: "x", value: "10"
```

### 5. Index Expressions

**Structure**: `[array, "[", index, "]"]`

```typescript
function getIndexOperators(node: SyntaxNode): {open: string, close: string} {
  // Opening bracket is at child index 1
  // Closing bracket is at child index 3
  return {
    open: node.child(1)?.text || '',
    close: node.child(3)?.text || ''
  };
}

function getIndexParts(node: SyntaxNode): {
  array: SyntaxNode | null,
  index: SyntaxNode | null
} {
  return {
    array: node.namedChild(0),  // array field
    index: node.namedChild(1)   // index field
  };
}

// Example: "arr[5]" -> operators: "[" and "]", array: "arr", index: "5"
```

### 6. Member Access Expressions

**Structure**: `[object, ".", property]`

```typescript
function getMemberOperator(node: SyntaxNode): string {
  // Dot operator is at child index 1
  return node.child(1)?.text || '';
}

function getMemberParts(node: SyntaxNode): {
  object: SyntaxNode | null,
  property: SyntaxNode | null
} {
  return {
    object: node.namedChild(0),   // object field
    property: node.namedChild(1)  // property field
  };
}

// Example: "obj.size" -> operator: ".", object: "obj", property: "size"
```

### 7. Function Call Expressions

**Structure**: `[function, "(", arguments, ")"]`

```typescript
function getCallOperators(node: SyntaxNode): {open: string, close: string} {
  // Opening parenthesis is at child index 1
  // Closing parenthesis is at child index 3
  return {
    open: node.child(1)?.text || '',
    close: node.child(3)?.text || ''
  };
}

function getCallParts(node: SyntaxNode): {
  function: SyntaxNode | null,
  arguments: SyntaxNode | null
} {
  return {
    function: node.namedChild(0),   // function field
    arguments: node.namedChild(1)   // arguments field
  };
}

// Example: "sin(45)" -> operators: "(" and ")", function: "sin", arguments: "45"
```

## Comprehensive Expression Analyzer

```typescript
class ExpressionAnalyzer {
  static analyzeExpression(node: SyntaxNode): ExpressionInfo {
    switch (node.type) {
      case 'binary_expression':
        return this.analyzeBinaryExpression(node);
      case 'unary_expression':
        return this.analyzeUnaryExpression(node);
      case 'conditional_expression':
        return this.analyzeConditionalExpression(node);
      case 'assignment_statement':
        return this.analyzeAssignmentExpression(node);
      case 'index_expression':
        return this.analyzeIndexExpression(node);
      case 'member_expression':
        return this.analyzeMemberExpression(node);
      case 'call_expression':
        return this.analyzeCallExpression(node);
      default:
        return { type: node.type, operators: [], parts: {} };
    }
  }

  private static analyzeBinaryExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'binary_expression',
      operators: [node.child(1)?.text || ''],
      parts: {
        left: node.namedChild(0),
        right: node.namedChild(1)
      },
      precedence: this.getOperatorPrecedence(node.child(1)?.text || ''),
      associativity: this.getOperatorAssociativity(node.child(1)?.text || '')
    };
  }

  private static analyzeUnaryExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'unary_expression',
      operators: [node.child(0)?.text || ''],
      parts: {
        operand: node.namedChild(0)
      },
      precedence: 8 // Unary operators have high precedence
    };
  }

  private static analyzeConditionalExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'conditional_expression',
      operators: ['?', ':'],
      parts: {
        condition: node.namedChild(0),
        consequence: node.namedChild(1),
        alternative: node.namedChild(2)
      },
      precedence: 1 // Conditional has low precedence
    };
  }

  private static analyzeAssignmentExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'assignment_statement',
      operators: ['='],
      parts: {
        name: node.namedChild(0),
        value: node.namedChild(1)
      }
    };
  }

  private static analyzeIndexExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'index_expression',
      operators: ['[', ']'],
      parts: {
        array: node.namedChild(0),
        index: node.namedChild(1)
      },
      precedence: 10 // Index has high precedence
    };
  }

  private static analyzeMemberExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'member_expression',
      operators: ['.'],
      parts: {
        object: node.namedChild(0),
        property: node.namedChild(1)
      },
      precedence: 10 // Member access has high precedence
    };
  }

  private static analyzeCallExpression(node: SyntaxNode): ExpressionInfo {
    return {
      type: 'call_expression',
      operators: ['(', ')'],
      parts: {
        function: node.namedChild(0),
        arguments: node.namedChild(1)
      },
      precedence: 9 // Function calls have high precedence
    };
  }

  private static getOperatorPrecedence(operator: string): number {
    const precedenceMap: Record<string, number> = {
      '||': 1, '&&': 2, '==': 3, '!=': 3,
      '<': 4, '<=': 4, '>': 4, '>=': 4,
      '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 7
    };
    return precedenceMap[operator] || 0;
  }

  private static getOperatorAssociativity(operator: string): 'left' | 'right' {
    return operator === '^' ? 'right' : 'left';
  }
}

interface ExpressionInfo {
  type: string;
  operators: string[];
  parts: Record<string, SyntaxNode | null>;
  precedence?: number;
  associativity?: 'left' | 'right';
}
```

## Practical Usage Examples

### Example 1: Expression Walker

```typescript
function walkExpressions(node: SyntaxNode, callback: (expr: ExpressionInfo) => void): void {
  const expressionTypes = [
    'binary_expression', 'unary_expression', 'conditional_expression',
    'assignment_statement', 'index_expression', 'member_expression', 'call_expression'
  ];

  if (expressionTypes.includes(node.type)) {
    const info = ExpressionAnalyzer.analyzeExpression(node);
    callback(info);
  }

  for (const child of node.children) {
    walkExpressions(child, callback);
  }
}

// Usage
walkExpressions(tree.rootNode, (expr) => {
  console.log(`Found ${expr.type} with operators: ${expr.operators.join(', ')}`);
});
```

### Example 2: Operator Frequency Counter

```typescript
function countOperators(sourceCode: string): Record<string, number> {
  const parser = new Parser();
  parser.setLanguage(OpenSCAD);
  const tree = parser.parse(sourceCode);
  
  const operatorCounts: Record<string, number> = {};
  
  walkExpressions(tree.rootNode, (expr) => {
    expr.operators.forEach(op => {
      operatorCounts[op] = (operatorCounts[op] || 0) + 1;
    });
  });
  
  return operatorCounts;
}
```

### Example 3: Expression Complexity Calculator

```typescript
function calculateExpressionComplexity(node: SyntaxNode): number {
  const info = ExpressionAnalyzer.analyzeExpression(node);
  let complexity = info.operators.length;
  
  // Add complexity for nested expressions
  Object.values(info.parts).forEach(part => {
    if (part && isExpression(part)) {
      complexity += calculateExpressionComplexity(part);
    }
  });
  
  return complexity;
}

function isExpression(node: SyntaxNode): boolean {
  const expressionTypes = [
    'binary_expression', 'unary_expression', 'conditional_expression',
    'index_expression', 'member_expression', 'call_expression'
  ];
  return expressionTypes.includes(node.type);
}
```

## Best Practices

### 1. Always Check Node Type Before Analysis
```typescript
function safeAnalyzeExpression(node: SyntaxNode): ExpressionInfo | null {
  const supportedTypes = [
    'binary_expression', 'unary_expression', 'conditional_expression',
    'assignment_statement', 'index_expression', 'member_expression', 'call_expression'
  ];
  
  if (!supportedTypes.includes(node.type)) {
    return null;
  }
  
  return ExpressionAnalyzer.analyzeExpression(node);
}
```

### 2. Handle Missing Operators Gracefully
```typescript
function getOperatorSafely(node: SyntaxNode, index: number): string {
  const operatorNode = node.child(index);
  if (!operatorNode) {
    console.warn(`Missing operator at index ${index} in ${node.type}`);
    return '';
  }
  return operatorNode.text;
}
```

### 3. Use Type Guards for Safety
```typescript
function isBinaryExpression(node: SyntaxNode): boolean {
  return node.type === 'binary_expression' && node.childCount >= 3;
}

function isUnaryExpression(node: SyntaxNode): boolean {
  return node.type === 'unary_expression' && node.childCount >= 2;
}
```

## Conclusion

This comprehensive approach to operator access across all expression types provides:

- **Consistent methodology** for accessing operators in any expression
- **Complete coverage** of all operator-containing constructs
- **Practical utilities** for expression analysis and manipulation
- **Safe access patterns** with proper error handling

The structural approach maintains semantic accuracy while providing full access to all operator information needed for advanced language tooling, code analysis, and editor features.

## Related Documentation

- [Binary Expression Operator Access](./suggestion-ast-approach-operator-access.md)
- [Grammar Foundation Improvements](../packages/tree-sitter-openscad/full-code-openscad-syntax-test-coverage.md)
- [Advanced Tree-Sitter Semantic Enhancements](../packages/tree-sitter-openscad/full-code-openscad-syntax-test-coverage.md#advanced-tree-sitter-semantic-enhancements)
