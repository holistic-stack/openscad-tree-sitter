/**
 * Function call visitor for handling function calls in expressions
 *
 * This visitor is responsible for extracting function names and arguments from
 * function call nodes in the CST and creating appropriate AST nodes.
 *
 * @module lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import { ErrorCode, type ErrorContext } from '../../../error-handling/types/error-types.js';
import * as ast from '../../ast-types.js';
import { BaseASTVisitor } from '../base-ast-visitor.js';
import { getLocation } from '../../utils/location-utils.js';
import { findDescendantOfType } from '../../utils/node-utils.js';
import { ErrorHandler } from '../../../error-handling/index.js';
import type { IParentExpressionVisitor } from './i-parent-expression-visitor.js';
import { extractArguments } from '../../extractors/argument-extractor.js'; // Import the existing argument extractor

/**
 * Visitor for function calls in expressions
 */
export class FunctionCallVisitor extends BaseASTVisitor {
  /**
   * Create a new FunctionCallVisitor
   * @param parentVisitorOrSource The parent expression visitor or source code (for backward compatibility)
   * @param errorHandler The error handler instance
   */
  constructor(
    parentVisitorOrSource: IParentExpressionVisitor | string | null,
    protected override errorHandler: ErrorHandler
  ) {
    super('', errorHandler); // Source is not needed for this visitor

    // Handle backward compatibility: if first parameter is a string, it's the old constructor signature
    if (typeof parentVisitorOrSource === 'string') {
      this.parentVisitor = null;
    } else {
      this.parentVisitor = parentVisitorOrSource;
    }
  }

  private parentVisitor: IParentExpressionVisitor | null;

  /**
   * Visit a node that could be a function call or module instantiation
   * @param node The node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visit(node: TSNode): ast.ASTNode | null {
    // Note: Grammar refactoring has unified function calls and module instantiations
    // under 'module_instantiation' node type.
    // However, for backward compatibility and specific handling, we might still
    // encounter 'call_expression' or 'function_call' in older ASTs or specific contexts.

    // Handle 'module_instantiation' node
    let functionNameNode: TSNode | null = null;
    let argsNode: TSNode | null = null;

    if (node.type === 'module_instantiation') {
      functionNameNode = node.childForFieldName('name');
      argsNode = node.childForFieldName('arguments');
      if (!functionNameNode) {
        const message = `[FunctionCallVisitor] Module name node not found for module_instantiation: ${node.text}`;
        this.errorHandler.logError(message);
        return {
          type: 'error',
          errorCode: 'MISSING_FUNCTION_CALL_NAME',
          message: `Module name not found for module_instantiation. CST node text: ${node.text}`,
          originalNodeType: node.type,
          cstNodeText: node.text,
          location: getLocation(node),
        } as ast.ErrorNode;
      }

    } else if (node.type === 'call_expression') {
      functionNameNode = node.childForFieldName('function');
      argsNode = node.childForFieldName('arguments');
      if (!functionNameNode) {
        const message = `[FunctionCallVisitor] Function name node not found for call_expression: ${node.text}`;
        this.errorHandler.logError(message);
        return {
          type: 'error',
          errorCode: 'MISSING_FUNCTION_CALL_NAME',
          message: `Function name not found for call_expression. CST node text: ${node.text}`,
          originalNodeType: node.type,
          cstNodeText: node.text,
          location: getLocation(node),
        } as ast.ErrorNode;
      }
    } else {
      const errorMsg = 'Unexpected node type for function call/module instantiation.';
      this.errorHandler.handleError(this.errorHandler.createSyntaxError(
        `${errorMsg} Expected 'module_instantiation' or 'call_expression', got '${node.type}'.`,
        { cstNode: node, code: ErrorCode.SYNTAX_ERROR, nodeType: node.type }
      ));
      return {
        type: 'error',
        errorCode: 'UNEXPECTED_NODE_TYPE_FOR_FUNCTION_CALL',
        message: `${errorMsg} Expected 'module_instantiation' or 'call_expression', got '${node.type}'. CST node text: ${node.text}`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
    }

    this.errorHandler.logInfo(`[FunctionCallVisitor] Processing function call. Function name node: ${functionNameNode?.text}`);

    // This check is somewhat redundant due to earlier checks but kept for safety.
    // If functionNameNode is null here, it means an earlier check should have caught it and returned an ErrorNode.
    // However, to be absolutely safe, if it somehow reaches here as null, we create an ErrorNode.
    if (!functionNameNode) {
      const message = `[FunctionCallVisitor] Critical error: Function name node is unexpectedly null after initial checks. Node: ${node.text}`;
      this.errorHandler.logError(message, 'FunctionCallVisitor.visit', node);
      return {
        type: 'error',
        errorCode: 'INTERNAL_PARSER_ERROR_UNEXPECTED_NULL_FUNCTION_NAME',
        message: `Critical error: Function name node is unexpectedly null. CST node text: ${node.text}`,
        originalNodeType: node.type,
        cstNodeText: node.text,
        location: getLocation(node),
      } as ast.ErrorNode;
    }

    const functionName = functionNameNode.text;
    const args: ast.Parameter[] = [];

    if (argsNode) {
      // Use the existing extractArguments function which handles the correct structure
      const extractedArgs = extractArguments(argsNode, this.errorHandler);
      args.push(...extractedArgs);
    }
    return this.createASTNodeForFunction(node, functionName, args);
  }



  /**
   * Visit a function call node (old grammar)
   * @param node The function call node
   * @returns The AST node or null if the node cannot be processed
   */
  public visitFunctionCall(node: TSNode): ast.ASTNode | null {
    const functionNode = node.childForFieldName('function');
    const argumentsNode = node.childForFieldName('arguments');

    if (!functionNode) {
      this.errorHandler.handleError(this.errorHandler.createSyntaxError(
        'Function call node missing function.',
        { cstNode: node, code: ErrorCode.SYNTAX_ERROR }
      ));
      return null;
    }

    this.errorHandler.logInfo(`[FunctionCallVisitor] Debugging visitFunctionCall: functionNode type: ${functionNode.type}, functionNode.text: ${functionNode.text}`);
    const functionNameNode = functionNode.childForFieldName('name');
    if (!functionNameNode) {
      this.errorHandler.handleError(this.errorHandler.createSyntaxError(
        'Function call name not found.',
        { cstNode: node, code: ErrorCode.MISSING_FUNCTION_NAME }
      ));
      return null;
    }

    const functionName = functionNameNode.text;
    const args: ast.Parameter[] = [];

    if (argumentsNode) {
      for (const child of argumentsNode.children) {
        if (!child) {
          this.errorHandler.logError(`[FunctionCallVisitor] Invalid child node in old arguments: ${child}`);
          continue; // Skip this child if it's invalid
        }
        // In older grammar, arguments might be direct expressions
        const value = this.parentVisitor?.dispatchSpecificExpression(child);
        if (value) {
          args.push({ name: undefined, value: value as ast.ParameterValue });
        } else {
          this.errorHandler.handleError(this.errorHandler.createValidationError(
            `Failed to parse argument value in old function call: ${child.text}`,
            { cstNode: child, code: ErrorCode.INVALID_ARGUMENT_VALUE }
          ));
          return null;
        }
      }
    }

    return this.createASTNodeForFunction(node, functionName, args);
  }

  /**
   * Creates a simple literal node from a TSNode
   * @param node The TSNode to convert
   * @returns A literal AST node
   */
  private createSimpleLiteralFromNode(node: TSNode): ast.LiteralNode {
    // Parse the value based on the node text
    const text = node.text.trim();
    let value: ast.ParameterValue;

    // Try to parse as number first
    const numValue = parseFloat(text);
    if (!isNaN(numValue)) {
      value = numValue;
    } else if (text === 'true') {
      value = true;
    } else if (text === 'false') {
      value = false;
    } else if (text === 'undef') {
      value = null;
    } else if (text.startsWith('"') && text.endsWith('"')) {
      value = text.slice(1, -1); // Remove quotes
    } else {
      value = text; // Default to string
    }

    return {
      type: 'expression',
      expressionType: 'literal',
      value,
      location: getLocation(node),
    } as ast.LiteralNode;
  }

  /**
   * Create an expression node from a CST node
   * This is needed for the test that mocks this method
   * @param node The CST node
   * @returns An expression node or null if the node cannot be processed
   */
  private createExpressionNode(node: TSNode): ast.ExpressionNode | null {
    // This is just a stub for the test that mocks this method
    return this.createSimpleLiteralFromNode(node);
  }

  /**
   * Create an AST node for a function call
   * @param node The node containing the function call
   * @param functionName The name of the function
   * @param args The arguments to the function
   * @returns The AST node or null if the function is not supported
   */
  protected createASTNodeForFunction(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    this.errorHandler.logInfo(
      `[FunctionCallVisitor.createASTNodeForFunction] Processing function: ${functionName}`,
      'FunctionCallVisitor.createASTNodeForFunction'
    );

    // Create a function call node
    return {
      type: 'function_call',
      functionName: functionName,
      args: args,
      location: getLocation(node),
    } as ast.FunctionCallNode;
  }
}
