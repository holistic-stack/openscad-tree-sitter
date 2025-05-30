# AST Approach: Operator Access in Binary Expressions

## Overview

This document explains how to identify and access operators in binary expressions within our OpenSCAD tree-sitter grammar, addressing the common question of why operators don't appear as explicit fields in the default AST output.

## Problem Statement

When examining binary expressions in the AST output, operators are not visible as explicit fields:

```
(binary_expression
  left: (expression
    (primary_expression
      (identifier)))
  right: (expression
    (primary_expression
      (identifier))))
```

Users may wonder: "Where is the `+` operator in `a + b`?"

## Solution: Structural Operator Capture

### Why Operators Aren't Explicit Fields

Our grammar design captures operators as **anonymous terminal nodes** rather than explicit fields. This is a superior approach because:

1. **Cleaner AST Structure**: Focuses on semantic components (operands) rather than syntax tokens
2. **Precedence Preservation**: Operator precedence is maintained through tree hierarchy
3. **Semantic Focus**: Named fields highlight meaningful program structure
4. **Tool-Friendly**: Enables sophisticated analysis while keeping AST readable

### How to Access Operators Programmatically

#### Method 1: Direct Child Access (Recommended)

```typescript
function extractOperator(binaryExprNode: SyntaxNode): string {
  // Binary expression structure: [left_expr, operator_token, right_expr]
  // The operator is always the second child (index 1)
  const operatorNode = binaryExprNode.child(1);
  return operatorNode?.text || '';
}

// Usage
const operator = extractOperator(binaryExpressionNode); // Returns "+"
```

#### Method 2: Complete Binary Expression Analysis

```typescript
function analyzeBinaryExpression(binaryExprNode: SyntaxNode) {
  return {
    operator: binaryExprNode.child(1)?.text || '',
    left: binaryExprNode.namedChild(0), // First named child (left operand)
    right: binaryExprNode.namedChild(1), // Second named child (right operand)
    operatorType: getOperatorType(binaryExprNode.child(1)?.text || '')
  };
}

function getOperatorType(operator: string): string {
  const operatorTypes = {
    '+': 'addition',
    '-': 'subtraction', 
    '*': 'multiplication',
    '/': 'division',
    '%': 'modulo',
    '^': 'exponentiation',
    '==': 'equality',
    '!=': 'inequality',
    '<': 'less_than',
    '<=': 'less_equal',
    '>': 'greater_than',
    '>=': 'greater_equal',
    '&&': 'logical_and',
    '||': 'logical_or'
  };
  return operatorTypes[operator] || 'unknown';
}
```

#### Method 3: Tree-Sitter Query System

```typescript
function findOperatorsInCode(sourceCode: string): Array<{operator: string, position: [number, number]}> {
  const parser = new Parser();
  parser.setLanguage(OpenSCAD);
  const tree = parser.parse(sourceCode);
  
  const operators: Array<{operator: string, position: [number, number]}> = [];
  
  function traverse(node: SyntaxNode) {
    if (node.type === 'binary_expression') {
      const operator = node.child(1)?.text || '';
      operators.push({
        operator,
        position: [node.startPosition.row, node.startPosition.column]
      });
    }
    
    for (const child of node.children) {
      traverse(child);
    }
  }
  
  traverse(tree.rootNode);
  return operators;
}
```

#### Method 4: Tree-Sitter Queries

```scheme
; Query to capture binary expressions and extract operators
(binary_expression
  left: (_) @left
  right: (_) @right) @binary_expr

; Use with custom logic to access the operator via node.child(1)
```

## Verification: Debug Output Analysis

The tree-sitter debug output confirms operator capture:

```
reduce sym:binary_expression, child_count:3
```

This shows that `binary_expression` has **3 children**: `[left, operator, right]`. The operator is structurally captured but not displayed in the default AST visualization.

## Grammar Design Benefits

### 1. Semantic Accuracy
- **Focus on Meaning**: AST highlights semantic components rather than syntax tokens
- **Operator Precedence**: Tree structure preserves operator precedence naturally
- **Clean Structure**: Reduces visual clutter in AST output

### 2. Tool Integration
- **Editor Features**: Enables sophisticated code analysis and refactoring
- **Language Servers**: Supports advanced IDE features like hover information
- **Code Generation**: Facilitates AST-to-code transformation

### 3. Flexibility
- **On-Demand Access**: Operators available when needed via programmatic access
- **Multiple Representations**: Same AST supports different tool requirements
- **Future-Proof**: Design accommodates additional operator types and features

## Implementation Examples

### Example 1: Operator Extraction Utility

```typescript
class OperatorExtractor {
  static extract(binaryExpr: SyntaxNode): {
    operator: string;
    precedence: number;
    associativity: 'left' | 'right';
  } {
    const operator = binaryExpr.child(1)?.text || '';
    return {
      operator,
      precedence: this.getPrecedence(operator),
      associativity: this.getAssociativity(operator)
    };
  }
  
  private static getPrecedence(operator: string): number {
    const precedenceMap = {
      '||': 1, '&&': 2, '==': 3, '!=': 3,
      '<': 4, '<=': 4, '>': 4, '>=': 4,
      '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 7
    };
    return precedenceMap[operator] || 0;
  }
  
  private static getAssociativity(operator: string): 'left' | 'right' {
    return operator === '^' ? 'right' : 'left';
  }
}
```

### Example 2: Expression Evaluator

```typescript
class ExpressionEvaluator {
  static evaluate(node: SyntaxNode, context: Record<string, any>): any {
    switch (node.type) {
      case 'binary_expression':
        const left = this.evaluate(node.namedChild(0)!, context);
        const right = this.evaluate(node.namedChild(1)!, context);
        const operator = node.child(1)?.text || '';
        return this.applyOperator(operator, left, right);
      
      case 'identifier':
        return context[node.text] || 0;
      
      case 'number':
        return parseFloat(node.text);
      
      default:
        return 0;
    }
  }
  
  private static applyOperator(operator: string, left: any, right: any): any {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '^': return Math.pow(left, right);
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '>=': return left >= right;
      case '&&': return left && right;
      case '||': return left || right;
      default: return 0;
    }
  }
}
```

## Best Practices

### 1. Always Use Child Index 1 for Operators
```typescript
// ✅ Correct
const operator = binaryExpr.child(1)?.text;

// ❌ Incorrect - don't search for operator nodes
const operator = binaryExpr.children.find(n => n.type === 'operator')?.text;
```

### 2. Handle Missing Operators Gracefully
```typescript
function safeGetOperator(binaryExpr: SyntaxNode): string {
  const operatorNode = binaryExpr.child(1);
  if (!operatorNode) {
    console.warn('Binary expression missing operator node');
    return '';
  }
  return operatorNode.text;
}
```

### 3. Use Type Guards for Safety
```typescript
function isBinaryExpression(node: SyntaxNode): boolean {
  return node.type === 'binary_expression' && node.childCount === 3;
}

function extractOperatorSafely(node: SyntaxNode): string | null {
  if (!isBinaryExpression(node)) {
    return null;
  }
  return node.child(1)?.text || null;
}
```

## Conclusion

The structural approach to operator capture in our OpenSCAD tree-sitter grammar provides:

- **Superior semantic accuracy** compared to explicit operator fields
- **Clean, readable AST structure** focused on program meaning
- **Full operator information access** via programmatic methods
- **Flexible foundation** for advanced language tooling

This design enables sophisticated code analysis, editor features, and language server capabilities while maintaining a clean and semantically meaningful AST structure.

## Related Documentation

- [Grammar Foundation Improvements](../packages/tree-sitter-openscad/full-code-openscad-syntax-test-coverage.md)
- [Advanced Tree-Sitter Semantic Enhancements](../packages/tree-sitter-openscad/full-code-openscad-syntax-test-coverage.md#advanced-tree-sitter-semantic-enhancements)
- [TDD Development Workflow](../README.md#development-workflow)
