import { describe, it, expect } from 'vitest';
import { adaptCallExpression } from './call-expression-adapter';
import { TreeSitterNode, ASTNode, CallExpression, Expression, IdentifierExpression, LiteralExpression } from '../../../../types';
import { extractPosition } from '../../utils';

// Test utility for creating tree-sitter nodes for testing
function createTestNode(type: string, text: string = '', children: Array<{type: string, text?: string, isNamed?: boolean, children?: Array<{type: string, text?: string, isNamed?: boolean}>}> = []) {
  return {
    type,
    text,
    isNamed: true,
    childCount: children.length,
    child: (index: number) => {
      if (index >= 0 && index < children.length) {
        const child = children[index];
        return {
          type: child.type,
          text: child.text || '',
          isNamed: child.isNamed !== undefined ? child.isNamed : true,
          childCount: child.children ? child.children.length : 0,
          child: (childIndex: number) => {
            if (child.children && childIndex >= 0 && childIndex < child.children.length) {
              const grandchild = child.children[childIndex];
              return {
                type: grandchild.type,
                text: grandchild.text || '',
                isNamed: grandchild.isNamed !== undefined ? grandchild.isNamed : true,
                childCount: 0,
                child: () => null,
                startPosition: { row: 0, column: 0 },
                endPosition: { row: 0, column: 10 }
              } as unknown as TreeSitterNode;
            }
            return null;
          },
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 10 }
        } as unknown as TreeSitterNode;
      }
      return null;
    },
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 10 }
  } as unknown as TreeSitterNode;
}

describe('CallExpressionAdapter', () => {
  it('should adapt a call expression with no arguments', () => {
    // Arrange
    const node = createTestNode('call_expression', '', [
      { type: 'identifier', text: 'cube' },
      { 
        type: 'argument_list', 
        children: [
          { type: '(', isNamed: false },
          { type: ')', isNamed: false }
        ]
      }
    ]);
    
    // Track processed nodes for verification
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
    const result = adaptCallExpression(node, adaptNode);

    // Assert
    expect(result.type).toBe('CallExpression');
    expect(result.callee.type).toBe('IdentifierExpression');
    expect((result.callee as IdentifierExpression).name).toBe('cube');
    expect(result.arguments).toEqual([]);
    
    // Verify the right nodes were processed
    expect(processedNodes.includes('identifier')).toBe(true);
  });

  it('should adapt a call expression with arguments', () => {
    // Arrange
    const node = createTestNode('call_expression', '', [
      { type: 'identifier', text: 'translate' },
      { 
        type: 'argument_list', 
        children: [
          { type: '(', isNamed: false },
          { type: 'number_literal', text: '10', isNamed: true },
          { type: ',', isNamed: false },
          { type: 'number_literal', text: '20', isNamed: true },
          { type: ')', isNamed: false }
        ]
      }
    ]);
    
    // Track processed nodes for verification
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
    const result = adaptCallExpression(node, adaptNode);

    // Assert
    expect(result.type).toBe('CallExpression');
    expect(result.callee.type).toBe('IdentifierExpression');
    expect((result.callee as IdentifierExpression).name).toBe('translate');
    expect(result.arguments.length).toBe(2);
    expect((result.arguments[0] as LiteralExpression).value).toBe(10);
    expect((result.arguments[1] as LiteralExpression).value).toBe(20);
    
    // Verify the right nodes were processed
    expect(processedNodes.includes('identifier')).toBe(true);
    expect(processedNodes.includes('number_literal')).toBe(true);
  });

  it('should handle missing callee gracefully', () => {
    // Arrange
    const node = createTestNode('call_expression');
    
    // Simple adapter that does nothing with nodes
    const adaptNode = (n: TreeSitterNode): ASTNode => ({
      type: 'Unknown',
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
    });

    // Act
    const result = adaptCallExpression(node, adaptNode);

    // Assert
    expect(result.type).toBe('CallExpression');
    expect(result.callee.type).toBe('IdentifierExpression');
    expect((result.callee as IdentifierExpression).name).toBe('unknown');
    expect(result.arguments).toEqual([]);
  });
});
