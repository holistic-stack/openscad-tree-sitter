/**
 * Tests for Circle2D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Circle2D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Circle2D } from '../../../../types/openscad-ast-types';
import { circleCursorAdapter } from './circle-cursor-adapter';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

describe('Circle2D Cursor Adapter', () => {
  // Test utility for creating a circle node with arguments
  function createTestCircleNode(): TreeSitterNode {
    // Create identifier node for 'circle'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'circle',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create radius argument node
    const radiusArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 11 },
      text: 'r=10',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 8 },
          text: 'r',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 9 },
          endPosition: { row: 0, column: 11 },
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
      child: (index: number) => index < 2 ? radiusArgNode.children[index] : null,
      namedChild: (index: number) => index < 2 ? radiusArgNode.children[index] : null
    } as unknown as TreeSitterNode;
    radiusArgNode.namedChildren = radiusArgNode.children;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 12 },
      text: '(r=10)',
      isNamed: true,
      childCount: 1,
      children: [radiusArgNode],
      namedChildren: [radiusArgNode],
      child: (index: number) => index === 0 ? radiusArgNode : null,
      namedChild: (index: number) => index === 0 ? radiusArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for circle
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 12 },
      text: 'circle(r=10)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a circle node with other parameter combinations
  function createCircleNodeWithArgs(args: Record<string, any>): TreeSitterNode {
    // Start with a basic circle node
    const circleNode = createTestCircleNode();
    
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
    
    // Replace the arguments node in the circle node
    const newCircleNode = {
      ...circleNode,
      children: [circleNode.children[0], argumentsNode],
      namedChildren: [circleNode.namedChildren[0], argumentsNode],
      child: (index: number) => index === 0 ? circleNode.children[0] : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? circleNode.namedChildren[0] : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return newCircleNode;
  }
  
  // Test utility for creating a cursor pointing to a circle node
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
  
  let circleNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    circleNode = createTestCircleNode();
    cursor = createTestCursor(circleNode);
  });
  
  it('should convert a circle node to a Circle2D AST node', () => {
    // Act
    const result = circleCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('Circle2D');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: circleNode.startPosition.row,
      startColumn: circleNode.startPosition.column,
      endLine: circleNode.endPosition.row,
      endColumn: circleNode.endPosition.column
    });
    
    // Should extract the radius
    expect(result.radius).toBeDefined();
    expect(result.radius.type).toBe('LiteralExpression');
  });
  
  it('should handle radius parameter specified as r', () => {
    // Arrange
    const circleWithR = createCircleNodeWithArgs({ r: 5 });
    const cursorWithR = createTestCursor(circleWithR);
    
    // Act
    const result = circleCursorAdapter(cursorWithR);
    
    // Assert
    expect(result.radius).toBeDefined();
    if (result.radius.type === 'LiteralExpression' && 
        'valueType' in result.radius && 
        'value' in result.radius) {
      expect(result.radius.valueType).toBe('number');
      expect(result.radius.value).toBe(5);
    }
  });
  
  it('should handle diameter parameter specified as d', () => {
    // Arrange - create circle with diameter instead of radius
    const circleWithD = createCircleNodeWithArgs({ d: 10 });
    const cursorWithD = createTestCursor(circleWithD);
    
    // Act
    const result = circleCursorAdapter(cursorWithD);
    
    // Assert - should calculate radius as diameter/2
    expect(result.radius).toBeDefined();
    if (result.radius.type === 'LiteralExpression' && 
        'valueType' in result.radius && 
        'value' in result.radius) {
      expect(result.radius.valueType).toBe('number');
      expect(result.radius.value).toBe(5); // 10/2
    }
  });
  
  it('should handle center parameter when specified', () => {
    // Arrange - create circle with center parameter
    const circleWithCenter = createCircleNodeWithArgs({ r: 10, center: true });
    const cursorWithCenter = createTestCursor(circleWithCenter);
    
    // Act
    const result = circleCursorAdapter(cursorWithCenter);
    
    // Assert
    expect(result.center).toBe(true);
  });
  
  it('should handle $fn special variable when specified', () => {
    // Arrange - create circle with $fn parameter
    const circleWithFn = createCircleNodeWithArgs({ r: 10, $fn: 36 });
    const cursorWithFn = createTestCursor(circleWithFn);
    
    // Act
    const result = circleCursorAdapter(cursorWithFn);
    
    // Assert
    expect(result.$fn).toBeDefined();
    if (result.$fn && result.$fn.type === 'LiteralExpression' && 
        'valueType' in result.$fn && 
        'value' in result.$fn) {
      expect(result.$fn.valueType).toBe('number');
      expect(result.$fn.value).toBe(36);
    }
  });
  
  it('should handle multiple parameters together', () => {
    // Arrange - create circle with multiple parameters
    const circleWithMultiple = createCircleNodeWithArgs({ 
      r: 15, 
      center: false,
      $fn: 48,
      $fa: 2.5
    });
    const cursorWithMultiple = createTestCursor(circleWithMultiple);
    
    // Act
    const result = circleCursorAdapter(cursorWithMultiple);
    
    // Assert
    expect(result.radius).toBeDefined();
    if (result.radius.type === 'LiteralExpression' && 
        'value' in result.radius) {
      expect(result.radius.value).toBe(15);
    }
    expect(result.center).toBe(false);
    expect(result.$fn).toBeDefined();
    expect(result.$fa).toBeDefined();
  });
});
