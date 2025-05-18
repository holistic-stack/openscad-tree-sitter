import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, BlockStatement } from '../../../../types/ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter block node to an AST BlockStatement node using cursor-based traversal
 * 
 * This implementation avoids recursive traversal patterns to prevent memory leaks
 * and improve performance with large code blocks.
 * 
 * @param cursor The Tree-sitter cursor pointing to a block node
 * @returns The AST BlockStatement node
 */
export function blockStatementCursorAdapter(cursor: TreeCursor): BlockStatement {
  const node = cursor.currentNode();
  const statements: ASTNode[] = [];
  
  // Process each statement within the block
  // For the initial implementation, we'll keep this simple
  // In a full implementation, we would delegate to appropriate adapters for each child
  for (let i = 0; i < node.childCount; i++) {
    const childNode = node.child(i);
    if (childNode && childNode.isNamed) {
      try {
        // Create a simple node representation
        const childStatement: ASTNode = {
          type: childNode.type,
          position: {
            startLine: childNode.startPosition.row,
            startColumn: childNode.startPosition.column,
            endLine: childNode.endPosition.row,
            endColumn: childNode.endPosition.column
          }
        };
        statements.push(childStatement);
      } catch (error) {
        // Log the error but continue processing other statements
        console.error(`Error processing child node ${i} in block:`, error);
      }
    }
  }
  
  return {
    type: 'BlockStatement',
    statements,
    position: extractPositionFromCursor(cursor)
  };
}

// No additional helper functions needed for this simple implementation
