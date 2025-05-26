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
// extractArguments is not used in this file
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
    this.functionCallVisitor = new FunctionCallVisitor(this, errorHandler);
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
   * Safe logging helper that checks if errorHandler exists
   */
  private safeLog(level: 'info' | 'debug' | 'warning' | 'error', message: string, context?: string, node?: unknown): void {
    if (this.errorHandler) {
      switch (level) {
        case 'info':
          this.errorHandler.logInfo(message, context, node);
          break;
        case 'debug':
          this.errorHandler.logDebug(message, context, node);
          break;
        case 'warning':
          this.errorHandler.logWarning(message, context, node);
          break;
        case 'error':
          this.errorHandler.logError(message, context, node);
          break;
      }
    }
  }

  /**
   * Safe error handling helper that checks if errorHandler exists
   */
  private safeHandleError(error: Error, context?: string, node?: unknown): void {
    if (this.errorHandler?.handleError) {
      this.errorHandler.handleError(error, context, node);
    } else {
      throw error;
    }
  }

  /**
   * Create an expression node from a CST node
   * @param node The CST node representing the expression
   * @returns The expression AST node or null if the node cannot be processed
   */
  createExpressionNode(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.createExpressionNode] Creating expression for node type: ${
        node.type
      }, text: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.createExpressionNode',
      node
    );

    switch (node.type) {
      case 'binary_expression':
        this.safeLog(
          'warning',
          'BinaryExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.binaryExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'unary_expression':
        this.safeLog(
          'warning',
          'UnaryExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.unaryExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'conditional_expression':
        this.safeLog(
          'warning',
          'ConditionalExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.conditionalExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'parenthesized_expression':
        this.safeLog(
          'warning',
          'ParenthesizedExpressionVisitor is ANTLR-based and not yet fully integrated for Tree-sitter. Returning null.',
          'ExpressionVisitor.createExpressionNode',
          node
        );
        // return this.parenthesizedExpressionVisitor.visit(node); // ANTLR visitor, not compatible
        return null;
      case 'function_call': {
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
      }
      // TODO: Add cases for other expression types (literals, identifiers, etc.)
      // For now, we attempt to use the generic visitExpression for other types
      default:
        this.safeLog(
          'info',
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
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitExpression] Input node type: "${node.type}", text: "${node.text.substring(0, 50)}", childCount: ${node.childCount ?? 'undefined'}, namedChildCount: ${node.namedChildCount ?? 'undefined'}`,
      'ExpressionVisitor.visitExpression',
      node
    );

    // If the node itself is a specific expression type, use it directly
    if (node.type !== 'expression') {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Using node directly as it's not a generic expression wrapper: "${node.type}"`,
        'ExpressionVisitor.visitExpression',
        node
      );
      return this.dispatchSpecificExpression(node);
    }

    // An "expression" node in the grammar might be a wrapper.
    // We often need to look at its first named child to find the actual specific expression type.
    // Check if the node has the namedChild method (real TSNode) vs mock nodes in tests
    let specificExpressionNode: TSNode | null = null;

    if (typeof node.namedChild === 'function') {
      specificExpressionNode = node.namedChild(0);
    }

    if (!specificExpressionNode && typeof node.child === 'function') {
      specificExpressionNode = node.child(0);
    }

    if (!specificExpressionNode) {
      this.safeHandleError(
        new Error(`No specific expression node found within CST node: ${node.text.substring(0,100)}`),
        'ExpressionVisitor.visitExpression',
        node
      );
      return null;
    }

    // Debug: Log detailed child node information
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitExpression] Child node details: type="${specificExpressionNode.type}", text="${specificExpressionNode.text}", isNamed=${specificExpressionNode.isNamed ?? 'undefined'}, childCount=${specificExpressionNode.childCount ?? 'undefined'}`,
      'ExpressionVisitor.visitExpression',
      specificExpressionNode
    );

    this.safeLog(
      'info',
      `[ExpressionVisitor.visitExpression] Dispatching based on specific expression type: "${specificExpressionNode.type}", text: "${specificExpressionNode.text.substring(0, 50)}"`,
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

      case 'function_call': {
        // Handle function calls
        const functionCallResult = this.functionCallVisitor.visit(node);
        if (functionCallResult && functionCallResult.type === 'function_call') {
          const functionCall = functionCallResult;
          return {
            type: 'expression',
            expressionType: 'function_call',
            name: functionCall.name,
            arguments: functionCall.arguments,
            location: functionCall.location,
          } as ast.ExpressionNode;
        }
        return null;
      }

      case 'accessor_expression': {
        // Handle accessor expressions (which can be function calls, literals, or identifiers)
        const accessorResult = this.functionCallVisitor.visit(node);
        if (accessorResult) {
          // If it's a function call, wrap it as an expression
          if (accessorResult.type === 'function_call') {
            const functionCall = accessorResult;
            return {
              type: 'expression',
              expressionType: 'function_call',
              name: functionCall.name,
              arguments: functionCall.arguments,
              location: functionCall.location,
            } as ast.ExpressionNode;
          }
          // If it's already an expression (literal, identifier), return it directly
          if (accessorResult.type === 'expression') {
            return accessorResult as ast.ExpressionNode;
          }
        }

        // If the function call visitor returns null, handle the child directly
        // This happens when the accessor_expression contains a primary_expression (literal)
        if (node.namedChildCount === 1) {
          const child = node.namedChild(0);
          if (child) {
            this.safeLog(
              'info',
              `[ExpressionVisitor.dispatchSpecificExpression] FunctionCallVisitor returned null for accessor_expression, processing child: ${child.type}`,
              'ExpressionVisitor.dispatchSpecificExpression',
              child
            );
            return this.dispatchSpecificExpression(child);
          }
        }
        return null;
      }

      case 'vector_expression':
        return this.visitVectorExpression(node);

      case 'array_literal':
        return this.visitArrayExpression(node);

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
        // Check if this is actually a binary expression (has 3+ children) or just a wrapper (1 child)
        if (node.childCount >= 3) {
          // This is a real binary expression with left operand, operator, right operand
          return this.visitBinaryExpression(node);
        } else if (node.namedChildCount === 1) {
          // This is a single-child wrapper node, unwrap it
          const child = node.namedChild(0);
          if (child) {
            this.safeLog(
              'info',
              `[ExpressionVisitor.dispatchSpecificExpression] Unwrapping single-child expression hierarchy node: ${node.type} -> ${child.type}`,
              'ExpressionVisitor.dispatchSpecificExpression',
              node
            );
            return this.dispatchSpecificExpression(child);
          }
        }
        // If it's neither a binary expression nor a single-child wrapper, it's malformed
        this.safeHandleError(
          new Error(`Malformed expression hierarchy node: ${node.type} with ${node.childCount} children`),
          'ExpressionVisitor.dispatchSpecificExpression',
          node
        );
        return null;

      case 'unary_expression':
        return this.visitUnaryExpression(node);

      case 'conditional_expression':
        return this.visitConditionalExpression(node);

      case 'parenthesized_expression':
        return this.visitParenthesizedExpression(node);

      case 'primary_expression':
        return this.visitPrimaryExpression(node);

      default:
        this.safeHandleError(
          new Error(
            `Unsupported specific expression type "${node.type}" in dispatchSpecificExpression. Text: ${node.text.substring(0,100)}`
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
    this.safeLog(
      'info',
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
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitUnaryExpression] Processing unary expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitUnaryExpression',
      node
    );

    // Delegate to the unary expression visitor
    const result = this.unaryExpressionVisitor.visit(node);
    if (result) {
      return result;
    }

    // If the unary expression visitor returns null, this might be a single-child wrapper node
    // Try to unwrap it and process the child directly
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitUnaryExpression] UnaryExpressionVisitor returned null, unwrapping child: ${child.type}`,
          'ExpressionVisitor.visitUnaryExpression',
          node
        );
        const childResult = this.visitExpression(child);
        // Only return if it's an expression node (not a unary expression since that would have been handled above)
        if (childResult && childResult.type === 'expression') {
          return childResult as any; // Cast to satisfy return type, but this is actually any expression
        }
      }
    }

    return null;
  }

  /**
   * Visit a conditional expression node (ternary operator)
   * @param node The conditional expression node to visit
   * @returns The conditional expression AST node or null if the node cannot be processed
   */
  visitConditionalExpression(
    node: TSNode
  ): ast.ConditionalExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitConditionalExpression] Processing conditional expression: ${node.text.substring(
        0,
        50
      )}`,
      'ExpressionVisitor.visitConditionalExpression',
      node
    );

    // Delegate to the conditional expression visitor
    const result = this.conditionalExpressionVisitor.visit(node);
    if (result) {
      return result;
    }

    // If the conditional expression visitor returns null, this might be a single-child wrapper node
    // Try to unwrap it and process the child directly
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitConditionalExpression] ConditionalExpressionVisitor returned null, unwrapping child: ${child.type}`,
          'ExpressionVisitor.visitConditionalExpression',
          node
        );
        const childResult = this.visitExpression(child);
        // Only return if it's an expression node (not a conditional expression since that would have been handled above)
        if (childResult && childResult.type === 'expression') {
          return childResult as any; // Cast to satisfy return type, but this is actually any expression
        }
      }
    }

    return null;
  }

  /**
   * Visit a parenthesized expression node
   * @param node The parenthesized expression node to visit
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitParenthesizedExpression(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
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
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitLiteral] Processing literal: type="${node.type}", text="${node.text.substring(0,50)}"`,
      'ExpressionVisitor.visitLiteral',
      node
    );

    // Extract the literal value based on the node type
    let value: ast.ParameterValue;

    switch (node.type) {
      case 'number_literal':
      case 'number': {
        const nodeText = node.text.trim();
        if (!nodeText || nodeText.length === 0) {
          this.safeLog(
            'warning',
            `Empty number literal node: "${node.text}"`,
            'ExpressionVisitor.visitLiteral',
            node
          );
          return null;
        }

        const numValue = parseFloat(nodeText);
        if (isNaN(numValue)) {
          this.safeLog(
            'warning',
            `Invalid number literal: "${nodeText}" (original: "${node.text}")`,
            'ExpressionVisitor.visitLiteral',
            node
          );
          return null;
        }
        value = numValue;
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitLiteral] Successfully parsed number: ${numValue}`,
          'ExpressionVisitor.visitLiteral',
          node
        );
        break;
      }

      case 'string_literal':
      case 'string': {
        // Remove quotes from string literals
        const stringText = node.text;
        if (stringText.startsWith('"') && stringText.endsWith('"')) {
          value = stringText.slice(1, -1);
        } else {
          value = stringText;
        }
        break;
      }

      case 'boolean_literal':
      case 'true': {
        value = true;
        break;
      }

      case 'false': {
        value = false;
        break;
      }

      case 'undef_literal':
      case 'undef': {
        value = null; // OpenSCAD undef maps to null (now allowed in ParameterValue)
        break;
      }

      default:
        this.safeHandleError(
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
   * @returns The variable reference AST node or null if the node cannot be processed
   * @private
   */
  private visitIdentifier(node: TSNode): ast.VariableNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitIdentifier] Processing identifier: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitIdentifier',
      node
    );

    const name = node.text;
    if (!name || name.trim() === '') {
      this.safeHandleError(
        new Error(`Empty identifier name`),
        'ExpressionVisitor.visitIdentifier',
        node
      );
      return null;
    }

    // In expressions, identifiers are variable references
    return {
      type: 'expression',
      expressionType: 'variable',
      name,
      location: getLocation(node),
    } as ast.VariableNode;
  }

  /**
   * Visit a vector expression node (e.g., [1, 2, 3])
   * @param node The vector expression node to visit
   * @returns The vector expression AST node or null if the node cannot be processed
   * @private
   */
  private visitVectorExpression(node: TSNode): ast.VectorExpressionNode | null {
    this.safeLog(
      'warning',
      `[ExpressionVisitor.visitVectorExpression] Stub: Processing vector expression: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitVectorExpression',
      node
    );
    // TODO: Implement parsing of vector elements
    return null;
  }

  /**
   * Visit an array expression node (e.g., [1, 2, 3])
   * @param node The array expression node to visit
   * @returns The array expression AST node or null if the node cannot be processed
   * @private
   */
  private visitArrayExpression(node: TSNode): ast.ArrayExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitArrayExpression] Processing array expression: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitArrayExpression',
      node
    );

    // Parse array elements
    const items: ast.ExpressionNode[] = [];

    for (let i = 0; i < node.namedChildCount; i++) {
      const elementNode = node.namedChild(i);
      if (elementNode) {
        const elementAST = this.visitExpression(elementNode);
        if (elementAST) {
          items.push(elementAST);
        } else {
          this.safeLog(
            'warning',
            `Failed to parse array element at index ${i}: ${elementNode.text}`,
            'ExpressionVisitor.visitArrayExpression',
            elementNode
          );
        }
      }
    }

    return {
      type: 'expression',
      expressionType: 'array',
      items,
      location: getLocation(node),
    } as ast.ArrayExpressionNode;
  }

  /**
   * Visit an index expression node (e.g., var[index])
   * @param node The index expression node to visit
   * @returns The index expression AST node or null if the node cannot be processed
   * @private
   */
  private visitIndexExpression(node: TSNode): ast.IndexExpressionNode | null {
    this.safeLog(
      'warning',
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
    this.safeLog(
      'warning',
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
    this.safeLog(
      'warning',
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
    this.safeLog(
      'warning',
      `[ExpressionVisitor.visitListComprehensionExpression] Stub: Processing list comprehension: ${node.text.substring(0,50)}. Implementation pending.`,
      'ExpressionVisitor.visitListComprehensionExpression',
      node
    );
    // TODO: Implement parsing of loop, condition, and expression body
    return null;
  }
  // --- End of new stub methods ---

  /**
   * Visit an accessor expression node (function calls, variable access)
   * @param node The accessor expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitAccessorExpression',
      node
    );

    // First try to delegate to the function call visitor
    const functionCallResult = this.functionCallVisitor.visitAccessorExpression(node);
    if (functionCallResult) {
      return functionCallResult;
    }

    // If the function call visitor returns null, handle the child directly
    // This happens when the accessor_expression contains a primary_expression (literal)
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitAccessorExpression] FunctionCallVisitor returned null, processing child: ${child.type}`,
          'ExpressionVisitor.visitAccessorExpression',
          child
        );
        return this.dispatchSpecificExpression(child);
      }
    }

    return null;
  }

  /**
   * Visit a primary expression node (literals, identifiers)
   * @param node The primary expression node to visit
   * @returns The expression node or null if the node cannot be processed
   */
  visitPrimaryExpression(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitPrimaryExpression] Processing primary expression: ${node.text.substring(0,50)}`,
      'ExpressionVisitor.visitPrimaryExpression',
      node
    );

    // Primary expressions typically contain a single child that is the actual value
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        const result = this.dispatchSpecificExpression(child);
        // Only return if it's an ExpressionNode
        if (result && result.type === 'expression') {
          return result;
        }
      }
    }

    // If no child or multiple children, try to handle as literal
    return this.visitLiteral(node);
  }

  /**
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The function node
   * @param functionName The function name
   * @param args The function arguments
   * @returns The function call AST node or null if not handled
   */
  createASTNodeForFunction(node: TSNode, _functionName?: string, _args?: ast.Parameter[]): ast.ASTNode | null {
    // Expression visitor doesn't handle function definitions, only function calls
    // Function calls are handled by the FunctionCallVisitor
    if (node.type === 'function_call') {
      return this.functionCallVisitor.visitFunctionCall(node);
    }
    return null;
  }
}
