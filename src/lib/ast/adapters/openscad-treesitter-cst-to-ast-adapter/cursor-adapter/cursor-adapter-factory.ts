import { TreeSitterNode, SyntaxTree, TreeCursor } from '../../../types';
import { ASTNode, Program } from '../../../types/ast-types';
import { detectNodeType } from '../node-type-detector/node-type-detector';

// Type for the cursor adapter map
export type CursorAdapterMap = {
  [key: string]: (cursor: TreeCursor) => ASTNode;
};

/**
 * Creates a function that adapts a Tree-sitter syntax tree to an AST using a cursor
 * 
 * This approach offers several advantages over direct node traversal:
 * 1. More efficient memory usage - prevents recursive call stacks
 * 2. Prevents potential memory leaks with proper cursor cleanup
 * 3. Faster traversal of large syntax trees
 * 
 * @param adapterMap Map of node type strings to adapter functions
 * @returns A function that takes a syntax tree and returns an AST node
 */
export function createCursorAdapter(adapterMap: CursorAdapterMap): (tree: SyntaxTree) => ASTNode {
  return (tree: SyntaxTree): ASTNode => {
    // Create a cursor from the tree
    const cursor = tree.walk();
    
    try {
      // Detect node type of the root node
      const nodeType = detectNodeType(cursor.currentNode());
      
      // Get the appropriate adapter for this node type
      // If no adapter exists for the specific node type, use the 'Unknown' fallback adapter
      const adapter = adapterMap[nodeType] || adapterMap['Unknown'];
      
      if (!adapter) {
        throw new Error(`No adapter found for node type: ${nodeType} and no fallback adapter available.`);
      }
      
      // Initial AST node from the root
      const rootAst = adapter(cursor);
      
      // If the node type is Program, process all children
      if (nodeType === 'Program') {
        const children: ASTNode[] = [];
        
        // Get child nodes directly from the node for more reliable traversal
        const currentNode = cursor.currentNode();
        for (let i = 0; i < currentNode.childCount; i++) {
          const childNode = currentNode.child(i);
          if (childNode && childNode.isNamed) {
            // Create a new adapter for each child to ensure proper handling
            const adaptNode = createCursorAdapter(adapterMap);
            
            // Create a temporary tree with the child node as root
            const childTree = {
              rootNode: childNode,
              walk: () => {
                return {
                  nodeType: childNode.type,
                  nodeIsNamed: childNode.isNamed,
                  nodeIsMissing: childNode.isMissing || false,
                  nodeId: childNode.id || 0,
                  nodeStartPosition: childNode.startPosition,
                  nodeEndPosition: childNode.endPosition,
                  nodeStartIndex: childNode.startIndex || 0,
                  nodeEndIndex: childNode.endIndex || 0,
                  currentNode: () => childNode,
                  currentFieldName: () => null,
                  gotoFirstChild: () => false,
                  gotoLastChild: () => false,
                  gotoNextSibling: () => false,
                  gotoPreviousSibling: () => false,
                  gotoParent: () => false,
                  gotoFirstChildForIndex: () => false,
                  gotoFirstChildForPosition: () => false,
                  reset: () => {}
                } as TreeCursor;
              },
              getChangedRanges: () => [],
              getEditedRange: () => ({ 
                startPosition: childNode.startPosition,
                endPosition: childNode.endPosition,
                startIndex: childNode.startIndex || 0,
                endIndex: childNode.endIndex || 0
              }),
              getLanguage: () => ({})
            } as SyntaxTree;
            
            // Process the child node and add to children array
            const childAst = adaptNode(childTree);
            children.push(childAst);
          }
        }
        
        // Add children to the program node
        (rootAst as Program).children = children;
      }
      
      return rootAst;
    } finally {
      // Clean up cursor resources to prevent memory leaks
      // In web-tree-sitter, cursors should be deleted, but our interface might not expose this
      // If the interface has a delete method, call it, otherwise rely on garbage collection
      if (typeof (cursor as any).delete === 'function') {
        (cursor as any).delete();
      }
    }
  };
}
