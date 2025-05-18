import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, BinaryExpression, Expression } from '../../../../types/ast-types';
import { binaryExpressionCursorAdapter } from './binary-expression-cursor-adapter';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

describe('Binary Expression Cursor Adapter', () => {
  // Test utility for creating a binary expression node
  function createTestBinaryExpressionNode(operator: string = '+'): TreeSitterNode {
    const leftOperand = {
      type: 'number',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 1 },
      text: '1',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null,
      toString: () => 'number'
    } as unknown as TreeSitterNode;
    
    const rightOperand = {
      type: 'number',
      startPosition: { row: 0, column: 3 },
      endPosition: { row: 0, column: 4 },
      text: '2',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null,
      toString: () => 'number'
    } as unknown as TreeSitterNode;
    
    const operatorNode = {
      type: operator,
      startPosition: { row: 0, column: 1 },
      endPosition: { row: 0, column: 2 },
      text: operator,
      isNamed: false,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null,
      toString: () => operator
    } as unknown as TreeSitterNode;
    
    const binaryExprNode = {
      type: 'binary_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 4 },
      text: `1${operator}2`,
      isNamed: true,
      childCount: 3,
      children: [leftOperand, operatorNode, rightOperand],
      namedChildren: [leftOperand, rightOperand],
      child: (index: number) => {
        if (index === 0) return leftOperand;
        if (index === 1) return operatorNode;
        if (index === 2) return rightOperand;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return leftOperand;
        if (index === 1) return rightOperand;
        return null;
      },
      toString: () => 'binary_expression'
    } as unknown as TreeSitterNode;
    
    return binaryExprNode;
  }
  
  // Test utility for creating a cursor pointing to a binary expression node
  function createTestCursor(node: TreeSitterNode): TreeCursor {
    return {
      nodeType: node.type,
      nodeIsNamed: node.isNamed,
      nodeIsMissing: false,
      nodeId: 1,
      nodeStartPosition: node.startPosition,
      nodeEndPosition: node.endPosition,
      nodeStartIndex: 0,
      nodeEndIndex: node.text.length,
      currentNode: () => node,
      currentFieldName: () => null,
      currentFieldId: () => 0,
      currentDepth: () => 0,
      gotoFirstChild: () => false,
      gotoLastChild: () => false,
      gotoNextSibling: () => false,
      gotoPreviousSibling: () => false,
      gotoParent: () => false,
      gotoFirstChildForIndex: () => false,
      gotoFirstChildForPosition: () => false,
      reset: () => {},
      copy: () => createTestCursor(node),
      delete: () => {}
    } as unknown as TreeCursor;
  }
  
  let binaryExprNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    binaryExprNode = createTestBinaryExpressionNode();
    cursor = createTestCursor(binaryExprNode);
  });
  
  it('should convert a binary expression node to a BinaryExpression AST node', () => {
    // Act
    const result = binaryExpressionCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('BinaryExpression');
    expect(result.operator).toBe('+');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: binaryExprNode.startPosition.row,
      startColumn: binaryExprNode.startPosition.column,
      endLine: binaryExprNode.endPosition.row,
      endColumn: binaryExprNode.endPosition.column
    });
    
    // Should include left and right operands
    expect(result.left).toBeDefined();
    expect(result.right).toBeDefined();
  });
  
  it('should extract the correct operator from the node', () => {
    // Arrange - Create nodes with different operators
    const operators = ['+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>=', '&&', '||'];
    
    for (const op of operators) {
      const node = createTestBinaryExpressionNode(op);
      const opCursor = createTestCursor(node);
      
      // Act
      const result = binaryExpressionCursorAdapter(opCursor);
      
      // Assert
      expect(result.operator).toBe(op);
    }
  });
  
  it('should handle operands correctly', () => {
    // Act
    const result = binaryExpressionCursorAdapter(cursor);
    
    // Assert
    expect(result.left.type).toBeDefined();
    expect(result.right.type).toBeDefined();
    
    // The operands should have proper position information
    expect(result.left.position).toBeDefined();
    expect(result.left.position.startLine).toBe(0);
    expect(result.left.position.startColumn).toBe(0);
    
    expect(result.right.position).toBeDefined();
    expect(result.right.position.startLine).toBe(0);
    expect(result.right.position.startColumn).toBe(3);
  });
});
