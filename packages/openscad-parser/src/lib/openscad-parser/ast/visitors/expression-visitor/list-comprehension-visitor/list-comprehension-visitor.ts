/**
 * @file List Comprehension Visitor for OpenSCAD AST generation
 * 
 * This visitor handles the conversion of Tree-sitter list comprehension nodes
 * into structured AST nodes. It supports both traditional and OpenSCAD syntax
 * variants for list comprehensions.
 * 
 * Supported syntax patterns:
 * - Traditional: [expr for (var = range)]
 * - Traditional with condition: [expr for (var = range) if (condition)]
 * - OpenSCAD: [for (var = range) expr]
 * - OpenSCAD with condition: [for (var = range) if (condition) expr]
 * 
 * @example Traditional syntax
 * ```openscad
 * [x*x for (x = [1:5])]
 * [x for (x = [1:10]) if (x % 2 == 0)]
 * ```
 * 
 * @example OpenSCAD syntax
 * ```openscad
 * [for (x = [1:5]) x*x]
 * [for (x = [1:10]) if (x % 2 == 0) x]
 * ```
 * 
 * @example Complex expressions
 * ```openscad
 * [for (i = [0:5]) let(angle = i * 36) [cos(angle), sin(angle)]]
 * ```
 */

import { Node as TSNode } from 'web-tree-sitter';
import { BaseASTVisitor } from '../../base-ast-visitor.js';
import { ErrorHandler } from '../../../../error-handling/index.js';
import { ExpressionVisitor } from '../../expression-visitor.js';
import * as ast from '../../../ast-types.js';
import { getLocation } from '../../../utils/location-utils.js';

/**
 * Visitor for handling list comprehension expressions in OpenSCAD.
 * 
 * This visitor processes Tree-sitter nodes representing list comprehensions
 * and converts them into structured AST nodes. It handles both traditional
 * Python-style syntax and OpenSCAD-specific syntax variants.
 * 
 * The visitor follows the Single Responsibility Principle by focusing
 * exclusively on list comprehension processing, delegating expression
 * evaluation to the parent ExpressionVisitor.
 * 
 * @example Basic usage
 * ```typescript
 * const errorHandler = new ErrorHandler();
 * const expressionVisitor = new ExpressionVisitor('', errorHandler);
 * const visitor = new ListComprehensionVisitor(expressionVisitor, errorHandler);
 * 
 * const result = visitor.visitListComprehension(listComprehensionNode);
 * ```
 */
export class ListComprehensionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected override errorHandler: ErrorHandler
  ) {
    super('', errorHandler); // Use empty string for source since we get it from parent
  }

  /**
   * Implement the abstract method required by BaseASTVisitor.
   * List comprehensions don't handle function calls directly.
   */
  protected createASTNodeForFunction(
    _node: TSNode,
    _functionName: string,
    _args: ast.Parameter[]
  ): ast.ASTNode | null {
    return null;
  }

  /**
   * Visit a list comprehension node and convert it to an AST node.
   * 
   * This method handles both traditional and OpenSCAD syntax variants:
   * - Traditional: [expr for (var = range) if (condition)]
   * - OpenSCAD: [for (var = range) if (condition) expr]
   * 
   * @param node - The Tree-sitter node representing the list comprehension
   * @returns The list comprehension AST node or null if processing fails
   * 
   * @example Processing traditional syntax
   * ```typescript
   * // For OpenSCAD code: [x*x for (x = [1:5])]
   * const result = visitor.visitListComprehension(node);
   * // Returns: { type: 'expression', expressionType: 'list_comprehension_expression', ... }
   * ```
   */
  visitListComprehension(node: TSNode): ast.ListComprehensionExpressionNode | null {
    this.errorHandler.logInfo(
      `[ListComprehensionVisitor.visitListComprehension] Processing list comprehension: ${node.text.substring(0, 50)}`
    );

    // Check if this is actually a list comprehension node
    if (node.type !== 'list_comprehension') {
      this.errorHandler.logWarning(
        `[ListComprehensionVisitor.visitListComprehension] Expected list_comprehension node, got: ${node.type}`
      );
      return null;
    }

    try {
      // Extract the for clause (required)
      const forClause = node.childForFieldName('for_clause');
      if (!forClause) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.visitListComprehension] No for_clause found in list comprehension`
        );
        return null;
      }

      // Extract variable and range from for clause
      const { variable, range } = this.extractForClause(forClause);
      if (!variable || !range) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.visitListComprehension] Failed to extract variable or range from for clause`
        );
        return null;
      }

      // Extract the element expression (required)
      const elementNode = node.childForFieldName('element');
      if (!elementNode) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.visitListComprehension] No element expression found in list comprehension`
        );
        return null;
      }

      const expression = this.parentVisitor.dispatchSpecificExpression(elementNode);
      if (!expression) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.visitListComprehension] Failed to process element expression`
        );
        return null;
      }

      // Extract optional if clause (condition)
      let condition: ast.ExpressionNode | undefined;
      const ifClause = node.childForFieldName('if_clause');
      if (ifClause) {
        const conditionNode = ifClause.childForFieldName('condition');
        if (conditionNode) {
          const conditionExpr = this.parentVisitor.dispatchSpecificExpression(conditionNode);
          if (conditionExpr) {
            condition = conditionExpr;
          }
        }
      }

      // Create the list comprehension AST node
      const result: ast.ListComprehensionExpressionNode = {
        type: 'expression',
        expressionType: 'list_comprehension_expression',
        variable,
        range,
        expression,
        ...(condition && { condition }),
        location: getLocation(node),
      };

      this.errorHandler.logInfo(
        `[ListComprehensionVisitor.visitListComprehension] Successfully created list comprehension AST node`
      );

      return result;
    } catch (error) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.visitListComprehension] Error processing list comprehension: ${error}`
      );
      return null;
    }
  }

  /**
   * Extract variable and range from a for clause node.
   * 
   * @param forClause - The for clause node to process
   * @returns Object containing the variable name and range expression
   */
  private extractForClause(forClause: TSNode): { variable: string | null; range: ast.ExpressionNode | null } {
    try {
      // Extract iterator (variable name)
      const iteratorNode = forClause.childForFieldName('iterator');
      const variable = iteratorNode?.text || null;

      // Extract range expression
      const rangeNode = forClause.childForFieldName('range');
      let range: ast.ExpressionNode | null = null;

      if (rangeNode) {
        range = this.parentVisitor.dispatchSpecificExpression(rangeNode);
      }

      return { variable, range };
    } catch (error) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.extractForClause] Error extracting for clause: ${error}`
      );
      return { variable: null, range: null };
    }
  }
}
