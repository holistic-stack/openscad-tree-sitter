import { describe, it, expect } from 'vitest';
import { adaptLiteral } from './literal-adapter';
import { TreeSitterNode } from '../../../../../types/cst-types';
import { LiteralExpression } from '../../../../../types/ast-types';

// Instead of using mocks as they're prohibited by the requirements,
// we'll use simple stubs with the required properties

describe('LiteralAdapter', () => {
  it('should adapt a number literal', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'number_literal',
      text: '42',
      startPosition: { row: 1, column: 2 },
      endPosition: { row: 1, column: 4 }
    } as TreeSitterNode;

    // Act
    const result = adaptLiteral(node);

    // Assert
    expect(result).toEqual({
      type: 'LiteralExpression',
      valueType: 'number',
      value: 42,
      position: {
        startLine: 1,
        startColumn: 2,
        endLine: 1,
        endColumn: 4
      }
    });
  });

  it('should adapt a string literal', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'string_literal',
      text: '"hello"',
      startPosition: { row: 2, column: 3 },
      endPosition: { row: 2, column: 10 }
    } as TreeSitterNode;

    // Act
    const result = adaptLiteral(node);

    // Assert
    expect(result).toEqual({
      type: 'LiteralExpression',
      valueType: 'string',
      value: 'hello', // Without quotes
      position: {
        startLine: 2,
        startColumn: 3,
        endLine: 2,
        endColumn: 10
      }
    });
  });

  it('should adapt a boolean true literal', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'boolean_literal',
      text: 'true',
      startPosition: { row: 3, column: 4 },
      endPosition: { row: 3, column: 8 }
    } as TreeSitterNode;

    // Act
    const result = adaptLiteral(node);

    // Assert
    expect(result).toEqual({
      type: 'LiteralExpression',
      valueType: 'boolean',
      value: true,
      position: {
        startLine: 3,
        startColumn: 4,
        endLine: 3,
        endColumn: 8
      }
    });
  });

  it('should adapt a boolean false literal', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'boolean_literal',
      text: 'false',
      startPosition: { row: 4, column: 5 },
      endPosition: { row: 4, column: 10 }
    } as TreeSitterNode;

    // Act
    const result = adaptLiteral(node);

    // Assert
    expect(result).toEqual({
      type: 'LiteralExpression',
      valueType: 'boolean',
      value: false,
      position: {
        startLine: 4,
        startColumn: 5,
        endLine: 4,
        endColumn: 10
      }
    });
  });

  it('should handle decimal numbers', () => {
    // Arrange
    const node: TreeSitterNode = {
      type: 'number_literal',
      text: '3.14',
      startPosition: { row: 5, column: 6 },
      endPosition: { row: 5, column: 10 }
    } as TreeSitterNode;

    // Act
    const result = adaptLiteral(node);

    // Assert
    expect(result).toEqual({
      type: 'LiteralExpression',
      valueType: 'number',
      value: 3.14,
      position: {
        startLine: 5,
        startColumn: 6,
        endLine: 5,
        endColumn: 10
      }
    });
  });
});
