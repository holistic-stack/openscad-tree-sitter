/**
 * Tests for Cube3D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Cube3D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Cube3D } from '../../../../types/openscad-ast-types';
import { cubeCursorAdapter } from './cube-cursor-adapter';

describe('Cube3D Cursor Adapter', () => {
  // Test utility for creating a cube node with arguments
  function createTestCubeNode(): TreeSitterNode {
    // Create identifier node for 'cube'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 4 },
      text: 'cube',
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
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 12 },
      text: 'size=10',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 5 },
          endPosition: { row: 0, column: 9 },
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
          startPosition: { row: 0, column: 10 },
          endPosition: { row: 0, column: 12 },
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
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 13 },
      text: '(size=10)',
      isNamed: true,
      childCount: 1,
      children: [sizeArgNode],
      namedChildren: [sizeArgNode],
      child: (index: number) => index === 0 ? sizeArgNode : null,
      namedChild: (index: number) => index === 0 ? sizeArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for cube
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 13 },
      text: 'cube(size=10)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a cube node with vector size argument
  function createCubeNodeWithVectorSize(): TreeSitterNode {
    // Create identifier node for 'cube'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 4 },
      text: 'cube',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create dimensions nodes
    const xDimNode = {
      type: 'number',
      startPosition: { row: 0, column: 11 },
      endPosition: { row: 0, column: 13 },
      text: '10',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const yDimNode = {
      type: 'number',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 0, column: 17 },
      text: '20',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const zDimNode = {
      type: 'number',
      startPosition: { row: 0, column: 19 },
      endPosition: { row: 0, column: 21 },
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
      startPosition: { row: 0, column: 10 },
      endPosition: { row: 0, column: 22 },
      text: '[10, 20, 30]',
      isNamed: true,
      childCount: 3,
      children: [xDimNode, yDimNode, zDimNode],
      namedChildren: [xDimNode, yDimNode, zDimNode],
      child: (index: number) => {
        if (index === 0) return xDimNode;
        if (index === 1) return yDimNode;
        if (index === 2) return zDimNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return xDimNode;
        if (index === 1) return yDimNode;
        if (index === 2) return zDimNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create size argument node
    const sizeArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 22 },
      text: 'size=[10, 20, 30]',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 5 },
          endPosition: { row: 0, column: 9 },
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
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 23 },
      text: '(size=[10, 20, 30])',
      isNamed: true,
      childCount: 1,
      children: [sizeArgNode],
      namedChildren: [sizeArgNode],
      child: (index: number) => index === 0 ? sizeArgNode : null,
      namedChild: (index: number) => index === 0 ? sizeArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for cube
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 23 },
      text: 'cube(size=[10, 20, 30])',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a cube node with other parameter combinations
  function createCubeNodeWithArgs(args: Record<string, any>): TreeSitterNode {
    // Start with a basic cube node
    const cubeNode = createTestCubeNode();
    
    // Replace the arguments node with custom arguments
    const argNodes: TreeSitterNode[] = [];
    
    // Create argument nodes for each key-value pair
    Object.entries(args).forEach(([key, value], index) => {
      const valueType = typeof value === 'number' ? 'number' : 
                       typeof value === 'boolean' ? (value ? 'true' : 'false') : 'string';
      const valueText = typeof value === 'string' ? `"${value}"` : String(value);
      
      const keyNode = {
        type: 'identifier',
        startPosition: { row: 0, column: 5 + index * 10 },
        endPosition: { row: 0, column: 5 + index * 10 + key.length },
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
        startPosition: { row: 0, column: 5 + index * 10 + key.length + 1 },
        endPosition: { row: 0, column: 5 + index * 10 + key.length + 1 + valueText.length },
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
        startPosition: { row: 0, column: 5 + index * 10 },
        endPosition: { row: 0, column: 5 + index * 10 + key.length + 1 + valueText.length },
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
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 4 + argsText.length },
      text: argsText,
      isNamed: true,
      childCount: argNodes.length,
      children: argNodes,
      namedChildren: argNodes,
      child: (index: number) => index < argNodes.length ? argNodes[index] : null,
      namedChild: (index: number) => index < argNodes.length ? argNodes[index] : null
    } as unknown as TreeSitterNode;
    
    // Replace the arguments node in the cube node
    const newCubeNode = {
      ...cubeNode,
      children: [cubeNode.children[0], argumentsNode],
      namedChildren: [cubeNode.namedChildren[0], argumentsNode],
      child: (index: number) => index === 0 ? cubeNode.children[0] : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? cubeNode.namedChildren[0] : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return newCubeNode;
  }
  
  // Test utility for creating a cursor pointing to a cube node
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
  
  let cubeNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    cubeNode = createTestCubeNode();
    cursor = createTestCursor(cubeNode);
  });
  
  it('should convert a cube node to a Cube3D AST node', () => {
    // Act
    const result = cubeCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('Cube3D');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: cubeNode.startPosition.row,
      startColumn: cubeNode.startPosition.column,
      endLine: cubeNode.endPosition.row,
      endColumn: cubeNode.endPosition.column
    });
    
    // Should extract the size
    expect(result.size).toBeDefined();
  });
  
  it('should handle single value size parameter', () => {
    // Arrange - use default cube node which has size=10
    
    // Act
    const result = cubeCursorAdapter(cursor);
    
    // Assert
    expect(result.size).toBeDefined();
    if ('x' in result.size && 'y' in result.size && 'z' in result.size) {
      // Should have all dimensions equal to the single value
      if (result.size.x.type === 'LiteralExpression' && 'value' in result.size.x) {
        expect(result.size.x.value).toBe(10);
      }
      if (result.size.y.type === 'LiteralExpression' && 'value' in result.size.y) {
        expect(result.size.y.value).toBe(10);
      }
      if (result.size.z.type === 'LiteralExpression' && 'value' in result.size.z) {
        expect(result.size.z.value).toBe(10);
      }
    }
  });
  
  it('should handle vector size parameter', () => {
    // Arrange
    const cubeWithVectorSize = createCubeNodeWithVectorSize();
    const cursorWithVectorSize = createTestCursor(cubeWithVectorSize);
    
    // Act
    const result = cubeCursorAdapter(cursorWithVectorSize);
    
    // Assert
    expect(result.size).toBeDefined();
    if ('x' in result.size && 'y' in result.size && 'z' in result.size) {
      // Should have different x, y, and z values as specified in the vector
      if (result.size.x.type === 'LiteralExpression' && 'value' in result.size.x) {
        expect(result.size.x.value).toBe(10);
      }
      if (result.size.y.type === 'LiteralExpression' && 'value' in result.size.y) {
        expect(result.size.y.value).toBe(20);
      }
      if (result.size.z.type === 'LiteralExpression' && 'value' in result.size.z) {
        expect(result.size.z.value).toBe(30);
      }
    }
  });
  
  it('should handle center parameter when specified', () => {
    // Arrange
    const cubeWithCenter = createCubeNodeWithArgs({ size: 10, center: true });
    const cursorWithCenter = createTestCursor(cubeWithCenter);
    
    // Act
    const result = cubeCursorAdapter(cursorWithCenter);
    
    // Assert
    expect(result.center).toBe(true);
  });
  
  it('should default center parameter to false when not specified', () => {
    // Arrange - using default cube node
    
    // Act
    const result = cubeCursorAdapter(cursor);
    
    // Assert
    expect(result.center).toBe(false);
  });
});
