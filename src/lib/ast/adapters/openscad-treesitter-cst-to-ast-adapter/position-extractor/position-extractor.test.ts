import { describe, it, expect } from 'vitest';
import { extractPosition } from './position-extractor';
// Using a direct import path for the test file
import type { TreeSitterNode } from '../../../../../../src/lib/ast/types/cst-types';

describe('PositionExtractor', () => {
  it('should extract position from a tree-sitter node', () => {
    // Arrange
    const node: TreeSitterNode = {
      startPosition: { row: 1, column: 2 },
      endPosition: { row: 3, column: 4 },
    } as TreeSitterNode;

    // Act
    const position = extractPosition(node);

    // Assert
    expect(position).toEqual({
      startLine: 1,
      startColumn: 2,
      endLine: 3,
      endColumn: 4
    });
  });

  it('should handle zero-based positions', () => {
    // Arrange
    const node: TreeSitterNode = {
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 5 },
    } as TreeSitterNode;

    // Act
    const position = extractPosition(node);

    // Assert
    expect(position).toEqual({
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 5
    });
  });

  it('should handle multi-line nodes', () => {
    // Arrange
    const node: TreeSitterNode = {
      startPosition: { row: 10, column: 5 },
      endPosition: { row: 12, column: 3 },
    } as TreeSitterNode;

    // Act
    const position = extractPosition(node);

    // Assert
    expect(position).toEqual({
      startLine: 10,
      startColumn: 5,
      endLine: 12,
      endColumn: 3
    });
  });
});
