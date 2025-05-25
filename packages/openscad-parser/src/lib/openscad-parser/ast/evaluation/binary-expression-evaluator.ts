/**
 * @file Binary Expression Evaluator
 * 
 * Evaluates binary expressions with proper operator precedence and type handling.
 * Supports arithmetic, comparison, and logical operations.
 */

import { Node as TSNode } from 'web-tree-sitter';
import { BaseExpressionEvaluator } from './expression-evaluator';
import { ExpressionEvaluationContext, EvaluationResult } from './expression-evaluation-context';

/**
 * Binary expression evaluator with comprehensive operator support
 */
export class BinaryExpressionEvaluator extends BaseExpressionEvaluator {
  constructor() {
    super([
      'binary_expression',
      'additive_expression',
      'multiplicative_expression',
      'exponentiation_expression',
      'logical_or_expression',
      'logical_and_expression',
      'equality_expression',
      'relational_expression'
    ]);
  }

  getPriority(): number {
    return 80; // High priority for binary operations
  }

  evaluate(node: TSNode, context: ExpressionEvaluationContext): EvaluationResult {
    const cacheKey = this.createCacheKey(node);
    const cached = context.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Check recursion depth
    if (!context.checkRecursionDepth()) {
      return this.createErrorResult('Maximum recursion depth exceeded', context);
    }

    context.enterRecursion();

    try {
      const result = this.evaluateBinaryExpression(node, context);
      context.setCachedResult(cacheKey, result);
      return result;
    } finally {
      context.exitRecursion();
    }
  }

  private evaluateBinaryExpression(node: TSNode, context: ExpressionEvaluationContext): EvaluationResult {
    // Get operands using field names
    const leftNode = this.getChildByField(node, 'left');
    const operatorNode = this.getChildByField(node, 'operator');
    const rightNode = this.getChildByField(node, 'right');

    if (!leftNode || !operatorNode || !rightNode) {
      return this.createErrorResult(`Malformed binary expression: missing operands`, context);
    }

    const operator = operatorNode.text;

    // Evaluate operands using the main evaluator (will be injected)
    const leftResult = this.evaluateOperand(leftNode, context);
    const rightResult = this.evaluateOperand(rightNode, context);

    if (!leftResult || !rightResult) {
      return this.createErrorResult(`Failed to evaluate operands`, context);
    }

    // Perform operation based on operator
    return this.performOperation(operator, leftResult, rightResult, context);
  }

  private evaluateOperand(node: TSNode, context: ExpressionEvaluationContext): EvaluationResult | null {
    // This will be called by the main ExpressionEvaluatorRegistry
    // For now, we'll handle simple cases directly
    
    if (node.type === 'number') {
      const value = parseFloat(node.text);
      return {
        value: isNaN(value) ? 0 : value,
        type: 'number'
      };
    }

    if (node.type === 'identifier') {
      return context.getVariable(node.text) || {
        value: null,
        type: 'undef'
      };
    }

    // For complex expressions, we need the main evaluator
    // This is a placeholder - will be properly implemented in the registry
    return {
      value: 0,
      type: 'number'
    };
  }

  private performOperation(
    operator: string,
    left: EvaluationResult,
    right: EvaluationResult,
    context: ExpressionEvaluationContext
  ): EvaluationResult {
    
    switch (operator) {
      // Arithmetic operators
      case '+':
        return this.performAddition(left, right);
      case '-':
        return this.performSubtraction(left, right);
      case '*':
        return this.performMultiplication(left, right);
      case '/':
        return this.performDivision(left, right);
      case '%':
        return this.performModulo(left, right);
      case '^':
        return this.performExponentiation(left, right);

      // Comparison operators
      case '==':
        return this.performEquality(left, right);
      case '!=':
        return this.performInequality(left, right);
      case '<':
        return this.performLessThan(left, right);
      case '<=':
        return this.performLessThanOrEqual(left, right);
      case '>':
        return this.performGreaterThan(left, right);
      case '>=':
        return this.performGreaterThanOrEqual(left, right);

      // Logical operators
      case '&&':
        return this.performLogicalAnd(left, right);
      case '||':
        return this.performLogicalOr(left, right);

      default:
        return this.createErrorResult(`Unsupported operator: ${operator}`, context);
    }
  }

  // Arithmetic operations
  private performAddition(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    if (this.validateNumericOperands(left, right)) {
      return {
        value: (left.value as number) + (right.value as number),
        type: 'number'
      };
    }
    
    // String concatenation
    if (left.type === 'string' || right.type === 'string') {
      return {
        value: String(left.value) + String(right.value),
        type: 'string'
      };
    }

    return { value: 0, type: 'number' };
  }

  private performSubtraction(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) - this.toNumber(right),
      type: 'number'
    };
  }

  private performMultiplication(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) * this.toNumber(right),
      type: 'number'
    };
  }

  private performDivision(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    const rightNum = this.toNumber(right);
    if (rightNum === 0) {
      return { value: Infinity, type: 'number' };
    }
    return {
      value: this.toNumber(left) / rightNum,
      type: 'number'
    };
  }

  private performModulo(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    const rightNum = this.toNumber(right);
    if (rightNum === 0) {
      return { value: NaN, type: 'number' };
    }
    return {
      value: this.toNumber(left) % rightNum,
      type: 'number'
    };
  }

  private performExponentiation(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: Math.pow(this.toNumber(left), this.toNumber(right)),
      type: 'number'
    };
  }

  // Comparison operations
  private performEquality(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: left.value === right.value,
      type: 'boolean'
    };
  }

  private performInequality(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: left.value !== right.value,
      type: 'boolean'
    };
  }

  private performLessThan(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) < this.toNumber(right),
      type: 'boolean'
    };
  }

  private performLessThanOrEqual(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) <= this.toNumber(right),
      type: 'boolean'
    };
  }

  private performGreaterThan(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) > this.toNumber(right),
      type: 'boolean'
    };
  }

  private performGreaterThanOrEqual(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toNumber(left) >= this.toNumber(right),
      type: 'boolean'
    };
  }

  // Logical operations
  private performLogicalAnd(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toBoolean(left) && this.toBoolean(right),
      type: 'boolean'
    };
  }

  private performLogicalOr(left: EvaluationResult, right: EvaluationResult): EvaluationResult {
    return {
      value: this.toBoolean(left) || this.toBoolean(right),
      type: 'boolean'
    };
  }
}
