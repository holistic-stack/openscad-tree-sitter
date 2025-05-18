/**
 * DifferenceOperation cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter difference node to an AST DifferenceOperation node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode } from '../../../../types/ast-types';
import { DifferenceOperation } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter difference node to an AST DifferenceOperation node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a difference operation statement
 * @returns The AST DifferenceOperation node
 */
export function differenceCursorAdapter(cursor: TreeCursor): DifferenceOperation {
  const node = cursor.currentNode();
  
  // Default empty children array
  let children: ASTNode[] = [];
  
  // Extract child nodes if present
  if (node.childCount >= 3) {
    const bodyNode = node.child(2);
    
    if (bodyNode && bodyNode.type === 'block') {
      // Process each child in the block
      children = extractChildNodes(bodyNode);
    }
  }
  
  // Construct and return the DifferenceOperation node
  return {
    type: 'DifferenceOperation',
    children,
    position: extractPositionFromCursor(cursor)
  };
}

/**
 * Extracts child nodes from a block node
 * 
 * @param blockNode The block node containing child nodes
 * @returns An array of AST nodes
 */
function extractChildNodes(blockNode: TreeSitterNode): ASTNode[] {
  const nodes: ASTNode[] = [];
  
  // Process each child in the block
  for (let i = 0; i < blockNode.childCount; i++) {
    const child = blockNode.child(i);
    if (child) {
      // Create a basic AST node representing the child
      const childAst: ASTNode = {
        type: 'CallExpression',
        position: {
          startLine: child.startPosition.row,
          startColumn: child.startPosition.column,
          endLine: child.endPosition.row,
          endColumn: child.endPosition.column
        }
      };
      nodes.push(childAst);
    }
  }
  
  return nodes;
}

/**
 * Creates a simple AST node from a CST node
 * 
 * @param node The CST node to convert
 * @returns A basic AST node
 */
function createSimpleAstNode(node: TreeSitterNode): ASTNode {
  return {
    type: 'CallExpression',
    position: {
      startLine: node.startPosition.row,
      startColumn: node.startPosition.column,
      endLine: node.endPosition.row,
      endColumn: node.endPosition.column
    }
  };
}
