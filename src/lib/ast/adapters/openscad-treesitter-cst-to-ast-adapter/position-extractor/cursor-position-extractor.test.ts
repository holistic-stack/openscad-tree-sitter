import { describe, it, expect } from 'vitest';
import { TreeCursor, Point } from '../../../../types';
import { extractPositionFromCursor } from './cursor-position-extractor';
import { ASTPosition } from '../../../../types';

// Test utility for creating test cursors
function createTestCursor(
  nodeType: string = 'program',
  startPosition: Point = { row: 0, column: 0 },
  endPosition: Point = { row: 0, column: 10 }
): TreeCursor {
  return {
    nodeType,
    nodeIsNamed: true,
    nodeIsMissing: false,
    nodeId: 1,
    nodeStartPosition: startPosition,
    nodeEndPosition: endPosition,
    nodeStartIndex: 0,
    nodeEndIndex: 10,
    currentNode: () => ({
      type: nodeType,
      startPosition,
      endPosition,
      isNamed: true,
      hasError: false,
      hasChanges: false,
      isMissing: false,
      text: 'test',
      startIndex: 0,
      endIndex: 10,
      id: 1,
      childCount: 0,
      child: () => null
    } as any),
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
}

describe('Cursor Position Extractor', () => {
  it('should extract position from a tree cursor', () => {
    // Arrange
    const cursor = createTestCursor('module', { row: 1, column: 5 }, { row: 2, column: 10 });
    
    // Act 
    const position = extractPositionFromCursor(cursor);
    
    // Assert
    expect(position).toEqual({
      startLine: 1,
      startColumn: 5, 
      endLine: 2,
      endColumn: 10
    });
  });

  it('should handle cursor with zero position values', () => {
    // Arrange
    const cursor = createTestCursor('identifier', { row: 0, column: 0 }, { row: 0, column: 0 });
    
    // Act
    const position = extractPositionFromCursor(cursor);
    
    // Assert
    expect(position).toEqual({
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 0
    });
  });

  it('should handle single-line positions correctly', () => {
    // Arrange
    const cursor = createTestCursor('literal', { row: 5, column: 10 }, { row: 5, column: 20 });
    
    // Act
    const position = extractPositionFromCursor(cursor);
    
    // Assert
    expect(position).toEqual({
      startLine: 5,
      startColumn: 10,
      endLine: 5,
      endColumn: 20
    });
  });
});
