import { ParserRuleContext } from 'antlr4ts';
import { OpenSCADParser as OpenSCADParserCst } from '../../../generated/OpenSCADParser';
import { BaseVisitor } from '../base-visitor';
import { BinaryExpression } from '../nodes/expressions/binary-expression';
import { Expression } from '../nodes/expression';
import { NodeLocation } from '../../node-location';

/**
 * Maps OpenSCAD parser rule contexts to their corresponding operators
 */
// Define operator precedence (higher number = higher precedence)
const PRECEDENCE = {
  [OpenSCADParserCst.LOGICAL_OR]: 1,
  [OpenSCADParserCst.LOGICAL_AND]: 2,
  [OpenSCADParserCst.EQUAL]: 3,
  [OpenSCADParserCst.NOT_EQUAL]: 3,
  [OpenSCADParserCst.LESS_THAN]: 4,
  [OpenSCADParserCst.LESS_THAN_OR_EQUAL]: 4,
  [OpenSCADParserCst.GREATER_THAN]: 4,
  [OpenSCADParserCst.GREATER_THAN_OR_EQUAL]: 4,
  [OpenSCADParserCst.PLUS]: 5,
  [OpenSCADParserCst.MINUS]: 5,
  [OpenSCADParserCst.MULTIPLY]: 6,
  [OpenSCADParserCst.DIVIDE]: 6,
  [OpenSCADParserCst.MODULO]: 6,
} as const;

// Map token types to operator strings
const OPERATOR_MAP: Record<number, string> = {
  [OpenSCADParserCst.MULTIPLY]: '*',
  [OpenSCADParserCst.DIVIDE]: '/',
  [OpenSCADParserCst.MODULO]: '%',
  [OpenSCADParserCst.PLUS]: '+',
  [OpenSCADParserCst.MINUS]: '-',
  [OpenSCADParserCst.LESS_THAN]: '<',
  [OpenSCADParserCst.LESS_THAN_OR_EQUAL]: '<=',
  [OpenSCADParserCst.GREATER_THAN]: '>',
  [OpenSCADParserCst.GREATER_THAN_OR_EQUAL]: '>=',
  [OpenSCADParserCst.EQUAL]: '==',
  [OpenSCADParserCst.NOT_EQUAL]: '!=',
  [OpenSCADParserCst.LOGICAL_AND]: '&&',
  [OpenSCADParserCst.LOGICAL_OR]: '||',
} as const;

// Utility to get operator precedence
function getPrecedence(operator: number): number {
  return PRECEDENCE[operator as keyof typeof PRECEDENCE] || 0;
}

// Utility to get operator string
function getOperator(operator: number): string {
  const op = OPERATOR_MAP[operator as keyof typeof OPERATOR_MAP];
  if (!op) {
    throw new Error(`Unsupported operator: ${operator}`);
  }
  return op;
}

/**
 * Visitor for parsing binary expressions in OpenSCAD with proper operator precedence
 * and associativity handling.
 */
export class BinaryExpressionVisitor extends BaseVisitor {
  /**
   * Visits a binary expression node in the parse tree with proper precedence handling
   */
  public visitBinaryExpression(
    ctx: ParserRuleContext,
    left: Expression,
    operator: number,
    right: Expression
  ): BinaryExpression {
    return new BinaryExpression(
      this.createNodeLocation(ctx),
      left,
      getOperator(operator),
      right
    );
  }

  /**
   * Helper to parse binary expressions with operator precedence
   */
  private parseBinaryExpression(
    ctx: ParserRuleContext,
    operators: number[],
    getNextPrecedence: () => number = () => 0
  ): Expression {
    let left = this.visitNode(ctx.expression(0)!)!;
    
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const right = this.visitNode(ctx.expression(i + 1)!)!;
      
      // Check if we need to handle precedence
      const nextPrecedence = getNextPrecedence();
      const currentPrecedence = getPrecedence(operator);
      
      if (nextPrecedence > 0 && currentPrecedence < nextPrecedence) {
        // Current operator has lower precedence, return what we have so far
        return left;
      }
      
      left = this.visitBinaryExpression(
        ctx,
        left,
        operator,
        right
      );
    }
    
    return left;
  }

  /**
   * Visits a multiplicative expression (handles *, /, %)
   */
  public visitMultiplicativeExpression(ctx: OpenSCADParserCst.MultiplicativeExpressionContext): Expression {
    if (!ctx._operator) {
      return this.visitNode(ctx.expression(0)!)!;
    }
    
    const operators = ctx._operator.map(op => op.type);
    return this.parseBinaryExpression(ctx, operators, () => getPrecedence(OpenSCADParserCst.PLUS));
  }

  /**
   * Visits an additive expression (handles +, -)
   */
  public visitAdditiveExpression(ctx: OpenSCADParserCst.AdditiveExpressionContext): Expression {
    if (!ctx._operator) {
      return this.visitNode(ctx.expression(0)!)!;
    }
    
    const operators = ctx._operator.map(op => op.type);
    return this.parseBinaryExpression(ctx, operators, () => getPrecedence(OpenSCADParserCst.LESS_THAN));
  }

  /**
   * Visits a comparison expression (handles <, <=, >, >=, ==, !=)
   */
  public visitComparisonExpression(ctx: OpenSCADParserCst.ComparisonExpressionContext): Expression {
    if (!ctx._operator) {
      return this.visitNode(ctx.expression(0)!)!;
    }
    
    const operators = ctx._operator.map(op => op.type);
    return this.parseBinaryExpression(ctx, operators, () => getPrecedence(OpenSCADParserCst.LOGICAL_AND));
  }

  /**
   * Visits a logical AND expression
   */
  public visitLogicalAndExpression(ctx: OpenSCADParserCst.LogicalAndExpressionContext): Expression {
    if (!ctx._operator) {
      return this.visitNode(ctx.expression(0)!)!;
    }
    
    const operators = ctx._operator.map(op => op.type);
    return this.parseBinaryExpression(ctx, operators, () => getPrecedence(OpenSCADParserCst.LOGICAL_OR));
  }

  /**
   * Visits a logical OR expression
   */
  public visitLogicalOrExpression(ctx: OpenSCADParserCst.LogicalOrExpressionContext): Expression {
    if (!ctx._operator) {
      return this.visitNode(ctx.expression(0)!)!;
    }
    
    const operators = ctx._operator.map(op => op.type);
    return this.parseBinaryExpression(ctx, operators);
  }
}
