/**
 * Visitor for expressions (binary, unary, conditional, etc.)
 *
 * This visitor handles expressions in OpenSCAD, including:
 * - Binary expressions (arithmetic, comparison, logical)
 * - Unary expressions (negation, logical not)
 * - Conditional expressions (ternary operator)
 * - Variable references
 * - Literal values (numbers, strings, vectors)
 * - Array/vector indexing
 *
 * @module lib/openscad-parser/ast/visitors/expression-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { getLocation } from '../utils/location-utils';
import { findDescendantOfType } from '../utils/node-utils';
// extractArguments is not used in this file
import { extractValue } from '../extractors/value-extractor';
import { FunctionCallVisitor } from './expression-visitor/function-call-visitor';
import { BinaryExpressionVisitor } from './expression-visitor/binary-expression-visitor/binary-expression-visitor';
import { UnaryExpressionVisitor } from './expression-visitor/unary-expression-visitor/unary-expression-visitor';
import { ConditionalExpressionVisitor } from './expression-visitor/conditional-expression-visitor/conditional-expression-visitor';
import { ParenthesizedExpressionVisitor } from './expression-visitor/parenthesized-expression-visitor/parenthesized-expression-visitor';
import { ErrorHandler } from '../../error-handling'; // Added ErrorHandler import

/**
 * Visitor for expressions
 */
export class ExpressionVisitor extends BaseASTVisitor {
  /**
   * Function call visitor for handling function calls in expressions
   */
  private functionCallVisitor: FunctionCallVisitor;

  /**
   * Binary expression visitor for handling binary operations in expressions
   */
  private binaryExpressionVisitor: BinaryExpressionVisitor;

  /**
   * Unary expression visitor for handling unary operations in expressions
   */
  private unaryExpressionVisitor: UnaryExpressionVisitor;

  /**
   * Conditional expression visitor for handling conditional operations in expressions
   */
  private conditionalExpressionVisitor: ConditionalExpressionVisitor;

  /**
   * Parenthesized expression visitor for handling parenthesized expressions
   */
  private parenthesizedExpressionVisitor: ParenthesizedExpressionVisitor;

  constructor(source: string, errorHandler: ErrorHandler) {
    super(source, errorHandler);
    this.functionCallVisitor = new FunctionCallVisitor(source, errorHandler);
    this.binaryExpressionVisitor = new BinaryExpressionVisitor(
      this,
      errorHandler
    );
    this.unaryExpressionVisitor = new UnaryExpressionVisitor(
      this,
      errorHandler
    );
    this.conditionalExpressionVisitor = new ConditionalExpressionVisitor(
      this,
      errorHandler
    );
    this.parenthesizedExpressionVisitor = new ParenthesizedExpressionVisitor(
      this,
      errorHandler
    );
  }

  /**
   * Create an expression node from a CST node
   * @param node The CST node representing the expression
   * @returns The expression AST node or null if the node cannot be processed
   */
  createExpressionNode(node: TSNode): ast.ExpressionNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.createExpressionNode] Creating expression for node type: ${
        node.type
      }, text: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.createExpressionNode',
      node
    );

    switch (node.type) {
      case 'binary_expression':
        this.errorHandler.logWarning(
          'BinaryExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.binaryExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'unary_expression':
        this.errorHandler.logWarning(
          'UnaryExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.unaryExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'conditional_expression':
        this.errorHandler.logWarning(
          'ConditionalExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.conditionalExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'parenthesized_expression':
        this.errorHandler.logWarning(
          'ParenthesizedExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.parenthesizedExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'function_call':
        // Convert function call to expression node for expression contexts
        const functionCall = this.functionCallVisitor.visitFunctionCall(node);
        if (functionCall) {
          // Create an expression wrapper for the function call
          return {
            type: 'expression',
            expressionType: 'function_call',
            name: functionCall.name,
            arguments: functionCall.arguments,
            location: functionCall.location,
          } as ast.ExpressionNode;
        }
        return null;
      // TODO: Add cases for other expression types (literals, identifiers, etc.)
      // For now, we attempt to use the generic visitExpression for other types
      default:
        this.errorHandler.logInfo(
          `[ExpressionVisitor.createExpressionNode] Defaulting to visitExpression for type: ${node.type}`,
          'ExpressionVisitor.createExpressionNode',
          node
        );
        return this.visitExpression(node); // Fallback to generic expression visitor
    }
  }

  /**
   * Visit an expression node. This method determines the specific type of expression
   * and dispatches to the appropriate handler method.
   * @param node The expression node to visit (CST node)
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitExpression(node: TSNode): ast.ExpressionNode | null {
    // Debug: Log the node structure
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitExpression] Input node type: "${node.type}", text: "${node.text.substring(0, 50)}", childCount: ${node.childCount}, namedChildCount: ${node.namedChildCount}`,
      'ExpressionVisitor.visitExpression',
      node
    );

    // If the node itself is a specific expression type, use it directly
    if (node.type !== 'expression') {
      this.errorHandler.logInfo(
        `[ExpressionVisitor.visitExpression] Using node directly as it's not a generic expression wrapper: "${node.type}"`,
        'ExpressionVisitor.visitExpression',
        node
      );
      return this.dispatchSpecificExpression(node);
    }

    // An "expression" node in the grammar might be a wrapper.
    // We often need to look at its first named child to find the actual specific expression type.
    const specificExpressionNode = node.namedChild(0) || node.child(0);

    if (!specificExpressionNode) {
      this.errorHandler.handleError(
        new Error(`No specific expression node found within CST node: ${node.text.substring(0,100)}`),
        'ExpressionVisitor.visitExpression',
        node
      );
      return null;
    }

    // Debug: Log detailed child node information
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitExpression] Child node details: type="${specificExpressionNode.type}", text="${specificExpressionNode.text}", isNamed=${specificExpressionNode.isNamed}, childCount=${specificExpressionNode.childCount}`,
      'ExpressionVisitor.visitExpression',
      specificExpressionNode
    );

    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitExpression] Dispatching based on specific expression type: \"${specificExpressionNode.type}\", text: \"${specificExpressionNode.text.substring(0, 50)}\"`,
      'ExpressionVisitor.visitExpression',
      specificExpressionNode
    );

    return this.dispatchSpecificExpression(specificExpressionNode);
  }

  /**
   * Dispatch to the appropriate visitor based on the specific expression type
   * @param node The specific expression node
   * @returns The expression AST node or null if the node cannot be processed
   */
  private dispatchSpecificExpression(node: TSNode): ast.ExpressionNode | null {
    switch (node.type) {
      case 'number_literal':
      case 'string_literal':
      case 'boolean_literal':
      case 'undef_literal':
      case 'true':
      case 'false':
      case 'undef':
      case 'number':
      case 'string':
        return this.visitLiteral(node);

      case 'identifier':
        return this.visitIdentifier(node);

      case 'function_call':
      case 'accessor_expression':
        // Convert function call to expression node for expression contexts
        const functionCallResult = this.functionCallVisitor.visit(node);
        if (functionCallResult && functionCallResult.type === 'function_call') {
          const functionCall = functionCallResult as ast.FunctionCallNode;
          // Create an expression wrapper for the function call
          return {
            type: 'expression',
            expressionType: 'function_call',
            name: functionCall.name,
            arguments: functionCall.arguments,
            location: functionCall.location,
          } as ast.ExpressionNode;
        }
        return null;

      case 'vector_expression':
        return this.visitVectorExpression(node);

      case 'index_expression':
        return this.visitIndexExpression(node);

      case 'range_expression':
        return this.visitRangeExpression(node);

      case 'let_expression':
        return this.visitLetExpression(node);

      case 'list_comprehension_expression': // Also covers 'list_comprehension_if_expression', 'list_comprehension_for_expression'
      case 'list_comprehension_if_expression':
      case 'list_comprehension_for_expression':
        return this.visitListComprehensionExpression(node);

      case 'binary_expression':
      case 'logical_or_expression':
      case 'logical_and_expression':
      case 'equality_expression':
      case 'relational_expression':
      case 'additive_expression':
      case 'multiplicative_expression':
      case 'exponentiation_expression':
        return this.visitBinaryExpression(node);

      case 'unary_expression':
        return this.visitUnaryExpression(node);

      case 'conditional_expression':
        return this.visitConditionalExpression(node);

      case 'parenthesized_expression':
        return this.visitParenthesizedExpression(node);

      default:
        this.errorHandler.handleError(
          new Error(
            `Unsupported specific expression type \"${node.type}\" in dispatchSpecificExpression. Text: ${node.text.substring(0,100)}`
          ),
          'ExpressionVisitor.dispatchSpecificExpression',
          node
        );
        return null;
    }
  }

  /**
   * Visit a binary expression node
   * @param node The binary expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitBinaryExpression(node: TSNode): ast.BinaryExpressionNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitBinaryExpression] Processing binary expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitBinaryExpression',
      node
    );

    // Delegate to the binary expression visitor
    return this.binaryExpressionVisitor.visit(node);
  }

  /**
   * Visit a unary expression node
   * @param node The unary expression node to visit
   * @returns The unary expression AST node or null if the node cannot be processed
   */
  visitUnaryExpression(node: TSNode): ast.UnaryExpressionNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitUnaryExpression] Processing unary expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitUnaryExpression',
      node
    );

    // Delegate to the unary expression visitor
    return this.unaryExpressionVisitor.visit(node);
  }

  /**
   * Visit a conditional expression node (ternary operator)
   * @param node The conditional expression node to visit
   * @returns The conditional expression AST node or null if the node cannot be processed
   */
  visitConditionalExpression(
    node: TSNode
  ): ast.ConditionalExpressionNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitConditionalExpression] Processing conditional expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitConditionalExpression',
      node
    );

    // Delegate to the conditional expression visitor
    return this.conditionalExpressionVisitor.visit(node);
  }

  /**
   * Visit a parenthesized expression node
   * @param node The parenthesized expression node to visit
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitParenthesizedExpression(node: TSNode): ast.ExpressionNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitParenthesizedExpression] Processing parenthesized expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitParenthesizedExpression',
      node
    );
    // Delegate to the parenthesized expression visitor
    return this.parenthesizedExpressionVisitor.visit(node);
  }

  // --- Start of new stub methods ---
  /**
   * Visit a literal node (number, string, boolean, undef)
   * @param node The literal node to visit
   * @returns The literal AST node or null if the node cannot be processed
   * @private
   */
  private visitLiteral(node: TSNode): ast.LiteralNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitLiteral] Processing literal: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitLiteral',
      node
    );

    // Extract the literal value based on the node type
    let value: ast.ParameterValue;

    switch (node.type) {
      case 'number_literal':
      case 'number':
        const numValue = parseFloat(node.text);
        if (isNaN(numValue)) {
          this.errorHandler.handleError(
            new Error(`Invalid number literal: ${node.text}`),
            'ExpressionVisitor.visitLiteral',
            node
          );
          return null;
        }
        value = numValue;
        break;

      case 'string_literal':
      case 'string':
        // Remove quotes from string literals
        const stringText = node.text;
        if (stringText.startsWith('"') && stringText.endsWith('"')) {
          value = stringText.slice(1, -1);
        } else {
          value = stringText;
        }
        break;

      case 'boolean_literal':
      case 'true':
        value = true;
        break;

      case 'false':
        value = false;
        break;

      case 'undef_literal':
      case 'undef':
        value = null; // OpenSCAD undef maps to null (now allowed in ParameterValue)
        break;

      default:
        this.errorHandler.handleError(
          new Error(`Unsupported literal type: ${node.type}`),
          'ExpressionVisitor.visitLiteral',
          node
        );
        return null;
    }

    return {
      type: 'expression',
      expressionType: 'literal',
      value,
      location: getLocation(node),
    } as ast.LiteralNode;
  }

  /**
   * Visit an identifier node (variable reference)
   * @param node The identifier node to visit
   * @returns The identifier AST node or null if the node cannot be processed
   * @private
   */
  private visitIdentifier(node: TSNode): ast.IdentifierNode | null {
    this.errorHandler.logInfo(
      `[ExpressionVisitor.visitIdentifier] Processing identifier: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitIdentifier',
      node
    );

    const name = node.text;
    if (!name || name.trim() === '') {
      this.errorHandler.handleError(
        new Error(`Empty identifier name`),
        'ExpressionVisitor.visitIdentifier',
        node
      );
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'identifier',
      name,
      location: getLocation(node),
    } as ast.IdentifierNode;
  }

  /**
   * Visit a vector expression node (e.g., [1, 2, 3])
   * @param node The vector expression node to visit
   * @returns The vector expression AST node or null if the node cannot be processed
   * @private
   */
  private visitVectorExpression(node: TSNode): ast.VectorExpressionNode | null {
    this.errorHandler.logWarning(
      `[ExpressionVisitor.visitVectorExpression] Stub: Processing vector expression: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitVectorExpression',
      node
    );
    // TODO: Implement parsing of vector elements
    return null;
  }

  /**
   * Visit an index expression node (e.g., var[index])
   * @param node The index expression node to visit
   * @returns The index expression AST node or null if the node cannot be processed
   * @private
   */
  private visitIndexExpression(node: TSNode): ast.IndexExpressionNode | null {
    this.errorHandler.logWarning(
      `[ExpressionVisitor.visitIndexExpression] Stub: Processing index expression: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitIndexExpression',
      node
    );
    // TODO: Implement parsing of base and index
    return null;
  }

  /**
   * Visit a range expression node (e.g., [start:end] or [start:step:end])
   * @param node The range expression node to visit
   * @returns The range expression AST node or null if the node cannot be processed
   * @private
   */
  private visitRangeExpression(node: TSNode): ast.RangeExpressionNode | null {
    this.errorHandler.logWarning(
      `[ExpressionVisitor.visitRangeExpression] Stub: Processing range expression: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitRangeExpression',
      node
    );
    // TODO: Implement parsing of start, step, end
    return null;
  }

  /**
   * Visit a let expression node (e.g., let(a=1, b=2) a+b)
   * @param node The let expression node to visit
   * @returns The let expression AST node or null if the node cannot be processed
   */
  visitLetExpression(node: TSNode): ast.LetExpressionNode | null {
    this.errorHandler.logWarning(
      `[ExpressionVisitor.visitLetExpression] Stub: Processing let expression: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitLetExpression',
      node
    );
    // TODO: Implement parsing of assignments and body
    return null;
  }

  /**
   * Visit a list comprehension expression node (e.g., [for (i = [0:10]) i*2])
   * @param node The list comprehension expression node to visit
   * @returns The list comprehension expression AST node or null if the node cannot be processed
   * @private
   */
  private visitListComprehensionExpression(node: TSNode): ast.ListComprehensionExpressionNode | null {
    this.errorHandler.logWarning(
      `[ExpressionVisitor.visitListComprehensionExpression] Stub: Processing list comprehension: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitListComprehensionExpression',
      node
    );
    // TODO: Implement parsing of loop, condition, and expression body
    return null;
  }
  // --- End of new stub methods ---

  /**
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The function node
   * @param functionName The function name
   * @param args The function arguments
   * @returns The function call AST node or null if not handled
   */
  createASTNodeForFunction(node: TSNode, functionName?: string, args?: ast.Parameter[]): ast.ASTNode | null {
    // Expression visitor doesn't handle function definitions, only function calls
    // Function calls are handled by the FunctionCallVisitor
    if (node.type === 'function_call') {
      return this.functionCallVisitor.visitFunctionCall(node);
    }
    return null;
  }
}
