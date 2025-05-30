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
  private parentVisitor: any; // Will be typed as ExpressionVisitor when imported

  /**
   * Constructor for the RangeExpressionVisitor
   * @param parentVisitor The parent ExpressionVisitor instance for processing nested expressions
   * @param errorHandler The error handler for logging and error management
   */
  constructor(parentVisitor: any, errorHandler: ErrorHandler) {
    super('', errorHandler); // Source will be inherited from parent visitor
    this.parentVisitor = parentVisitor;
  }

  /**
   * Implementation of abstract method from BaseASTVisitor.
   * Range expressions are not function calls, so this returns null.
   * @param node The Tree-sitter node
   * @returns Always null for range expressions
   */
  createASTNodeForFunction(node: TSNode): ast.ASTNode | null {
    // Range expressions are not function calls
    return null;
  }

  /**
   * Creates a literal expression AST node from a text value.
   * This method handles numbers, identifiers, and basic expressions.
   *
   * @param text - The text to convert to a literal expression
   * @returns The literal expression AST node or null if conversion fails
   */
  private createLiteralExpression(text: string): ast.ExpressionNode | null {
    const trimmedText = text.trim();

    // Create a placeholder location
    const placeholderLocation: ast.SourceLocation = {
      start: { line: 0, column: 0, offset: 0 },
      end: { line: 0, column: trimmedText.length, offset: trimmedText.length },
      text: trimmedText
    };

    // Check if it's a number (integer or decimal)
    const numberMatch = trimmedText.match(/^-?\d+(\.\d+)?$/);
    if (numberMatch) {
      const value = parseFloat(trimmedText);
      return {
        type: 'expression',
        expressionType: 'literal',
        value: value,
        location: placeholderLocation
      } as ast.LiteralNode;
    }

    // Check if it's a simple identifier (variable name)
    const identifierMatch = trimmedText.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
    if (identifierMatch) {
      return {
        type: 'expression',
        expressionType: 'identifier',
        name: trimmedText,
        location: placeholderLocation
      } as ast.IdentifierNode;
    }

    // For more complex expressions (like "a+1", "b*2"), we'll create a placeholder
    // In a full implementation, these would need to be parsed properly
    this.errorHandler?.logWarning(
      `[RangeExpressionVisitor.createLiteralExpression] Complex expression "${trimmedText}" treated as identifier`,
      'RangeExpressionVisitor.createLiteralExpression'
    );

    return {
      type: 'expression',
      expressionType: 'identifier',
      name: trimmedText,
      location: placeholderLocation
    } as ast.IdentifierNode;
  }

  /**
   * Visits an array_literal node and checks if it represents a range expression.
   *
   * Due to grammar precedence issues, range expressions like [0:5] are often
   * parsed as array_literal nodes instead of range_expression nodes. This method
   * detects range patterns within array_literal nodes and converts them to
   * range expression AST nodes.
   *
   * @param node - The Tree-sitter array_literal node
   * @returns The AST range expression node or null if not a range pattern
   *
   * @example
   * ```typescript
   * // For OpenSCAD code: [0:5] (parsed as array_literal)
   * const result = visitor.visitArrayLiteralAsRange(node);
   * // Returns: { type: 'expression', expressionType: 'range_expression', start: ..., end: ... }
   * ```
   */
  visitArrayLiteralAsRange(node: TSNode): ast.RangeExpressionNode | null {


    // Validate node type
    if (node.type !== 'array_literal') {
      this.errorHandler?.logWarning(
        `[RangeExpressionVisitor.visitArrayLiteralAsRange] Expected array_literal, got: ${node.type}`,
        'RangeExpressionVisitor.visitArrayLiteralAsRange'
      );
      return null;
    }

    try {
      // Use a simpler approach: detect range patterns using regex and parse the parts
      // This is more robust than trying to navigate the complex nested CST structure

      const arrayText = node.text;

      // Remove the brackets to get the inner content
      const innerText = arrayText.slice(1, -1); // Remove [ and ]



      // Check for range patterns using regex
      // Simple range: start:end (e.g., "0:5", "x:y", "a+1:b*2")
      // Stepped range: start:step:end (e.g., "0:2:10", "1:0.5:5")
      const simpleRangeMatch = innerText.match(/^(.+):([^:]+)$/);
      const steppedRangeMatch = innerText.match(/^(.+):(.+):([^:]+)$/);

      let startText: string;
      let endText: string;
      let stepText: string | undefined;

      if (steppedRangeMatch && steppedRangeMatch[1] && steppedRangeMatch[2] && steppedRangeMatch[3]) {
        // Stepped range: start:step:end
        startText = steppedRangeMatch[1].trim();
        stepText = steppedRangeMatch[2].trim();
        endText = steppedRangeMatch[3].trim();


      } else if (simpleRangeMatch && simpleRangeMatch[1] && simpleRangeMatch[2]) {
        // Simple range: start:end
        startText = simpleRangeMatch[1].trim();
        endText = simpleRangeMatch[2].trim();


      } else {
        this.errorHandler?.logInfo(
          `[RangeExpressionVisitor.visitArrayLiteralAsRange] No range pattern detected in: "${innerText}"`,
          'RangeExpressionVisitor.visitArrayLiteralAsRange'
        );
        return null; // Not a range pattern
      }

      // Create simple literal expressions for the range parts
      // For now, we'll create basic literal nodes. In the future, this could be enhanced
      // to handle more complex expressions by parsing them separately.

      const startExpression = this.createLiteralExpression(startText);
      const endExpression = this.createLiteralExpression(endText);
      let stepExpression: ast.ExpressionNode | undefined;

      if (stepText) {
        const stepResult = this.createLiteralExpression(stepText);
        if (stepResult) {
          stepExpression = stepResult;
        }
      }

      if (!startExpression || !endExpression) {
        this.errorHandler?.logError(
          `[RangeExpressionVisitor.visitArrayLiteralAsRange] Failed to create literal expressions: start="${startText}", end="${endText}"`,
          'RangeExpressionVisitor.visitArrayLiteralAsRange'
        );
        return null;
      }

      // Create the range expression AST node
      const rangeAstNode: ast.RangeExpressionNode = {
        type: 'expression',
        expressionType: 'range_expression',
        start: startExpression,
        end: endExpression,
        location: getLocation(node),
      };

      // Add step if present
      if (stepExpression) {
        rangeAstNode.step = stepExpression;
      }



      return rangeAstNode;

    } catch (error) {
      this.errorHandler?.logError(
        `[RangeExpressionVisitor.visitArrayLiteralAsRange] Error processing array literal as range: ${error}`,
        'RangeExpressionVisitor.visitArrayLiteralAsRange'
      );
      return null;
    }
  }

  /**
   * Visit a range expression node and convert it to an AST node.
   *
   * This method handles both simple and stepped range expressions:
   * - Simple: [start:end]
   * - Stepped: [start:step:end]
   *
   * @param node - The Tree-sitter node representing the range expression
   * @returns The range expression AST node or null if processing fails
   *
   * @example Processing simple range
   * ```typescript
   * // For OpenSCAD code: [0:5]
   * const result = visitor.visitRangeExpression(node);
   * // Returns: { type: 'expression', expressionType: 'range_expression', start: ..., end: ... }
   * ```
   *
   * @example Processing stepped range
   * ```typescript
   * // For OpenSCAD code: [0:2:10]
   * const result = visitor.visitRangeExpression(node);
   * // Returns: { type: 'expression', expressionType: 'range_expression', start: ..., step: ..., end: ... }
   * ```
   */
  visitRangeExpression(node: TSNode): ast.RangeExpressionNode | null {
    this.errorHandler?.logInfo(
      `[RangeExpressionVisitor.visitRangeExpression] Processing range expression: ${node.text}`,
      'RangeExpressionVisitor.visitRangeExpression'
    );

    // Validate node type
    if (node.type !== 'range_expression') {
      this.errorHandler?.logWarning(
        `[RangeExpressionVisitor.visitRangeExpression] Expected range_expression, got: ${node.type}`,
        'RangeExpressionVisitor.visitRangeExpression'
      );
      return null;
    }

    try {
      // Extract start expression (required)
      const startNode = node.childForFieldName('start');
      if (!startNode) {
        this.errorHandler?.logError(
          `[RangeExpressionVisitor.visitRangeExpression] Missing start expression in range: ${node.text}`,
          'RangeExpressionVisitor.visitRangeExpression'
        );
        return null;
      }

      // Extract end expression (required)
      const endNode = node.childForFieldName('end');
      if (!endNode) {
        this.errorHandler?.logError(
          `[RangeExpressionVisitor.visitRangeExpression] Missing end expression in range: ${node.text}`,
          'RangeExpressionVisitor.visitRangeExpression'
        );
        return null;
      }

      // Extract step expression (optional)
      const stepNode = node.childForFieldName('step');

      // Process start expression
      const startExpression = this.parentVisitor.dispatchSpecificExpression(startNode);
      if (!startExpression) {
        this.errorHandler?.logError(
          `[RangeExpressionVisitor.visitRangeExpression] Failed to process start expression: ${startNode.text}`,
          'RangeExpressionVisitor.visitRangeExpression'
        );
        return null;
      }

      // Process end expression
      const endExpression = this.parentVisitor.dispatchSpecificExpression(endNode);
      if (!endExpression) {
        this.errorHandler?.logError(
          `[RangeExpressionVisitor.visitRangeExpression] Failed to process end expression: ${endNode.text}`,
          'RangeExpressionVisitor.visitRangeExpression'
        );
        return null;
      }

      // Process step expression if present
      let stepExpression: ast.ExpressionNode | undefined;
      if (stepNode) {
        stepExpression = this.parentVisitor.dispatchSpecificExpression(stepNode);
        if (!stepExpression) {
          this.errorHandler?.logWarning(
            `[RangeExpressionVisitor.visitRangeExpression] Failed to process step expression: ${stepNode.text}`,
            'RangeExpressionVisitor.visitRangeExpression'
          );
          // Continue without step - treat as simple range
        }
      }

      // Create the range expression AST node
      const rangeExpressionNode: ast.RangeExpressionNode = {
        type: 'expression',
        expressionType: 'range_expression',
        start: startExpression,
        end: endExpression,
        location: getLocation(node),
      };

      // Add step if present
      if (stepExpression) {
        rangeExpressionNode.step = stepExpression;
      }

      this.errorHandler?.logInfo(
        `[RangeExpressionVisitor.visitRangeExpression] Successfully created range expression AST node`,
        'RangeExpressionVisitor.visitRangeExpression'
      );

      return rangeExpressionNode;

    } catch (error) {
      this.errorHandler?.logError(
        `[RangeExpressionVisitor.visitRangeExpression] Error processing range expression: ${error}`,
        'RangeExpressionVisitor.visitRangeExpression'
      );
      return null;
    }
  }

  /**
   * Visit method for compatibility with base visitor interface.
   * Delegates to visitRangeExpression for range_expression nodes and
   * checks array_literal nodes for range patterns.
   *
   * @param node - The Tree-sitter node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visit(node: TSNode): ast.ASTNode | null {
    if (node.type === 'range_expression') {
      return this.visitRangeExpression(node);
    }

    if (node.type === 'array_literal') {
      return this.visitArrayLiteralAsRange(node);
    }

    this.errorHandler?.logWarning(
      `[RangeExpressionVisitor.visit] Unsupported node type: ${node.type}`,
      'RangeExpressionVisitor.visit'
    );
    return null;
  }
}
