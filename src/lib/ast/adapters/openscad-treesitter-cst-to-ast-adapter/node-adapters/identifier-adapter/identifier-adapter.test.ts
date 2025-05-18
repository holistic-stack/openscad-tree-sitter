import { describe, it, expect } from 'vitest';
import { adaptIdentifier } from './identifier-adapter';
import { TreeSitterNode } from '../../../../../types/cst-types';
import { IdentifierExpression } from '../../../../../types/ast-types';

describe('IdentifierAdapter', () => {
  it('should adapt an identifier node', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'identifier',
      text: 'variableName',
      startPosition: { row: 1, column: 2 },
      endPosition: { row: 1, column: 13 }
    } as TreeSitterNode;

    // Act
    const result = adaptIdentifier(node);

    // Assert
    expect(result).toEqual({
      type: 'IdentifierExpression',
      name: 'variableName',
      position: {
        startLine: 1,
        startColumn: 2,
        endLine: 1,
        endColumn: 13
      }
    });
  });

  it('should handle empty identifier names', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'identifier',
      text: '',
      startPosition: { row: 2, column: 3 },
      endPosition: { row: 2, column: 3 }
    } as TreeSitterNode;

    // Act
    const result = adaptIdentifier(node);

    // Assert
    expect(result).toEqual({
      type: 'IdentifierExpression',
      name: '',
      position: {
        startLine: 2,
        startColumn: 3,
        endLine: 2,
        endColumn: 3
      }
    });
  });

  it('should preserve special characters in identifiers', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'identifier',
      text: '$special_var42',
      startPosition: { row: 3, column: 4 },
      endPosition: { row: 3, column: 17 }
    } as TreeSitterNode;

    // Act
    const result = adaptIdentifier(node);

    // Assert
    expect(result).toEqual({
      type: 'IdentifierExpression',
      name: '$special_var42',
      position: {
        startLine: 3,
        startColumn: 4,
        endLine: 3,
        endColumn: 17
      }
    });
  });
});
