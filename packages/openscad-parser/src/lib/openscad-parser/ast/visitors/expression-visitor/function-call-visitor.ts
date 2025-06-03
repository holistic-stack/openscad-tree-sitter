/**
 * Function call visitor for handling function calls in expressions
 *
 * This visitor is responsible for extracting function names and arguments from
 * function call nodes in the CST and creating appropriate AST nodes.
 *
 * @module lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../ast-types.js';
import { BaseASTVisitor } from '../base-ast-visitor.js';
import { getLocation } from '../../utils/location-utils.js';
import { findDescendantOfType } from '../../utils/node-utils.js';
import { ErrorHandler } from '../../../error-handling/index.js'; // Added ErrorHandler import

/**
 * Custom parameter interface for function call visitor
 */
interface FunctionCallParameter {
  name?: string;
  value: number | string | boolean | ast.ExpressionNode;
}

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
    parentVisitorOrSource: { dispatchSpecificExpression(node: TSNode): ast.ExpressionNode | null } | string | null,
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

  private parentVisitor: { dispatchSpecificExpression(node: TSNode): ast.ExpressionNode | null } | null;

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
    if (node.type === 'module_instantiation') {
      const functionNameNode = node.childForFieldName('name');
      this.errorHandler.logInfo(`[FunctionCallVisitor] Processing module_instantiation. Function name node: ${functionNameNode?.text}`);
      if (!functionNameNode) {
        this.errorHandler.createParserError(
          `Module instantiation node missing function name: ${node.text}`,
          { node, severity: 'error', code: 'MISSING_FUNCTION_NAME' }
        );
        return null;
      }
      const functionName = functionNameNode.text;

      const argsNode = node.childForFieldName('arguments');
      const args: ast.Parameter[] = [];

      if (argsNode) {
        // Process arguments
        for (const child of argsNode.children) {
          if (child.type === 'argument') {
            const nameNode = child.childForFieldName('name');
            const valueNode = child.childForFieldName('value');
            if (valueNode) {
              // Delegate value parsing to parent visitor
              const value = this.parentVisitor?.dispatchSpecificExpression(valueNode);
              this.errorHandler.logInfo(`[FunctionCallVisitor] Argument value node: ${valueNode.text}, parsed value: ${value}`);
              if (value) {
                args.push({
                  name: nameNode?.text,
                  value: value as ast.ParameterValue,
                });
              } else {
                this.errorHandler.createParserError(
                  `Failed to parse argument value: ${valueNode.text}`,
                  { node: valueNode, severity: 'error', code: 'INVALID_ARGUMENT_VALUE' }
                );
                return null;
              }
            }
          }
        }
      }
      return this.createASTNodeForFunction(node, functionName, args);
    }

    // Handle 'call_expression' node (for backward compatibility or specific cases)
    if (node.type === 'call_expression') {
      return this.visitCallExpression(node);
    }

    // Handle 'function_call' node (for backward compatibility or specific cases)
    if (node.type === 'function_call') {
      return this.visitFunctionCall(node);
    }

    this.errorHandler.createParserError(
      `Unsupported node type for FunctionCallVisitor: ${node.type}`,
      { node, severity: 'error', code: 'UNSUPPORTED_NODE_TYPE' }
    );
    return null;
  }

  /**
   * Visit a call expression node
   * @param node The call expression node
   * @returns The AST node or null if the node cannot be processed
   */
  public visitCallExpression(node: TSNode): ast.ASTNode | null {
    const functionNode = node.childForFieldName('function');
    const argumentsNode = node.childForFieldName('arguments');

    if (!functionNode) {
      this.errorHandler.createParserError(
        `Call expression node missing function: ${node.text}`,
        { node, severity: 'error', code: 'MISSING_FUNCTION' }
      );
      return null;
    }

    // The function can be an identifier or an accessor_expression (e.g., a.b())
    let functionName: string;
    if (functionNode.type === 'identifier') {
      functionName = functionNode.text;
    } else if (functionNode.type === 'accessor_expression') {
      // Handle accessor expressions for function names (e.g., `a.b()`)
      // This is a simplified approach; a full implementation might involve
      // resolving the accessor path.
      functionName = functionNode.text;
    } else {
      this.errorHandler.createParserError(
        `Unsupported function node type in call expression: ${functionNode.type}`,
        { node: functionNode, severity: 'error', code: 'UNSUPPORTED_FUNCTION_NODE_TYPE' }
      );
      return null;
    }

    const args: ast.Parameter[] = [];
    if (argumentsNode) {
      for (const child of argumentsNode.children) {
        if (child.type === 'argument') {
          const nameNode = child.childForFieldName('name');
          const valueNode = child.childForFieldName('value');
          if (valueNode) {
            // Delegate value parsing to parent visitor
            const value = this.parentVisitor?.dispatchSpecificExpression(valueNode);
            if (value) {
              args.push({
                name: nameNode?.text,
                value: value as ast.ParameterValue,
              });
            } else {
              this.errorHandler.createParserError(
                `Failed to parse argument value: ${valueNode.text}`,
                { node: valueNode, severity: 'error', code: 'INVALID_ARGUMENT_VALUE' }
              );
              return null;
            }
          }
        } else if (child.type === 'expression') {
          // Direct expression as argument (e.g., func(1, 2, 3))
          const value = this.parentVisitor?.dispatchSpecificExpression(child);
          if (value) {
            args.push({ value: value as ast.ParameterValue });
          } else {
            this.errorHandler.createParserError(
              `Failed to parse expression argument: ${child.text}`,
              { node: child, severity: 'error', code: 'INVALID_EXPRESSION_ARGUMENT' }
            );
            return null;
          }
        }
      }
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
      this.errorHandler.createParserError(
        `Function call node missing function: ${node.text}`,
        { node, severity: 'error', code: 'MISSING_FUNCTION' }
      );
      return null;
    }

    const functionName = functionNode.text;
    const args: ast.Parameter[] = [];

    if (argumentsNode) {
      for (const child of argumentsNode.children) {
        // In older grammar, arguments might be direct expressions
        const value = this.parentVisitor?.dispatchSpecificExpression(child);
        if (value) {
          args.push({ value: value as ast.ParameterValue });
        } else {
          this.errorHandler.createParserError(
            `Failed to parse argument value in old function call: ${child.text}`,
            { node: child, severity: 'error', code: 'INVALID_ARGUMENT_VALUE_OLD_GRAMMAR' }
          );
          return null;
        }
      }
    }

    return this.createASTNodeForFunction(node, functionName, args);
  }

  /**
   * Visit an accessor expression node
   * @param node The accessor expression node
   * @returns The AST node or null if the node cannot be processed
   */
  public visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    const operandNode = node.childForFieldName('operand');
    const fieldNode = node.childForFieldName('field');

    if (!operandNode || !fieldNode) {
      this.errorHandler.createParserError(
        `Accessor expression missing operand or field: ${node.text}`,
        { node, severity: 'error', code: 'MISSING_OPERAND_OR_FIELD' }
      );
      return null;
    }

    // For now, we'll treat accessor expressions as a special kind of function call
    // where the "function name" is the full accessor path.
    // A more robust solution might involve symbol resolution.
    const functionName = `${operandNode.text}.${fieldNode.text}`;
    const args: ast.Parameter[] = []; // Accessor expressions don't have direct arguments in this context

    // If the operand is an identifier, we can create a simple variable reference
    const identifierNode = findDescendantOfType(operandNode, 'identifier');
    if (!identifierNode) {
      this.errorHandler.logInfo(
        `[FunctionCallVisitor.visitAccessorExpression] No identifier found in operand for accessor expression: ${operandNode.text}`,
        'FunctionCallVisitor.visitAccessorExpression',
        operandNode
      );
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
      type: 'expression',
      expressionType: 'function_call',
      name: functionName,
      arguments: args,
      location: getLocation(node),
    } as ast.FunctionCallNode;
  }
}
