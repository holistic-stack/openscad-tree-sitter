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
  visitListComprehension(node: TSNode): ast.ListComprehensionExpressionNode | ast.ErrorNode {
    this.errorHandler.logInfo(
      `[ListComprehensionVisitor.visitListComprehension] Processing list comprehension: ${node.text.substring(0, 50)}`
    );

    try {
      // Attempt to parse as OpenSCAD-style. This method now returns ErrorNode on failure.
      const openScadResult = this.parseOpenScadStyle(node);
      
      // If parseOpenScadStyle returns an ErrorNode, and it's not a simple 'missing for clause' (which might indicate Python style),
      // then it's a more serious error in what looked like OpenSCAD style, so we propagate that error.
      // A more nuanced approach might be needed if Python style should be tried even after some OpenSCAD parsing errors.
      if (openScadResult.type === 'expression') {
        return openScadResult;
      }
      
      // At this point, openScadResult is an ErrorNode.
      // We could try Python style if the error from OpenSCAD style was due to missing 'for' clause, 
      // which is a strong indicator it wasn't OpenSCAD style to begin with.
      // Otherwise, we might propagate the OpenSCAD error.
      // For now, let's be simple: if OpenSCAD style fails (returns ErrorNode), try Python style.
      // A more sophisticated approach would inspect the errorCode from openScadResult.

      const pythonStyleResult = this.parsePythonStyle(node); // parsePythonStyle returns null if not supported or error
      if (pythonStyleResult) { // This implies it returned a ListComprehensionExpressionNode
        return pythonStyleResult;
      }

      // If both styles fail, return the error from OpenSCAD style attempt, or a generic one if OpenSCAD didn't even start (e.g. no for clause)
      // If pythonStyleResult was also an ErrorNode, we'd need to decide which error to prioritize.
      // Current parsePythonStyle returns null, not ErrorNode.
      this.errorHandler.logError(
        `[ListComprehensionVisitor.visitListComprehension] Unable to parse list comprehension with any style. CST: ${node.text}. OpenSCAD parse attempt resulted in: ${openScadResult.errorCode}`
      );
      // Return the error from the OpenSCAD parsing attempt as it's more specific.
      // If openScadResult was due to a very early exit (e.g. not an LC node), then this error might be too specific.
      // However, parseOpenScadStyle is designed to handle the list_comprehension CST node type.
      if (openScadResult.errorCode === 'MISSING_FOR_CLAUSE') {
        // This specific error from OpenSCAD style might mean it's more likely Python style, but Python style also failed (returned null).
        // So, create a generic failure message.
        return {
          type: 'error',
          errorCode: 'UNABLE_TO_PARSE_LIST_COMPREHENSION',
          message: 'Unable to parse list comprehension using any known style (OpenSCAD or Python).',
          location: getLocation(node),
          originalNodeType: node.type,
          cstNodeText: node.text,
        };
      }
      return openScadResult; // Propagate the more specific error from parseOpenScadStyle

    } catch (error: any) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.visitListComprehension] Unexpected error: ${error?.message || error}. ErrorCode: VISIT_LIST_COMPREHENSION_UNEXPECTED_ERROR. OriginalError: ${error?.message}`
      );
      return {
        type: 'error',
        errorCode: 'VISIT_LIST_COMPREHENSION_UNEXPECTED_ERROR',
        message: `Unexpected error processing list comprehension: ${error?.message || error}`,
        location: getLocation(node),
        originalNodeType: node.type,
        cstNodeText: node.text,
      };
    }
  }

  /**
   * Parse OpenSCAD-style list comprehension: [for (i = range) expr] or [for (i = range) if (condition) expr]
   */
  private parseOpenScadStyle(node: TSNode): ast.ListComprehensionExpressionNode | ast.ErrorNode {
    try {
      const forClauseNode = node.childForFieldName('list_comprehension_for');
      const mainExpressionCstNode = node.childForFieldName('expr');
      const conditionCstNode = node.childForFieldName('condition');

      if (!forClauseNode) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.parseOpenScadStyle] Missing 'list_comprehension_for' child. CST: ${node.text}. ErrorCode: MISSING_FOR_CLAUSE`
        );
        return {
          type: 'error',
          errorCode: 'MISSING_FOR_CLAUSE',
          message: "Missing 'for' clause in OpenSCAD-style list comprehension.",
          location: getLocation(node),
          originalNodeType: node.type,
          cstNodeText: node.text,
        };
      }

      if (!mainExpressionCstNode) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.parseOpenScadStyle] Missing 'expr' child. CST: ${node.text}. ErrorCode: MISSING_MAIN_EXPRESSION_CHILD`
        );
        return {
          type: 'error',
          errorCode: 'MISSING_MAIN_EXPRESSION_CHILD',
          message: "Missing main expression child 'expr' in OpenSCAD-style list comprehension.",
          location: getLocation(node),
          originalNodeType: node.type,
          cstNodeText: node.text,
        };
      }

      const { variable: variableName, range: rangeAstNode } = this.extractForClause(forClauseNode);

      if (!variableName) {
        // Error already logged by extractForClause, rangeAstNode should be an ErrorNode in this case.
        const message = 'Failed to extract variable name from for clause.';
        this.errorHandler.logError(`[ListComprehensionVisitor.parseOpenScadStyle] ${message} CST: ${forClauseNode.text}. ErrorCode: NO_VARIABLE_IN_FOR_CLAUSE`);
        const errorNode: ast.ErrorNode = {
          type: 'error',
          errorCode: 'NO_VARIABLE_IN_FOR_CLAUSE',
          message,
          location: getLocation(forClauseNode),
          originalNodeType: forClauseNode.type,
          cstNodeText: forClauseNode.text,
        };
        if (rangeAstNode.type === 'error') {
          errorNode.cause = rangeAstNode;
        }
        return errorNode;
      }

      if (rangeAstNode.type === 'error') {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.parseOpenScadStyle] Error in range expression. CST: ${forClauseNode.text}. ErrorCode: RANGE_EXPRESSION_ERROR`
        );
        return {
          type: 'error',
          errorCode: 'RANGE_EXPRESSION_ERROR_PROPAGATED',
          message: 'Error in list comprehension range expression.',
          location: getLocation(node),
          originalNodeType: node.type,
          cstNodeText: node.text,
          cause: rangeAstNode,
        };
      }

      let mainExpressionAstNode: ast.ExpressionNode | ast.ErrorNode;
      if (mainExpressionCstNode.type === 'list_comprehension') {
        this.errorHandler.logInfo(
          `[ListComprehensionVisitor.parseOpenScadStyle] Found nested list comprehension: ${mainExpressionCstNode.text}`
        );
        mainExpressionAstNode = this.visitListComprehension(mainExpressionCstNode);
      } else {
        this.errorHandler.logDebug(
          `[ListComprehensionVisitor.parseOpenScadStyle] Parsing regular main expression: ${mainExpressionCstNode.text}`
        );
        const parsedExpr = this.parentVisitor.dispatchSpecificExpression(mainExpressionCstNode);
        if (!parsedExpr) {
          this.errorHandler.logError(
            `[ListComprehensionVisitor.parseOpenScadStyle] Failed to parse main expression (null return). CST: ${mainExpressionCstNode.text}. ErrorCode: MAIN_EXPRESSION_PARSE_NULL`
          );
          mainExpressionAstNode = {
            type: 'error',
            errorCode: 'MAIN_EXPRESSION_PARSE_NULL',
            message: 'Failed to parse main expression in list comprehension (null return).',
            location: getLocation(mainExpressionCstNode),
            originalNodeType: mainExpressionCstNode.type,
            cstNodeText: mainExpressionCstNode.text,
          };
        } else {
          mainExpressionAstNode = parsedExpr;
        }
      }

      if (mainExpressionAstNode.type === 'error') {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.parseOpenScadStyle] Error in main expression. CST: ${mainExpressionCstNode.text}. ErrorCode: MAIN_EXPRESSION_ERROR`
        );
        return {
          type: 'error',
          errorCode: 'MAIN_EXPRESSION_ERROR_PROPAGATED',
          message: 'Error in list comprehension main expression.',
          location: getLocation(node),
          originalNodeType: node.type,
          cstNodeText: node.text,
          cause: mainExpressionAstNode,
        };
      }

      let conditionAstNode: ast.ExpressionNode | undefined = undefined;
      if (conditionCstNode) {
        const parsedCondition = this.parentVisitor.dispatchSpecificExpression(conditionCstNode);
        if (!parsedCondition) {
          this.errorHandler.logError(
            `[ListComprehensionVisitor.parseOpenScadStyle] Failed to parse condition (null return). CST: ${conditionCstNode.text}. ErrorCode: CONDITION_PARSE_NULL`
          );
          return {
            type: 'error',
            errorCode: 'CONDITION_PARSE_NULL',
            message: 'Failed to parse condition in list comprehension (null return).',
            location: getLocation(conditionCstNode),
            originalNodeType: conditionCstNode.type,
            cstNodeText: conditionCstNode.text,
          };
        }
        if (parsedCondition.type === 'error') {
          this.errorHandler.logError(
            `[ListComprehensionVisitor.parseOpenScadStyle] Error in condition expression. CST: ${conditionCstNode.text}. ErrorCode: CONDITION_EXPRESSION_ERROR`
          );
          return {
            type: 'error',
            errorCode: 'CONDITION_EXPRESSION_ERROR_PROPAGATED',
            message: 'Error in list comprehension condition expression.',
            location: getLocation(node),
            originalNodeType: node.type,
            cstNodeText: node.text,
            cause: parsedCondition,
          };
        }
        conditionAstNode = parsedCondition;
      }

      const resultNode: ast.ListComprehensionExpressionNode = {
        type: 'expression',
        expressionType: 'list_comprehension_expression',
        variable: variableName,
        range: rangeAstNode, // Ensured to be ExpressionNode by checks above
        expression: mainExpressionAstNode, // Ensured to be ExpressionNode by checks above
        location: getLocation(node),
      };
      if (conditionAstNode) {
        resultNode.condition = conditionAstNode; // Ensured to be ExpressionNode by checks above
      }
      return resultNode;
    } catch (error: any) {
      this.errorHandler.logError(
        `[ListComprehensionVisitor.parseOpenScadStyle] Unexpected error: ${error?.message || error}. ErrorCode: PARSE_OPENSCAD_STYLE_UNEXPECTED_ERROR. OriginalError: ${error?.message}`
      );
      return {
        type: 'error',
        errorCode: 'PARSE_OPENSCAD_STYLE_UNEXPECTED_ERROR',
        message: `Unexpected error processing OpenSCAD-style list comprehension: ${error?.message || error}`,
        location: getLocation(node),
        originalNodeType: node.type,
        cstNodeText: node.text,
      };
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
  private extractForClause(forClause: TSNode): { variable: string | null; range: ast.ExpressionNode | ast.ErrorNode } {
    try {
      const varDecl = forClause.childForFieldName('variable_declaration');
      if (!varDecl) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] No variable_declaration found in for clause. CST: ${forClause.text}. ErrorCode: MISSING_VARIABLE_DECLARATION_IN_FOR_CLAUSE`
        );
        return {
          variable: null,
          range: {
            type: 'error',
            errorCode: 'MISSING_VARIABLE_DECLARATION_IN_FOR_CLAUSE',
            message: 'No variable_declaration found in for clause.',
            location: getLocation(forClause),
            originalNodeType: 'variable_declaration',
            cstNodeText: forClause.text,
          },
        };
      }

      const variableNode = varDecl.namedChild(0); // Use namedChild for robustness
      const variable = variableNode?.text || null;

      if (!variable || !variableNode) {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] Failed to extract variable name from for clause. CST: ${varDecl.text}. ErrorCode: MISSING_VARIABLE_NAME_IN_FOR_CLAUSE`
        );
        return {
          variable: null,
          range: {
            type: 'error',
            errorCode: 'MISSING_VARIABLE_NAME_IN_FOR_CLAUSE',
            message: 'Failed to extract variable name from for clause.',
            location: getLocation(varDecl),
            originalNodeType: varDecl.type,
            cstNodeText: varDecl.text,
          },
        };
      }

      const rangeNode = varDecl.namedChild(1); // Use namedChild for robustness
      let rangeAstNode: ast.ExpressionNode | ast.ErrorNode;

      if (rangeNode) {
        const parsedRange = this.parentVisitor.dispatchSpecificExpression(rangeNode);
        if (parsedRange) {
          rangeAstNode = parsedRange; // Can be ExpressionNode or ErrorNode
        } else {
          // dispatchSpecificExpression returning null implies an issue handled by parentVisitor or unhandled node type
          this.errorHandler.logError(
            `[ListComprehensionVisitor.extractForClause] dispatchSpecificExpression returned null for range node. CST: ${rangeNode.text}. ErrorCode: UNHANDLED_RANGE_NODE_TYPE`
          );
          rangeAstNode = {
            type: 'error',
            errorCode: 'UNPARSABLE_RANGE_EXPRESSION_NULL_RETURN',
            message: `Failed to parse range expression (null return): ${rangeNode.text}`,
            location: getLocation(rangeNode),
            originalNodeType: rangeNode.type,
            cstNodeText: rangeNode.text,
          };
        }
      } else {
        this.errorHandler.logError(
          `[ListComprehensionVisitor.extractForClause] No range expression node found in for clause. CST: ${varDecl.text}. ErrorCode: MISSING_RANGE_EXPRESSION_NODE`
        );
        rangeAstNode = {
          type: 'error',
          errorCode: 'MISSING_RANGE_EXPRESSION_NODE',
          message: 'No range expression node found in for clause.',
          location: getLocation(varDecl),
          originalNodeType: varDecl.type, // Or more specific if known
          cstNodeText: varDecl.text,
        };
      }
      return { variable, range: rangeAstNode };
    } catch (error: any) { // Catch any potential runtime errors during extraction
      this.errorHandler.logError(
        `[ListComprehensionVisitor.extractForClause] Unexpected error: ${error?.message || error}. ErrorCode: EXTRACT_FOR_CLAUSE_UNEXPECTED_ERROR. OriginalError: ${error?.message}`
      );
      return {
        variable: null,
        range: {
          type: 'error',
          errorCode: 'EXTRACT_FOR_CLAUSE_UNEXPECTED_ERROR',
          message: `Unexpected error extracting for clause: ${error?.message || error}`,
          location: getLocation(forClause),
          cstNodeText: forClause.text,
        },
      };
    }
  }
}
