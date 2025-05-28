/**
 * Visitor that uses the query manager to find nodes in the CST
 *
 * This visitor uses the query manager to find nodes in the CST
 * and delegates to other visitors to process them.
 *
 * @module lib/openscad-parser/ast/visitors/query-visitor
 */

import { Node as TSNode, Tree } from 'web-tree-sitter';
import * as ast from '../ast-types.js';
import type { ASTVisitor } from './ast-visitor.js';
import { BaseASTVisitor } from './base-ast-visitor.js';
import { QueryManager } from '../query/query-manager.js';
import { ErrorHandler } from '../../error-handling/index.js';

/**
 * Visitor that uses the query manager to find nodes in the CST
 */
export class QueryVisitor extends BaseASTVisitor {
  /**
   * The query manager
   */
  private queryManager: QueryManager;

  /**
   * The tree-sitter tree
   */
  private tree: Tree;

  /**
   * Create a new QueryVisitor
   * @param source The source code
   * @param tree The tree-sitter tree
   * @param language The tree-sitter language
   * @param delegate The visitor to delegate to
   * @param errorHandler The error handler
   */
  constructor(
    source: string,
    tree: Tree,
    language: any,
    private delegate: ASTVisitor,
    errorHandler: ErrorHandler
  ) {
    super(source, errorHandler);
    this.tree = tree;
    this.queryManager = new QueryManager(language);
  }

  /**
   * Visit a node and return the corresponding AST node
   * @param node The node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  override visitNode(node: TSNode): ast.ASTNode | null {
    // Delegate to the delegate visitor
    return this.delegate.visitNode(node);
  }

  /**
   * Find all nodes of a specific type in the tree
   * @param nodeType The node type to find
   * @returns An array of nodes of the specified type
   */
  findNodesByType(nodeType: string): TSNode[] {
    return this.queryManager.findNodesByType(nodeType, this.tree);
  }

  /**
   * Find all nodes of specific types in the tree
   * @param nodeTypes The node types to find
   * @returns An array of nodes of the specified types
   */
  findNodesByTypes(nodeTypes: string[]): TSNode[] {
    return this.queryManager.findNodesByTypes(nodeTypes, this.tree);
  }

  /**
   * Execute a query on the tree
   * @param queryString The query string
   * @returns The query results
   */
  executeQuery(queryString: string): TSNode[] {
    return this.queryManager.executeQuery(queryString, this.tree);
  }

  /**
   * Execute a query on a specific node
   * @param queryString The query string
   * @param node The node to query
   * @returns The query results
   */
  executeQueryOnNode(queryString: string, node: TSNode): TSNode[] {
    return this.queryManager.executeQueryOnNode(queryString, node, this.source);
  }

  /**
   * Clear the query cache
   */
  clearQueryCache(): void {
    this.queryManager.clearCache();
  }

  /**
   * Get query cache statistics
   * @returns An object with cache statistics
   */
  getQueryCacheStats(): { hits: number; misses: number; size: number } {
    return this.queryManager.getCacheStats();
  }

  /**
   * Create an AST node for a specific function
   * @param node The node to process
   * @param functionName The name of the function
   * @param args The arguments to the function
   * @returns The AST node or null if the function is not supported
   */
  protected createASTNodeForFunction(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    // Delegate to the delegate visitor
    if (this.delegate instanceof BaseASTVisitor) {
      return (this.delegate as any).createASTNodeForFunction(
        node,
        functionName,
        args
      );
    }
    return null;
  }
}
