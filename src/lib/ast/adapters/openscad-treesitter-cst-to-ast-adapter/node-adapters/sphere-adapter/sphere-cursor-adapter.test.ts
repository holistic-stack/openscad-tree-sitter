/**
 * Tests for Sphere3D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Sphere3D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Sphere3D } from '../../../../types/openscad-ast-types';
import { sphereCursorAdapter } from './sphere-cursor-adapter';

describe('Sphere3D Cursor Adapter', () => {
  // Test utility for creating a sphere node with arguments
  function createTestSphereNode(): TreeSitterNode {
    // Create identifier node for 'sphere'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'sphere',
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
    
    // Create call expression node for sphere
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 12 },
      text: 'sphere(r=10)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a sphere node with other parameter combinations
  function createSphereNodeWithArgs(args: Record<string, any>): TreeSitterNode {
    // Start with a basic sphere node
    const sphereNode = createTestSphereNode();
    
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
    
    // Replace the arguments node in the sphere node
    const newSphereNode = {
      ...sphereNode,
      children: [sphereNode.children[0], argumentsNode],
      namedChildren: [sphereNode.namedChildren[0], argumentsNode],
      child: (index: number) => index === 0 ? sphereNode.children[0] : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? sphereNode.namedChildren[0] : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return newSphereNode;
  }
  
  // Test utility for creating a cursor pointing to a sphere node
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
  
  let sphereNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    sphereNode = createTestSphereNode();
    cursor = createTestCursor(sphereNode);
  });
  
  it('should convert a sphere node to a Sphere3D AST node', () => {
    // Act
    const result = sphereCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('Sphere3D');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: sphereNode.startPosition.row,
      startColumn: sphereNode.startPosition.column,
      endLine: sphereNode.endPosition.row,
      endColumn: sphereNode.endPosition.column
    });
    
    // Should extract the radius
    expect(result.radius).toBeDefined();
  });
  
  it('should handle radius parameter specified as r', () => {
    // Arrange
    const sphereWithR = createSphereNodeWithArgs({ r: 5 });
    const cursorWithR = createTestCursor(sphereWithR);
    
    // Act
    const result = sphereCursorAdapter(cursorWithR);
    
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
    // Arrange - create sphere with diameter instead of radius
    const sphereWithD = createSphereNodeWithArgs({ d: 20 });
    const cursorWithD = createTestCursor(sphereWithD);
    
    // Act
    const result = sphereCursorAdapter(cursorWithD);
    
    // Assert - should calculate radius as diameter/2
    expect(result.radius).toBeDefined();
    if (result.radius.type === 'LiteralExpression' && 
        'valueType' in result.radius && 
        'value' in result.radius) {
      expect(result.radius.valueType).toBe('number');
      expect(result.radius.value).toBe(10); // 20/2
    }
  });
  
  it('should handle $fn special variable when specified', () => {
    // Arrange - create sphere with $fn parameter
    const sphereWithFn = createSphereNodeWithArgs({ r: 10, $fn: 36 });
    const cursorWithFn = createTestCursor(sphereWithFn);
    
    // Act
    const result = sphereCursorAdapter(cursorWithFn);
    
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
    // Arrange - create sphere with multiple parameters
    const sphereWithMultiple = createSphereNodeWithArgs({ 
      r: 15, 
      $fn: 48,
      $fa: 2.5
    });
    const cursorWithMultiple = createTestCursor(sphereWithMultiple);
    
    // Act
    const result = sphereCursorAdapter(cursorWithMultiple);
    
    // Assert
    expect(result.radius).toBeDefined();
    if (result.radius.type === 'LiteralExpression' && 
        'value' in result.radius) {
      expect(result.radius.value).toBe(15);
    }
    expect(result.$fn).toBeDefined();
    expect(result.$fa).toBeDefined();
  });
});
