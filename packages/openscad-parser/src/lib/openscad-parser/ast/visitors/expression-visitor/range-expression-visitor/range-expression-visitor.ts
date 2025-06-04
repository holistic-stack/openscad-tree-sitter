/**
 * @file Range Expression Visitor for OpenSCAD AST generation
 * 
 * This visitor handles the conversion of Tree-sitter range expression nodes
 * into structured AST nodes. It supports both simple and stepped range expressions
 * commonly used in OpenSCAD for loops and list comprehensions.
 * 
 * Supported syntax patterns:
 * - Simple range: [start:end]
 * - Range with step: [start:step:end]
 * - Expression ranges: [expr1:expr2], [expr1:expr2:expr3]
 * 
 * @example Simple range expressions
 * ```openscad
 * [0:5]        // Simple range from 0 to 5
 * [1:10]       // Simple range from 1 to 10
 * [-5:5]       // Range from -5 to 5
 * ```
 * 
 * @example Range expressions with step
 * ```openscad
 * [0:2:10]     // Range from 0 to 10 with step 2
 * [1:0.5:5]    // Range from 1 to 5 with step 0.5
 * [10:-1:0]    // Reverse range from 10 to 0 with step -1
 * ```
 * 
 * @example Expression ranges
 * ```openscad
 * [x:y]        // Range using variables
 * [func():max] // Range using function calls
 * [a+1:b*2:c]  // Range using complex expressions
 * ```
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types.js';
import { BaseASTVisitor } from '../../base-ast-visitor.js';
import { getLocation } from '../../../utils/location-utils.js';
import { ErrorHandler } from '../../../../error-handling/index.js';
import { ExpressionVisitor } from '../../expression-visitor.js'; // Added import

/**
 * Visitor for converting Tree-sitter range expression nodes to AST nodes.
 * 
 * This visitor follows the Single Responsibility Principle by focusing exclusively
 * on range expression parsing. It integrates with the ExpressionVisitor for
 * processing nested expressions within range bounds.
 * 
 * @example Usage in ExpressionVisitor
 * ```typescript
 * const rangeVisitor = new RangeExpressionVisitor(expressionVisitor, errorHandler);
 * const rangeNode = rangeVisitor.visitRangeExpression(cstNode);
 * ```
 */
export class RangeExpressionVisitor extends BaseASTVisitor {
  /**
   * Parent expression visitor for processing nested expressions
   */
  private parentVisitor: ExpressionVisitor;

  /**
   * Constructor for the RangeExpressionVisitor
   * @param parentVisitor The parent ExpressionVisitor instance for processing nested expressions
   * @param errorHandler The error handler for logging and error management
   */
  constructor(parentVisitor: ExpressionVisitor, errorHandler: ErrorHandler) {
    super('', errorHandler); // Source will be inherited from parent visitor
    this.parentVisitor = parentVisitor;
  }

  /**
   * Implementation of abstract method from BaseASTVisitor.
   * Range expressions are not function calls, so this returns an ErrorNode.
   * @param node The Tree-sitter node
   * @returns Always an ErrorNode for range expressions when called as a function.
   */
  createASTNodeForFunction(node: TSNode): ast.ErrorNode {
    return {
      type: 'error',
      errorCode: 'INVALID_NODE_TYPE_FOR_FUNCTION_CALL',
      message: `RangeExpressionVisitor: Node type ${node.type} cannot be processed as a function call.`,
      originalNodeType: node.type,
      cstNodeText: node.text,
      location: getLocation(node),
    } as ast.ErrorNode;
  }

  /**
   * Visit a range expression node and convert it to an AST node.
   * 
   * This method handles both simple and stepped range expressions:
   * - Simple: [start:end]
   * - Stepped: [start:step:end]
   * 
   * It uses the parent ExpressionVisitor to process the start, step (optional),
   * and end expressions, ensuring that complex expressions within the range
   * are correctly parsed. Returns an ErrorNode if parsing fails at any critical step.
   * 
   * @param node - The Tree-sitter node to visit (must be a range_expression)
   * @returns The range expression AST node or an ErrorNode if parsing fails
   * 
   * @example Input CST for `[var_start : func_step() : 10 + x]`
   * ```
   * (range_expression
   *   "["
   *   start: (identifier)       // Example: var_start can be any expression
   *   ":"
   *   step: (call_expression) // Example: func_step() can be any expression
   *   ":"
   *   end: (binary_expression)  // Example: 10 + x can be any expression
   *   "]"
   * )
   * ```
   */
  visitRangeExpression(node: TSNode): ast.RangeExpressionNode | ast.ErrorNode {
    this.errorHandler?.logInfo(
      `[RangeExpressionVisitor.visitRangeExpression] Processing range expression: ${node.text}`,
      'RangeExpressionVisitor.visitRangeExpression'
    );

    // Validate node type
    if (node.type !== 'range_expression') {
      // This case should ideally be handled by the main visit method or the caller.
      // If called directly with a wrong node type, it's an internal error.
      return {
        type: 'error',
        errorCode: 'INVALID_NODE_TYPE_FOR_RANGE_VISIT',
        message: `RangeExpressionVisitor.visitRangeExpression: Expected 'range_expression', got '${node.type}'.`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
    }

    // No try-catch here; errors are returned as ErrorNode
    const startNode = node.childForFieldName('start');
    if (!startNode) {
      return {
        type: 'error',
        errorCode: 'RANGE_EXPRESSION_MISSING_START',
        message: `Range expression is missing the start component: ${node.text}`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
    }

    const endNode = node.childForFieldName('end');
    if (!endNode) {
      return {
        type: 'error',
        errorCode: 'RANGE_EXPRESSION_MISSING_END',
        message: `Range expression is missing the end component: ${node.text}`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
    }

    const stepNode = node.childForFieldName('step');

    const startExpressionResult = this.parentVisitor.dispatchSpecificExpression(startNode);
    if (!startExpressionResult || startExpressionResult.type === 'error') {
      let message = `Failed to parse start expression '${startNode.text}' in range: ${node.text}`;
      if (startExpressionResult && startExpressionResult.type === 'error') {
        message += `. Cause: ${startExpressionResult.message}`;
      }
      return {
        type: 'error',
        errorCode: 'UNPARSABLE_RANGE_START_EXPRESSION',
        message,
        originalNodeType: node.type,
        cstNodeText: startNode.text,
        location: getLocation(startNode),
        ...(startExpressionResult && startExpressionResult.type === 'error' ? { cause: startExpressionResult } : {}),
      } as ast.ErrorNode;
    }
    const startExpression: ast.ExpressionNode = startExpressionResult;

    const endExpressionResult = this.parentVisitor.dispatchSpecificExpression(endNode);
    if (!endExpressionResult || endExpressionResult.type === 'error') {
      let message = `Failed to parse end expression '${endNode.text}' in range: ${node.text}`;
      if (endExpressionResult && endExpressionResult.type === 'error') {
        message += `. Cause: ${endExpressionResult.message}`;
      }
      return {
        type: 'error',
        errorCode: 'UNPARSABLE_RANGE_END_EXPRESSION',
        message,
        originalNodeType: node.type,
        cstNodeText: endNode.text,
        location: getLocation(endNode),
        ...(endExpressionResult && endExpressionResult.type === 'error' ? { cause: endExpressionResult } : {}),
      } as ast.ErrorNode;
    }
    const endExpression: ast.ExpressionNode = endExpressionResult;

    let stepExpression: ast.ExpressionNode | undefined;
    if (stepNode) {
      const stepExpressionResult = this.parentVisitor.dispatchSpecificExpression(stepNode);
      if (!stepExpressionResult || stepExpressionResult.type === 'error') {
        let message = `Failed to parse step expression '${stepNode.text}' in range: ${node.text}`;
        if (stepExpressionResult && stepExpressionResult.type === 'error') {
          message += `. Cause: ${stepExpressionResult.message}`;
        }
        return {
          type: 'error',
          errorCode: 'UNPARSABLE_RANGE_STEP_EXPRESSION',
          message,
          originalNodeType: node.type,
          cstNodeText: stepNode.text,
          location: getLocation(stepNode),
          ...(stepExpressionResult && stepExpressionResult.type === 'error' ? { cause: stepExpressionResult } : {}),
        } as ast.ErrorNode;
      }
      stepExpression = stepExpressionResult;
    }

    const rangeExpressionNode: ast.RangeExpressionNode = {
      type: 'expression',
      expressionType: 'range_expression',
      start: startExpression,
      end: endExpression,
      location: getLocation(node),
    };

    if (stepExpression) {
      rangeExpressionNode.step = stepExpression;
    }

    // Optional: Log success if needed, but not strictly necessary for visitor logic
    // this.errorHandler?.logInfo(
    //   `[RangeExpressionVisitor.visitRangeExpression] Successfully created range expression AST node`,
    //   'RangeExpressionVisitor.visitRangeExpression'
    // );

    return rangeExpressionNode;
  }


  /**
   * Visit method for compatibility with base visitor interface.
   * Delegates to visitRangeExpression for range_expression nodes and
   * checks array_literal nodes for range patterns.
   *
   * @param node - The Tree-sitter node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visit(node: TSNode): ast.ASTNode | ast.ErrorNode {
    if (node.type === 'range_expression') {
      return this.visitRangeExpression(node);
    }

    // If not a range_expression, it's an error for this specific visitor.
    // The generic ExpressionVisitor should handle dispatching to the correct visitor.
    return {
        type: 'error',
        errorCode: 'UNEXPECTED_NODE_TYPE_FOR_RANGE_VISITOR',
        message: `RangeExpressionVisitor: Expected 'range_expression', but received '${node.type}'.`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
  }
}

