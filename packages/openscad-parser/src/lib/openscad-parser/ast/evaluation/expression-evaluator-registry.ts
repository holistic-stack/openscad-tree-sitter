/**
 * Expression Evaluator Registry
 * 
 * This module provides a central registry for evaluating expressions in OpenSCAD.
 * It follows the Single Responsibility Principle by focusing only on expression evaluation.
 * 
 * @module lib/openscad-parser/ast/evaluation/expression-evaluator-registry
 */

import * as ast from '../ast-types';
import { ErrorHandler } from '../../error-handling';
import { evaluateBinaryExpression } from './binary-expression-evaluator/binary-expression-evaluator';

/**
 * Evaluates an expression node and returns a value
 * @param expr The expression node to evaluate
 * @param errorHandler Optional error handler for logging
 * @returns The evaluated value or null if evaluation fails
 */
export function evaluateExpression(
  expr: ast.ExpressionNode,
  errorHandler?: ErrorHandler
): number | boolean | string | null {
  if (!expr) return null;

  try {
    // Log the evaluation attempt
    if (errorHandler) {
      errorHandler.logInfo(
        `[evaluateExpression] Evaluating expression: ${expr.expressionType}`,
        'evaluateExpression'
      );
    }

    // Handle different expression types
    switch (expr.expressionType) {
      case 'literal': {
        const literalNode = expr as ast.LiteralNode;
        return literalNode.value;
      }
      case 'binary':
      case 'binary_expression': {
        // Use the dedicated binary expression evaluator
        const binaryExpr = expr as ast.BinaryExpressionNode;
        const result = evaluateBinaryExpression(binaryExpr, errorHandler);
        
        if (errorHandler) {
          errorHandler.logInfo(
            `[evaluateExpression] Binary expression evaluation result: ${result}`,
            'evaluateExpression'
          );
        }
        
        return result;
      }
      case 'unary':
      case 'unary_expression': {
        const unaryNode = expr as ast.UnaryExpressionNode;
        const operandValue = evaluateExpression(unaryNode.operand, errorHandler);
        
        if (operandValue === null) {
          if (errorHandler) {
            errorHandler.logWarning(
              `[evaluateExpression] Cannot evaluate unary expression with null operand`,
              'evaluateExpression'
            );
          }
          return null;
        }
        
        switch (unaryNode.operator) {
          case '-':
            if (typeof operandValue === 'number') {
              return -operandValue;
            }
            break;
          case '!':
            if (typeof operandValue === 'boolean') {
              return !operandValue;
            } else if (typeof operandValue === 'number') {
              return operandValue === 0;
            }
            break;
          default:
            if (errorHandler) {
              errorHandler.logWarning(
                `[evaluateExpression] Unsupported unary operator: ${unaryNode.operator}`,
                'evaluateExpression'
              );
            }
            return null;
        }
        
        if (errorHandler) {
          errorHandler.logWarning(
            `[evaluateExpression] Failed to evaluate unary expression with operator ${unaryNode.operator} and operand ${operandValue}`,
            'evaluateExpression'
          );
        }
        return null;
      }
      case 'variable': {
        // Variable references are not yet implemented
        // In a real implementation, this would look up the variable value in a scope
        if (errorHandler) {
          errorHandler.logWarning(
            `[evaluateExpression] Variable reference evaluation not yet implemented`,
            'evaluateExpression'
          );
        }
        return null;
      }
      default: {
        // Other expression types are not yet implemented
        if (errorHandler) {
          errorHandler.logWarning(
            `[evaluateExpression] Unsupported expression type: ${expr.expressionType}`,
            'evaluateExpression'
          );
        }
        return null;
      }
    }
  } catch (error) {
    // Log any errors that occur during evaluation
    if (errorHandler) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        'evaluateExpression'
      );
    }
    return null;
  }
}