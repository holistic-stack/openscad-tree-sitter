import { describe, it, expect } from 'vitest';
import { adaptAssignment } from './assignment-adapter';
import { TreeSitterNode, ASTNode, AssignmentStatement, Expression, IdentifierExpression, LiteralExpression } from '../../../../types';

// Test utility for creating tree-sitter nodes for testing
function createTestNode(type: string, text: string = '', children: Array<{type: string, text?: string}> = []) {
  return {
    type,
    text,
    isNamed: true,
    childCount: children.length,
    child: (index: number) => {
      if (index >= 0 && index < children.length) {
        return createTestNode(children[index].type, children[index].text || '');
      }
      return null;
    },
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 10 }
  } as unknown as TreeSitterNode;
}

describe('AssignmentAdapter', () => {
  it('should adapt an assignment node with identifier and literal', () => {
    // Arrange
    const node = createTestNode('assignment', '', [
      { type: 'identifier', text: 'radius' },
      { type: '=', text: '=' },
      { type: 'number_literal', text: '5' }
    ]);
    
    // Track processed nodes for assertion
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      if (n.type === 'identifier') {
        return {
          type: 'IdentifierExpression',
          name: n.text,
          position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
        } as IdentifierExpression;
      } else if (n.type === 'number_literal') {
        return {
          type: 'LiteralExpression',
          valueType: 'number',
          value: Number(n.text),
          position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
        } as LiteralExpression;
      }
      return {
        type: 'Unknown',
        position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
      };
    };

    // Act
    const result = adaptAssignment(node, adaptNode);

    // Assert
    expect(result.type).toBe('AssignmentStatement');
    expect(result.left.type).toBe('IdentifierExpression');
    expect((result.left as IdentifierExpression).name).toBe('radius');
    expect(result.right.type).toBe('LiteralExpression');
    expect((result.right as LiteralExpression).valueType).toBe('number');
    expect((result.right as LiteralExpression).value).toBe(5);
    
    // Verify that identifier and number_literal were processed
    expect(processedNodes.includes('identifier')).toBe(true);
    expect(processedNodes.includes('number_literal')).toBe(true);
  });


  it('should handle missing left side gracefully', () => {
    // Arrange
    // In this test we create a node with only two children, where the first is the equals sign,
    // this ensures that leftNode.type !== 'identifier' condition is triggered in the adapter
    const node = createTestNode('assignment', '');
    // Override the child method to simulate a node structure with a missing left-hand side
    node.childCount = 3;
    node.child = (index: number) => {
      if (index === 0) return createTestNode('=', '=');
      if (index === 2) return createTestNode('number_literal', '5');
      return null;
    };
    
    // Track processed nodes for assertion
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      if (n.type === 'number_literal') {
        return {
          type: 'LiteralExpression',
          valueType: 'number',
          value: Number(n.text),
          position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
        } as LiteralExpression;
      }
      return {
        type: 'Unknown',
        position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
      };
    };

    // Act
    const result = adaptAssignment(node, adaptNode);

    // Assert
    expect(result.type).toBe('AssignmentStatement');
    expect(result.left.type).toBe('IdentifierExpression');
    expect((result.left as IdentifierExpression).name).toBe('unknown');
    expect(result.right.type).toBe('LiteralExpression');
    expect((result.right as LiteralExpression).valueType).toBe('number');
    expect((result.right as LiteralExpression).value).toBe(5);
  });

  it('should handle missing right side gracefully', () => {
    // Arrange
    const node = createTestNode('assignment', '', [
      { type: 'identifier', text: 'radius' },
      { type: '=', text: '=' }
    ]);
    
    // Track processed nodes for assertion
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      if (n.type === 'identifier') {
        return {
          type: 'IdentifierExpression',
          name: n.text,
          position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
        } as IdentifierExpression;
      }
      return {
        type: 'Unknown',
        position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
      };
    };

    // Act
    const result = adaptAssignment(node, adaptNode);

    // Assert
    expect(result.type).toBe('AssignmentStatement');
    expect(result.left.type).toBe('IdentifierExpression');
    expect((result.left as IdentifierExpression).name).toBe('radius');
    expect(result.right.type).toBe('LiteralExpression');
    expect((result.right as LiteralExpression).valueType).toBe('number');
    expect((result.right as LiteralExpression).value).toBe(0);
  });
});
