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

    console.log(`[ExpressionGenerator.processExpression] Processing expression: ${node.type}, ${node.text.substring(0, 30)}`);

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
      case 'expression':
        // If this is a wrapper expression, process its first child
        if (node.childCount > 0) {
          const firstChild = node.child(0);
          if (firstChild) {
            return this.processExpression(firstChild);
          }
        }
        return this.processVariable(node);
      case 'identifier':
        return this.processVariable(node);
      case 'number':
        return {
          type: 'expression',
          expressionType: 'literal',
          value: parseFloat(node.text),
          location: getLocation(node)
        };
      case 'string':
        return {
          type: 'expression',
          expressionType: 'literal',
          value: node.text.replace(/^"(.*)"$/, '$1'), // Remove quotes
          location: getLocation(node)
        };
      case 'boolean':
        return {
          type: 'expression',
          expressionType: 'literal',
          value: node.text === 'true',
          location: getLocation(node)
        };
      case 'logical_or_expression':
      case 'logical_and_expression':
      case 'equality_expression':
      case 'relational_expression':
      case 'additive_expression':
      case 'multiplicative_expression':
      case 'exponentiation_expression':
      case 'accessor_expression':
      case 'primary_expression':
        // For these expression types, process their children
        if (node.childCount > 0) {
          const firstChild = node.child(0);
          if (firstChild) {
            return this.processExpression(firstChild);
          }
        }
        return this.processVariable(node);
      default:
        console.warn(`[ExpressionGenerator.processExpression] Unhandled expression type: ${node.type}`);
        // As a fallback, treat it as a variable
        return this.processVariable(node);
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
    console.log(`[ExpressionGenerator.processConditionalExpression] Processing conditional expression: ${node.text.substring(0, 50)}`);

    // Get the condition, then branch, and else branch
    const conditionNode = node.childForFieldName('condition');
    const thenNode = node.childForFieldName('consequence');
    const elseNode = node.childForFieldName('alternative');

    if (!conditionNode) {
      // Try to get the condition as the first child
      if (node.childCount > 0) {
        const firstChild = node.child(0);
        if (firstChild && firstChild.type === 'logical_or_expression') {
          console.log(`[ExpressionGenerator.processConditionalExpression] Using first child as condition: ${firstChild.text.substring(0, 30)}`);
          const condition = this.processExpression(firstChild);

          // Try to get the then branch as the third child (after the ? operator)
          const thenBranch = node.childCount > 2 ? this.processExpression(node.child(2)) : null;

          // Try to get the else branch as the fifth child (after the : operator)
          const elseBranch = node.childCount > 4 ? this.processExpression(node.child(4)) : null;

          if (condition && thenBranch && elseBranch) {
            return {
              type: 'expression',
              expressionType: 'conditional',
              condition,
              thenBranch,
              elseBranch,
              location: getLocation(node)
            };
          }
        }
      }

      console.warn(`[ExpressionGenerator.processConditionalExpression] No condition found in conditional expression: ${node.text.substring(0, 50)}`);
      return null;
    }

    if (!thenNode || !elseNode) {
      console.warn(`[ExpressionGenerator.processConditionalExpression] Missing then or else branch in conditional expression: ${node.text.substring(0, 50)}`);
      return null;
    }

    const condition = this.processExpression(conditionNode);
    const thenBranch = this.processExpression(thenNode);
    const elseBranch = this.processExpression(elseNode);

    if (!condition || !thenBranch || !elseBranch) {
      console.warn(`[ExpressionGenerator.processConditionalExpression] Failed to process condition, then, or else expression: ${node.text.substring(0, 50)}`);
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
