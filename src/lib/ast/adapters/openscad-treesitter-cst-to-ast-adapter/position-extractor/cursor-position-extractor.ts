import { TreeCursor } from '../../../../types';
import { ASTPosition } from '../../../../types';

/**
 * Extracts position information from a Tree-sitter cursor
 * and converts it to the AST position format
 * 
 * Using a cursor instead of a node directly allows for more efficient
 * traversal of large syntax trees and helps prevent memory leaks
 * by avoiding recursive traversal patterns.
 * 
 * @param cursor The Tree-sitter cursor
 * @returns The AST position
 */
export function extractPositionFromCursor(cursor: TreeCursor): ASTPosition {
  return {
    startLine: cursor.nodeStartPosition.row,
    startColumn: cursor.nodeStartPosition.column,
    endLine: cursor.nodeEndPosition.row,
    endColumn: cursor.nodeEndPosition.column
  };
}
