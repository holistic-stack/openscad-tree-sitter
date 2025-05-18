/**
 * Query utilities for OpenSCAD AST conversion
 * 
 * This file defines utilities for querying the tree-sitter syntax tree
 * to find specific patterns using tree-sitter's built-in query capabilities.
 * 
 * Following TDD principles and avoiding mocks, this implementation uses
 * dependency injection and interfaces for better testability.
 */

import Parser from 'web-tree-sitter';
import { TreeSitterNode, SyntaxTree } from '../../../types/cst-types';

/**
 * Result of executing a tree-sitter query
 */
export interface QueryResult {
  matches: Parser.QueryMatch[];
  nodes: TreeSitterNode[];
}

/**
 * Interface for query utilities
 */
export interface QueryUtilsInterface {
  /**
   * Execute a query on a syntax tree
   * 
   * @param tree The syntax tree to query
   * @param queryString The query string in tree-sitter query language
   * @returns A promise that resolves to a QueryResult
   */
  execute(tree: SyntaxTree, queryString: string): Promise<QueryResult>;
  
  /**
   * Find all nodes of a specific type in the syntax tree using cursor traversal
   * 
   * @param tree The syntax tree to search
   * @param nodeType The type of node to find
   * @returns A promise that resolves to an array of matching nodes
   */
  findNodesByType(tree: SyntaxTree, nodeType: string): Promise<TreeSitterNode[]>;
  
  /**
   * Find all nodes matching a predicate function using cursor traversal
   * 
   * @param tree The syntax tree to search
   * @param predicate A function that returns true for matching nodes
   * @returns A promise that resolves to an array of matching nodes
   */
  findNodesByPredicate(
    tree: SyntaxTree, 
    predicate: (node: TreeSitterNode) => boolean
  ): Promise<TreeSitterNode[]>;
}

/**
 * Implementation of query utilities
 */
class QueryUtils implements QueryUtilsInterface {
  /**
   * Execute a query on a syntax tree
   * 
   * @param tree The syntax tree to query
   * @param queryString The query string in tree-sitter query language
   * @returns A promise that resolves to a QueryResult
   */
  async execute(tree: SyntaxTree, queryString: string): Promise<QueryResult> {
    try {
      // Get the tree language
      const language = tree.getLanguage();
      
      // Create and execute the query
      const query = new Parser.Query(language, queryString);
      const matches = query.matches(tree.rootNode);
      
      // Extract nodes from matches
      const nodes: TreeSitterNode[] = [];
      for (const match of matches) {
        for (const capture of match.captures) {
          if (capture.node) {
            nodes.push(capture.node);
          }
        }
      }
      
      return { matches, nodes };
    } catch (error) {
      console.error('Error executing tree-sitter query:', error);
      return { matches: [], nodes: [] };
    }
  }
  
  /**
   * Find all nodes of a specific type in the syntax tree using cursor traversal
   * 
   * @param tree The syntax tree to search
   * @param nodeType The type of node to find
   * @returns A promise that resolves to an array of matching nodes
   */
  async findNodesByType(tree: SyntaxTree, nodeType: string): Promise<TreeSitterNode[]> {
    return this.findNodesByPredicate(tree, node => node.type === nodeType);
  }
  
  /**
   * Find all nodes matching a predicate function using cursor traversal
   * 
   * @param tree The syntax tree to search
   * @param predicate A function that returns true for matching nodes
   * @returns A promise that resolves to an array of matching nodes
   */
  async findNodesByPredicate(
    tree: SyntaxTree,
    predicate: (node: TreeSitterNode) => boolean
  ): Promise<TreeSitterNode[]> {
    const matches: TreeSitterNode[] = [];
    const cursor = tree.walk();
    let reachedRoot = false;
    
    // First go to the root
    cursor.gotoFirstChild();
    
    // Continue traversing until we've seen all nodes
    while (!reachedRoot) {
      const node = cursor.currentNode();
      
      // Check if this node matches the predicate
      if (predicate(node)) {
        matches.push(node);
      }
      
      // Try to go to first child
      if (cursor.gotoFirstChild()) {
        continue;
      }
      
      // No children, try next sibling
      if (cursor.gotoNextSibling()) {
        continue;
      }
      
      // No siblings, go back up
      let moved = false;
      while (!moved) {
        // If we can't go to parent, we're done
        if (!cursor.gotoParent()) {
          reachedRoot = true;
          break;
        }
        
        // Try to go to next sibling
        if (cursor.gotoNextSibling()) {
          moved = true;
        }
      }
    }
    
    // Clean up the cursor
    cursor.delete();
    
    return matches;
  }
}

/**
 * Create a new QueryUtils instance
 * 
 * @returns A QueryUtilsInterface instance
 */
export function createQueryUtils(): QueryUtilsInterface {
  return new QueryUtils();
}

/**
 * Find all nodes in a syntax tree matching a specific query
 * 
 * @param tree The syntax tree to search
 * @param queryString The query string in tree-sitter query language
 * @returns A promise that resolves to an array of matching nodes
 */
export async function findNodesWithQuery(
  tree: SyntaxTree,
  queryString: string
): Promise<TreeSitterNode[]> {
  const utils = createQueryUtils();
  const result = await utils.execute(tree, queryString);
  return result.nodes;
}

/**
 * Execute a tree-sitter query against a syntax tree
 * 
 * @param tree The syntax tree to query
 * @param queryString The query string in tree-sitter query language
 * @returns A promise that resolves to an array of query matches
 */
export async function executeQuery(
  tree: SyntaxTree,
  queryString: string
): Promise<Parser.QueryMatch[]> {
  const utils = createQueryUtils();
  const result = await utils.execute(tree, queryString);
  return result.matches;
}
