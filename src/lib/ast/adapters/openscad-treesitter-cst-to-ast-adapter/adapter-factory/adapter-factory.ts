import { TreeSitterNode, ASTNode } from '../../../types';
import { detectNodeType, extractPosition } from '../utils';

/**
 * Type definition for node adapter functions
 * Some adapters need access to the recursive adaptNode function
 * while others can work independently
 */
export type NodeAdapterWithRecursion = (
  node: TreeSitterNode,
  adaptNode: (node: TreeSitterNode) => ASTNode
) => ASTNode;

export type NodeAdapterSimple = (
  node: TreeSitterNode
) => ASTNode;

export type NodeAdapter = NodeAdapterSimple | NodeAdapterWithRecursion;

/**
 * Map of AST node types to their adapter functions
 */
export type NodeAdapterMap = Record<string, NodeAdapter>;

/**
 * Creates a node adapter function that uses the adapter map to delegate to the appropriate adapter
 * 
 * @param adapterMap Map of node types to adapter functions
 * @returns A function that adapts tree-sitter nodes to AST nodes
 */
export function createNodeAdapter(adapterMap: NodeAdapterMap): (node: TreeSitterNode) => ASTNode {
  /**
   * The adapter function that handles all node types by delegating to specific adapters
   * 
   * @param node The tree-sitter node to adapt
   * @returns The corresponding AST node
   */
  const adaptNode = (node: TreeSitterNode): ASTNode => {
    // Detect the AST node type based on the tree-sitter node type
    const nodeType = detectNodeType(node);
    
    // Get the appropriate adapter for this node type
    const adapter = adapterMap[nodeType];
    
    if (adapter) {
      // Check if the adapter requires the adaptNode function for recursion
      if (adapter.length === 2) {
        // Adapter needs recursion capability
        return (adapter as NodeAdapterWithRecursion)(node, adaptNode);
      } else {
        // Simple adapter without recursion
        return (adapter as NodeAdapterSimple)(node);
      }
    }
    
    // Default fallback for unknown node types
    return {
      type: 'Unknown',
      position: extractPosition(node),
    };
  };
  
  return adaptNode;
}
