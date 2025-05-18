/**
 * Tests for Square2D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Square2D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Square2D } from '../../../../types/openscad-ast-types';
import { squareCursorAdapter } from './square-cursor-adapter';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

describe('Square2D Cursor Adapter', () => {
  // Test utility for creating a square node with arguments
  function createTestSquareNode(): TreeSitterNode {
    // Create identifier node for 'square'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'square',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create size argument node
    const sizeArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 14 },
      text: 'size=10',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 11 },
          text: 'size',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 12 },
          endPosition: { row: 0, column: 14 },
          text: '10',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? sizeArgNode.children[index] : null,
      namedChild: (index: number) => index < 2 ? sizeArgNode.children[index] : null
    } as unknown as TreeSitterNode;
    sizeArgNode.namedChildren = sizeArgNode.children;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 15 },
      text: '(size=10)',
      isNamed: true,
      childCount: 1,
      children: [sizeArgNode],
      namedChildren: [sizeArgNode],
      child: (index: number) => index === 0 ? sizeArgNode : null,
      namedChild: (index: number) => index === 0 ? sizeArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for square
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 15 },
      text: 'square(size=10)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a square node with vector size argument
  function createSquareNodeWithVectorSize(): TreeSitterNode {
    // Create identifier node for 'square'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'square',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create x dimension node
    const xDimNode = {
      type: 'number',
      startPosition: { row: 0, column: 13 },
      endPosition: { row: 0, column: 15 },
      text: '20',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create y dimension node
    const yDimNode = {
      type: 'number',
      startPosition: { row: 0, column: 17 },
      endPosition: { row: 0, column: 19 },
      text: '30',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create vector expression node
    const vectorNode = {
      type: 'vector_expression',
      startPosition: { row: 0, column: 12 },
      endPosition: { row: 0, column: 20 },
      text: '[20, 30]',
      isNamed: true,
      childCount: 2,
      children: [xDimNode, yDimNode],
      namedChildren: [xDimNode, yDimNode],
      child: (index: number) => index === 0 ? xDimNode : index === 1 ? yDimNode : null,
      namedChild: (index: number) => index === 0 ? xDimNode : index === 1 ? yDimNode : null
    } as unknown as TreeSitterNode;
    
    // Create size argument node
    const sizeArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 20 },
      text: 'size=[20, 30]',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 11 },
          text: 'size',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        vectorNode
      ],
      namedChildren: [],
      child: (index: number) => index === 0 ? sizeArgNode.children[0] : index === 1 ? vectorNode : null,
      namedChild: (index: number) => index === 0 ? sizeArgNode.children[0] : index === 1 ? vectorNode : null
    } as unknown as TreeSitterNode;
    sizeArgNode.namedChildren = sizeArgNode.children;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 21 },
      text: '(size=[20, 30])',
      isNamed: true,
      childCount: 1,
      children: [sizeArgNode],
      namedChildren: [sizeArgNode],
      child: (index: number) => index === 0 ? sizeArgNode : null,
      namedChild: (index: number) => index === 0 ? sizeArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for square
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 21 },
      text: 'square(size=[20, 30])',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a square node with other parameter combinations
  function createSquareNodeWithArgs(args: Record<string, any>): TreeSitterNode {
    // Start with a basic square node
    const squareNode = createTestSquareNode();
    
    // Replace the arguments node with custom arguments
    const argNodes: TreeSitterNode[] = [];
    
    // Create argument nodes for each key-value pair
    Object.entries(args).forEach(([key, value], index) => {
      const valueType = typeof value === 'number' ? 'number' : 
                       typeof value === 'boolean' ? (value ? 'true' : 'false') : 'string';
      const valueText = typeof value === 'string' ? `"${value}"` : String(value);
      
      const keyNode = {
        type: 'identifier',
        startPosition: { row: 0, column: 7 + index * 10 },
        endPosition: { row: 0, column: 7 + index * 10 + key.length },
        text: key,
        isNamed: true,
        childCount: 0,
        children: [],
        namedChildren: [],
        child: () => null,
        namedChild: () => null
      } as unknown as TreeSitterNode;
      
      const valueNode = {
        type: valueType,
        startPosition: { row: 0, column: 7 + index * 10 + key.length + 1 },
        endPosition: { row: 0, column: 7 + index * 10 + key.length + 1 + valueText.length },
        text: valueText,
        isNamed: true,
        childCount: 0,
        children: [],
        namedChildren: [],
        child: () => null,
        namedChild: () => null
      } as unknown as TreeSitterNode;
      
      const argNode = {
        type: 'argument',
        startPosition: { row: 0, column: 7 + index * 10 },
        endPosition: { row: 0, column: 7 + index * 10 + key.length + 1 + valueText.length },
        text: `${key}=${valueText}`,
        isNamed: true,
        childCount: 2,
        children: [keyNode, valueNode],
        namedChildren: [keyNode, valueNode],
        child: (idx: number) => idx === 0 ? keyNode : idx === 1 ? valueNode : null,
        namedChild: (idx: number) => idx === 0 ? keyNode : idx === 1 ? valueNode : null
      } as unknown as TreeSitterNode;
      
      argNodes.push(argNode);
    });
    
    // Create a new arguments node with custom arguments
    const argsText = `(${argNodes.map(n => n.text).join(', ')})`;
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 6 + argsText.length },
      text: argsText,
      isNamed: true,
      childCount: argNodes.length,
      children: argNodes,
      namedChildren: argNodes,
      child: (index: number) => index < argNodes.length ? argNodes[index] : null,
      namedChild: (index: number) => index < argNodes.length ? argNodes[index] : null
    } as unknown as TreeSitterNode;
    
    // Replace the arguments node in the square node
    const newSquareNode = {
      ...squareNode,
      children: [squareNode.children[0], argumentsNode],
      namedChildren: [squareNode.namedChildren[0], argumentsNode],
      child: (index: number) => index === 0 ? squareNode.children[0] : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? squareNode.namedChildren[0] : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return newSquareNode;
  }
  
  // Test utility for creating a cursor pointing to a square node
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
  
  let squareNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    squareNode = createTestSquareNode();
    cursor = createTestCursor(squareNode);
  });
  
  it('should convert a square node to a Square2D AST node', () => {
    // Act
    const result = squareCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('Square2D');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: squareNode.startPosition.row,
      startColumn: squareNode.startPosition.column,
      endLine: squareNode.endPosition.row,
      endColumn: squareNode.endPosition.column
    });
    
    // Should extract the size
    expect(result.size).toBeDefined();
  });
  
  it('should handle single value size parameter', () => {
    // Arrange
    const squareWithSingleSize = createSquareNodeWithArgs({ size: 15 });
    const cursorWithSingleSize = createTestCursor(squareWithSingleSize);
    
    // Act
    const result = squareCursorAdapter(cursorWithSingleSize);
    
    // Assert
    expect(result.size).toBeDefined();
    if (result.size && 'x' in result.size && 'y' in result.size) {
      // Should have both dimensions equal to the single value
      const xExpr = result.size.x;
      const yExpr = result.size.y;
      
      if (xExpr && xExpr.type === 'LiteralExpression' && 'value' in xExpr) {
        expect(xExpr.value).toBe(15);
      }
      
      if (yExpr && yExpr.type === 'LiteralExpression' && 'value' in yExpr) {
        expect(yExpr.value).toBe(15);
      }
    }
  });
  
  it('should handle vector size parameter', () => {
    // Arrange
    const squareWithVectorSize = createSquareNodeWithVectorSize();
    const cursorWithVectorSize = createTestCursor(squareWithVectorSize);
    
    // Act
    const result = squareCursorAdapter(cursorWithVectorSize);
    
    // Assert
    expect(result.size).toBeDefined();
    if (result.size && 'x' in result.size && 'y' in result.size) {
      // Should have different x and y values as specified in the vector
      const xExpr = result.size.x;
      const yExpr = result.size.y;
      
      if (xExpr && xExpr.type === 'LiteralExpression' && 'value' in xExpr) {
        expect(xExpr.value).toBe(20);
      }
      
      if (yExpr && yExpr.type === 'LiteralExpression' && 'value' in yExpr) {
        expect(yExpr.value).toBe(30);
      }
    }
  });
  
  it('should handle center parameter when specified', () => {
    // Arrange
    const squareWithCenter = createSquareNodeWithArgs({ size: 10, center: true });
    const cursorWithCenter = createTestCursor(squareWithCenter);
    
    // Act
    const result = squareCursorAdapter(cursorWithCenter);
    
    // Assert
    expect(result.center).toBe(true);
  });
  
  it('should default center parameter to false when not specified', () => {
    // Arrange - using default square node
    
    // Act
    const result = squareCursorAdapter(cursor);
    
    // Assert
    expect(result.center).toBe(false);
  });
});
