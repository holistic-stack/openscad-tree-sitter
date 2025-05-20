import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';

/**
 * Generator for expression nodes (variables, operators, etc.)
 */
export class ExpressionGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    // For now, just create a generic function call node
    return this.createFunctionCallNode(node, functionName, args);
  }

  /**
   * Process an expression node
   */
  public processExpression(node: TSNode): ast.ExpressionNode | null {
    if (!node) return null;

    switch (node.type) {
      case 'variable':
        return this.processVariable(node);
      case 'binary_expression':
        return this.processBinaryExpression(node);
      case 'unary_expression':
        return this.processUnaryExpression(node);
      case 'conditional_expression':
        return this.processConditionalExpression(node);
      case 'function_call':
        return this.processFunctionCall(node);
      default:
        console.warn(`[ExpressionGenerator.processExpression] Unhandled expression type: ${node.type}`);
        return null;
    }
  }

  /**
   * Process a variable node
   */
  private processVariable(node: TSNode): ast.VariableNode {
    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node)
    };
  }

  /**
   * Process a binary expression node
   */
  private processBinaryExpression(node: TSNode): ast.BinaryExpressionNode | null {
    if (node.childCount < 3) {
      console.warn(`[ExpressionGenerator.processBinaryExpression] Binary expression has less than 3 children: ${node.text}`);
      return null;
    }

    const leftNode = node.child(0);
    const operatorNode = node.child(1);
    const rightNode = node.child(2);

    if (!leftNode || !operatorNode || !rightNode) {
      console.warn(`[ExpressionGenerator.processBinaryExpression] Missing children in binary expression: ${node.text}`);
      return null;
    }

    const left = this.processExpression(leftNode);
    const right = this.processExpression(rightNode);
    const operator = operatorNode.text as ast.BinaryOperator;

    if (!left || !right) {
      console.warn(`[ExpressionGenerator.processBinaryExpression] Failed to process left or right expression: ${node.text}`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'binary',
      operator,
      left,
      right,
      location: getLocation(node)
    };
  }

  /**
   * Process a unary expression node
   */
  private processUnaryExpression(node: TSNode): ast.UnaryExpressionNode | null {
    if (node.childCount < 2) {
      console.warn(`[ExpressionGenerator.processUnaryExpression] Unary expression has less than 2 children: ${node.text}`);
      return null;
    }

    const operatorNode = node.child(0);
    const operandNode = node.child(1);

    if (!operatorNode || !operandNode) {
      console.warn(`[ExpressionGenerator.processUnaryExpression] Missing children in unary expression: ${node.text}`);
      return null;
    }

    const operand = this.processExpression(operandNode);
    const operator = operatorNode.text as ast.UnaryOperator;

    if (!operand) {
      console.warn(`[ExpressionGenerator.processUnaryExpression] Failed to process operand: ${node.text}`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'unary',
      operator,
      operand,
      location: getLocation(node)
    };
  }

  /**
   * Process a conditional expression node
   */
  private processConditionalExpression(node: TSNode): ast.ConditionalExpressionNode | null {
    if (node.childCount < 5) {
      console.warn(`[ExpressionGenerator.processConditionalExpression] Conditional expression has less than 5 children: ${node.text}`);
      return null;
    }

    const conditionNode = node.child(0);
    const thenNode = node.child(2);
    const elseNode = node.child(4);

    if (!conditionNode || !thenNode || !elseNode) {
      console.warn(`[ExpressionGenerator.processConditionalExpression] Missing children in conditional expression: ${node.text}`);
      return null;
    }

    const condition = this.processExpression(conditionNode);
    const thenBranch = this.processExpression(thenNode);
    const elseBranch = this.processExpression(elseNode);

    if (!condition || !thenBranch || !elseBranch) {
      console.warn(`[ExpressionGenerator.processConditionalExpression] Failed to process condition, then, or else expression: ${node.text}`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'conditional',
      condition,
      thenBranch,
      elseBranch,
      location: getLocation(node)
    };
  }

  /**
   * Process a function call node
   */
  private processFunctionCall(node: TSNode): ast.FunctionCallNode | null {
    const nameNode = node.childForFieldName('name');
    const argsNode = node.childForFieldName('arguments');

    if (!nameNode) {
      console.warn(`[ExpressionGenerator.processFunctionCall] Missing name in function call: ${node.text}`);
      return null;
    }

    const name = nameNode.text;
    const args: ast.Parameter[] = [];

    if (argsNode) {
      // Extract arguments
      // This would use the extractArguments function from argument-extractor.ts
    }

    return {
      type: 'function_call',
      name,
      arguments: args,
      location: getLocation(node)
    };
  }
}
