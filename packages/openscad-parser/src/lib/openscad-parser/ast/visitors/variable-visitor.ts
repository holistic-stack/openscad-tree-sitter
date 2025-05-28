import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types.js';
import { BaseASTVisitor } from './base-ast-visitor.js';
import { ErrorHandler } from '../../error-handling/index.js';
import { getLocation } from '../utils/location-utils.js';
import { findDescendantOfType } from '../utils/node-utils.js';

/**
 * Visitor for handling variable references in the AST
 */
export class VariableVisitor extends BaseASTVisitor {
  /**
   * Constructor for the VariableVisitor
   * @param source The source code
   * @param errorHandler The error handler
   */
  constructor(source: string, protected errorHandler: ErrorHandler) {
    super(source, errorHandler);
  }
  /**
   * Create a variable node from a variable node in the CST
   * @param node The variable node from the CST
   * @returns A variable node for the AST
   */
  createVariableNode(node: TSNode): ast.VariableNode | null {
    this.safeLog(
      'info',
      `[VariableVisitor.createVariableNode] Processing variable node: ${node.text}`,
      'VariableVisitor.createVariableNode',
      node
    );

    try {
      // Extract the variable name from the identifier node
      const identifierNode = findDescendantOfType(node, 'identifier');
      if (!identifierNode) {
        this.safeLog(
          'warning',
          `[VariableVisitor.createVariableNode] No identifier found in variable node: ${node.text}`,
          'VariableVisitor.createVariableNode',
          node
        );
        return null;
      }

      // Create the variable node
      return {
        type: 'expression',
        expressionType: 'variable',
        name: identifierNode.text,
        location: getLocation(node),
      };
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        'VariableVisitor.createVariableNode',
        node
      );
      return null;
    }
  }

  /**
   * Visit a variable node in the CST
   * @param node The variable node from the CST
   * @returns A variable node for the AST
   */
  visitVariable(node: TSNode): ast.VariableNode | null {
    this.safeLog(
      'info',
      `[VariableVisitor.visitVariable] Processing variable: ${node.text}`,
      'VariableVisitor.visitVariable',
      node
    );
    return this.createVariableNode(node);
  }

  /**
   * Visit an identifier node in the CST
   * @param node The identifier node from the CST
   * @returns A variable node for the AST
   */
  visitIdentifier(node: TSNode): ast.VariableNode | null {
    this.safeLog(
      'info',
      `[VariableVisitor.visitIdentifier] Processing identifier: ${node.text}`,
      'VariableVisitor.visitIdentifier',
      node
    );
    
    // Create a variable node directly from the identifier
    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node),
    };
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
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The function node
   * @param functionName The function name
   * @param args The function arguments
   * @returns The function call AST node or null if not handled
   */
  createASTNodeForFunction(node: TSNode, _functionName?: string, _args?: ast.Parameter[]): ast.ASTNode | null {
    // VariableVisitor doesn't handle function definitions or calls
    return null;
  }
}