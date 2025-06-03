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

    try {
      // First try to parse as OpenSCAD-style: [for (i = range) expr] or [for (i = range) if (condition) expr]
      const openScadStyle = this.parseOpenScadStyle(node);
      if (openScadStyle) {
        return openScadStyle;
      }

      // Then try to parse as traditional Python-style: [expr for (i = range) if (condition)?]
      const pythonStyle = this.parsePythonStyle(node);
      if (pythonStyle) {
        return pythonStyle;
      }

      this.errorHandler.logError(
        `[ListComprehensionVisitor.visitListComprehension] Unable to parse list comprehension: ${node.text}`
      );
      return null;
    } catch (error) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.visitListComprehension] Error processing list comprehension: ${error}`
      );
      return null;
    }
  }

  /**
   * Parse OpenSCAD-style list comprehension: [for (i = range) expr] or [for (i = range) if (condition) expr]
   */
  private parseOpenScadStyle(node: TSNode): ast.ListComprehensionExpressionNode | null {
    try {
      const forClause = node.childForFieldName('list_comprehension_for');
      const expression = node.childForFieldName('expr');
      const condition = node.childForFieldName('condition');

      if (!forClause) {
        this.errorHandler.logDebug(
          '[ListComprehensionVisitor.parseOpenScadStyle] Missing list_comprehension_for in OpenSCAD-style list comprehension'
        );
        return null;
      }
      // The 'expr' field is mandatory in the grammar for a valid list_comprehension node.
      // If 'expression' (node.childByFieldName('expr')) is null here, it implies a malformed CST node
      // not conforming to the expected list_comprehension structure, which should ideally be caught by tree-sitter's parsing.
      if (!expression) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.parseOpenScadStyle] Critical: Missing 'expr' child in list_comprehension node: ${node.text}. This may indicate a grammar mismatch or malformed CST.`
        );
        return null;
      }

      // Extract variable and range from for clause
      const { variable, range } = this.extractForClause(forClause);
      if (!variable || !range) {
        this.errorHandler.logWarning(
          `[ListComprehensionVisitor.parseOpenScadStyle] Failed to extract variable or range from for clause: ${forClause.text}`
        );
        return null;
      }

      // Parse the expression - handle nested list comprehensions
      // Parse the expression - handle nested list comprehensions
      let expr: ast.ExpressionNode | null = null;

      // 'expression' (from line 131, const expression = node.descendantsOfType('_value')[0];) 
      // is the TSNode representing the value part of the comprehension.
      // e.g., in [for (i = x) i*2], 'expression' is the node for 'i*2'.
      // e.g., in [for (i = x) [for (j = y) j*i]], 'expression' is the node for '[for (j = y) j*i]'.

      // The earlier check `if (!forClause || !expression)` (line 134) ensures `expression` is not null here.
      if (expression.type === 'list_comprehension') { // Check if the 'expression' TSNode is a list_comprehension
        // The expression part is itself a list comprehension (nested)
        this.errorHandler.logInfo(
          `[ListComprehensionVisitor.parseOpenScadStyle] Found nested list comprehension: ${expression.text}`
        );
        // Recursively call visitListComprehension to parse the nested one.
        // 'expression' here is the TSNode for the inner list comprehension.
        expr = this.visitListComprehension(expression);
      } else {
        // The expression part is a regular expression, not a nested list comprehension.
        this.errorHandler.logDebug(
          `[ListComprehensionVisitor.parseOpenScadStyle] Parsing regular expression: ${expression.text}`
        );
        expr = this.parentVisitor.dispatchSpecificExpression(expression);
      }

      if (!expr) {
        this.errorHandler.logWarning(
          `[ListComprehensionVisitor.parseOpenScadStyle] Failed to parse expression: ${expression?.text}`
        );
        return null;
      }

      // Parse condition if present
      let conditionExpr: ast.ExpressionNode | undefined;
      if (condition) {
        const parsedCondition = this.parentVisitor.dispatchSpecificExpression(condition);
        if (parsedCondition) {
          conditionExpr = parsedCondition;
        } else {
          this.errorHandler.logWarning(
            `[ListComprehensionVisitor.parseOpenScadStyle] Failed to parse condition: ${condition.text}`
          );
          return null;
        }
      }

      // Create the base node without the condition first
      const nodeWithoutCondition: Omit<ast.ListComprehensionExpressionNode, 'condition'> = {
        type: 'expression',
        expressionType: 'list_comprehension_expression',
        variable,
        range,
        expression: expr,
        location: getLocation(node),
      };

      // Only add the condition if it exists
      return conditionExpr 
        ? { ...nodeWithoutCondition, condition: conditionExpr }
        : nodeWithoutCondition;
    } catch (error) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.parseOpenScadStyle] Error parsing OpenSCAD-style list comprehension: ${error}`
      );
      return null;
    }
  }

  /**
   * Parse traditional Python-style list comprehension: [expr for (i = range) if (condition)?]
   * This is a fallback for when the OpenSCAD-style parsing fails.
   * 
   * Note: This implementation is currently limited because we don't have direct access to the parser.
   * A more complete solution would require either:
   * 1. Updating the grammar to support Python-style comprehensions natively
   * 2. Exposing the parser instance from the parent visitor
   */
  private parsePythonStyle(node: TSNode): ast.ListComprehensionExpressionNode | null {
    this.errorHandler.logWarning(
      `[ListComprehensionVisitor.parsePythonStyle] Python-style list comprehensions are not fully supported. ` +
      `Consider using OpenSCAD-style: [for (i = range) expr]`
    );
    
    // For now, we'll just return null to indicate we can't handle this format
    // This will cause the parser to report a more appropriate error
    return null;
  }

  /**
   * Extract variable and range from a for clause node.
   * 
   * @param forClause - The for clause node to process
   * @returns Object containing the variable name and range expression
   */
  private extractForClause(forClause: TSNode): { variable: string | null; range: ast.ExpressionNode | null } {
    try {
      // In the new grammar, the for clause has a variable_declaration child
      const varDecl = forClause.childForFieldName('variable_declaration');
      if (!varDecl) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] No variable_declaration found in for clause`
        );
        return { variable: null, range: null };
      }

      // Extract variable name (first child of variable_declaration)
      const variableNode = varDecl.namedChildren[0];
      const variable = variableNode?.text || null;

      if (!variable) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] Failed to extract variable name from for clause`
        );
        return { variable: null, range: null };
      }

      // Extract range expression (second child of variable_declaration)
      const rangeNode = varDecl.namedChildren[1];
      let range: ast.ExpressionNode | null = null;

      if (rangeNode) {
        range = this.parentVisitor.dispatchSpecificExpression(rangeNode);
      }

      if (!range) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] Failed to extract range expression from for clause`
        );
        return { variable: null, range: null };
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
