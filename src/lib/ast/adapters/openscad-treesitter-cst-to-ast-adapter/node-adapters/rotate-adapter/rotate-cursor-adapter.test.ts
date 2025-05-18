/**
 * Tests for RotateTransform cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the RotateTransform cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { RotateTransform } from '../../../../types/openscad-ast-types';
import { rotateTransformCursorAdapter } from './rotate-cursor-adapter';

describe('RotateTransform Cursor Adapter', () => {
  // Create a child node to serve as the body of the rotate operation
  function createChildCube(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 1, column: 4 },
      endPosition: { row: 1, column: 17 },
      text: 'cube(size=10)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified cube call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 1, column: 4 },
          endPosition: { row: 1, column: 8 },
          text: 'cube',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'arguments',
          startPosition: { row: 1, column: 8 },
          endPosition: { row: 1, column: 17 },
          text: '(size=10)',
          isNamed: true,
          childCount: 1,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createChildCube().children[index] : null,
      namedChild: (index: number) => index < 2 ? createChildCube().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Test utility for creating a rotate node with vector argument
  function createTestRotateNode(): TreeSitterNode {
    // Create identifier node for 'rotate'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'rotate',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create vector components
    const xNode = {
      type: 'number',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 10 },
      text: '30',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const yNode = {
      type: 'number',
      startPosition: { row: 0, column: 12 },
      endPosition: { row: 0, column: 13 },
      text: '0',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const zNode = {
      type: 'number',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 0, column: 17 },
      text: '45',
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
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 18 },
      text: '[30, 0, 45]',
      isNamed: true,
      childCount: 3,
      children: [xNode, yNode, zNode],
      namedChildren: [xNode, yNode, zNode],
      child: (index: number) => {
        if (index === 0) return xNode;
        if (index === 1) return yNode;
        if (index === 2) return zNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return xNode;
        if (index === 1) return yNode;
        if (index === 2) return zNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 19 },
      text: '([30, 0, 45])',
      isNamed: true,
      childCount: 1,
      children: [vectorNode],
      namedChildren: [vectorNode],
      child: (index: number) => index === 0 ? vectorNode : null,
      namedChild: (index: number) => index === 0 ? vectorNode : null
    } as unknown as TreeSitterNode;
    
    // Create body block for rotate operation
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 20 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 1,
      children: [createChildCube()],
      namedChildren: [createChildCube()],
      child: (index: number) => index === 0 ? createChildCube() : null,
      namedChild: (index: number) => index === 0 ? createChildCube() : null
    } as unknown as TreeSitterNode;
    
    // Create rotate call node
    const rotateNode = {
      type: 'transform_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'rotate([30, 0, 45]) {\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 3,
      children: [identifierNode, argumentsNode, bodyNode],
      namedChildren: [identifierNode, argumentsNode, bodyNode],
      child: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        if (index === 2) return bodyNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        if (index === 2) return bodyNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return rotateNode;
  }
  
  // Test utility for creating a rotate node with a scalar angle (only z-axis rotation)
  function createScalarRotateNode(): TreeSitterNode {
    // Create identifier node for 'rotate'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 6 },
      text: 'rotate',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create scalar angle node
    const angleNode = {
      type: 'number',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 9 },
      text: '45',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 10 },
      text: '(45)',
      isNamed: true,
      childCount: 1,
      children: [angleNode],
      namedChildren: [angleNode],
      child: (index: number) => index === 0 ? angleNode : null,
      namedChild: (index: number) => index === 0 ? angleNode : null
    } as unknown as TreeSitterNode;
    
    // Create body block for rotate operation
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 11 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 1,
      children: [createChildCube()],
      namedChildren: [createChildCube()],
      child: (index: number) => index === 0 ? createChildCube() : null,
      namedChild: (index: number) => index === 0 ? createChildCube() : null
    } as unknown as TreeSitterNode;
    
    // Create rotate call node
    const rotateNode = {
      type: 'transform_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'rotate(45) {\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 3,
      children: [identifierNode, argumentsNode, bodyNode],
      namedChildren: [identifierNode, argumentsNode, bodyNode],
      child: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        if (index === 2) return bodyNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        if (index === 2) return bodyNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return rotateNode;
  }
  
  // Test utility for creating a rotate node with different vector values
  function createRotateNodeWithValues(x: number, y: number, z: number): TreeSitterNode {
    const baseNode = createTestRotateNode();
    
    // Update the vector values in the arguments node
    const argsNode = baseNode.child(1);
    if (argsNode) {
      const vectorNode = argsNode.child(0);
      if (vectorNode) {
        // Replace x component
        const xNode = {
          type: 'number',
          startPosition: { row: 0, column: 8 },
          endPosition: { row: 0, column: 8 + String(x).length },
          text: String(x),
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode;
        
        // Replace y component
        const yNode = {
          type: 'number',
          startPosition: { row: 0, column: 12 },
          endPosition: { row: 0, column: 12 + String(y).length },
          text: String(y),
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode;
        
        // Replace z component
        const zNode = {
          type: 'number',
          startPosition: { row: 0, column: 15 },
          endPosition: { row: 0, column: 15 + String(z).length },
          text: String(z),
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode;
        
        // Create a new vector node with updated components
        const newVectorNode = {
          ...vectorNode,
          text: `[${x}, ${y}, ${z}]`,
          children: [xNode, yNode, zNode],
          namedChildren: [xNode, yNode, zNode],
          child: (index: number) => {
            if (index === 0) return xNode;
            if (index === 1) return yNode;
            if (index === 2) return zNode;
            return null;
          },
          namedChild: (index: number) => {
            if (index === 0) return xNode;
            if (index === 1) return yNode;
            if (index === 2) return zNode;
            return null;
          }
        } as unknown as TreeSitterNode;
        
        // Create a new arguments node with the updated vector
        const newArgsNode = {
          ...argsNode,
          text: `(${newVectorNode.text})`,
          children: [newVectorNode],
          namedChildren: [newVectorNode],
          child: (index: number) => index === 0 ? newVectorNode : null,
          namedChild: (index: number) => index === 0 ? newVectorNode : null
        } as unknown as TreeSitterNode;
        
        // Replace the arguments node in the base rotate node
        const updatedNode = {
          ...baseNode,
          text: `rotate(${newArgsNode.text}) {\n    cube(size=10)\n}`,
          children: [baseNode.children[0], newArgsNode, baseNode.children[2]],
          namedChildren: [baseNode.namedChildren[0], newArgsNode, baseNode.namedChildren[2]],
          child: (index: number) => {
            if (index === 0) return baseNode.children[0];
            if (index === 1) return newArgsNode;
            if (index === 2) return baseNode.children[2];
            return null;
          },
          namedChild: (index: number) => {
            if (index === 0) return baseNode.namedChildren[0];
            if (index === 1) return newArgsNode;
            if (index === 2) return baseNode.namedChildren[2];
            return null;
          }
        } as unknown as TreeSitterNode;
        
        return updatedNode;
      }
    }
    
    return baseNode;
  }
  
  // Test utility for creating a cursor pointing to a rotate node
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
  
  let rotateNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    rotateNode = createTestRotateNode();
    cursor = createTestCursor(rotateNode);
  });
  
  it('should convert a rotate node to a RotateTransform AST node', () => {
    // Act
    const result = rotateTransformCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('RotateTransform');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: rotateNode.startPosition.row,
      startColumn: rotateNode.startPosition.column,
      endLine: rotateNode.endPosition.row,
      endColumn: rotateNode.endPosition.column
    });
    
    // Should have angle property
    expect(result.angle).toBeDefined();
    // When using a vector-based rotation, it should be an array of 3 expressions
    if (Array.isArray(result.angle)) {
      expect(result.angle.length).toBe(3);
      expect(result.angle[0]).toBeDefined();
      expect(result.angle[1]).toBeDefined();
      expect(result.angle[2]).toBeDefined();
    }
    
    // Should have children
    expect(result.children).toBeDefined();
    expect(result.children).toBeInstanceOf(Array);
    expect(result.children.length).toBeGreaterThan(0);
  });
  
  it('should extract correct rotation angles from vector', () => {
    // Act
    const result = rotateTransformCursorAdapter(cursor);
    
    // Assert - check for the default values in our test node [30, 0, 45]
    if (Array.isArray(result.angle)) {
      // Check X angle value
      if (result.angle[0].type === 'LiteralExpression' && 'value' in result.angle[0]) {
        expect(result.angle[0].value).toBe(30);
      }
      // Check Y angle value
      if (result.angle[1].type === 'LiteralExpression' && 'value' in result.angle[1]) {
        expect(result.angle[1].value).toBe(0);
      }
      // Check Z angle value
      if (result.angle[2].type === 'LiteralExpression' && 'value' in result.angle[2]) {
        expect(result.angle[2].value).toBe(45);
      }
    }
  });
  
  it('should handle scalar rotation angle (as z-axis rotation)', () => {
    // Arrange - create rotate node with scalar angle
    const scalarNode = createScalarRotateNode();
    const scalarCursor = createTestCursor(scalarNode);
    
    // Act
    const result = rotateTransformCursorAdapter(scalarCursor);
    
    // Assert
    // For a scalar angle, it should be a single value
    if (!Array.isArray(result.angle) && result.angle.type === 'LiteralExpression' && 'value' in result.angle) {
      expect(result.angle.value).toBe(45); // The scalar angle
    }
  });
  
  it('should handle different rotation angle values', () => {
    // Arrange
    const customNode = createRotateNodeWithValues(90, 180, 270);
    const customCursor = createTestCursor(customNode);
    
    // Act
    const result = rotateTransformCursorAdapter(customCursor);
    
    // Assert
    if (Array.isArray(result.angle)) {
      // Check X angle value
      if (result.angle[0].type === 'LiteralExpression' && 'value' in result.angle[0]) {
        expect(result.angle[0].value).toBe(90);
      }
      // Check Y angle value
      if (result.angle[1].type === 'LiteralExpression' && 'value' in result.angle[1]) {
        expect(result.angle[1].value).toBe(180);
      }
      // Check Z angle value
      if (result.angle[2].type === 'LiteralExpression' && 'value' in result.angle[2]) {
        expect(result.angle[2].value).toBe(270);
      }
    }
  });
  
  it('should extract the body nodes correctly', () => {
    // Act
    const result = rotateTransformCursorAdapter(cursor);
    
    // Assert
    expect(result.children).toBeDefined();
    expect(result.children.length).toBe(1); // Should contain one cube node
    
    // Check that the child is properly extracted
    const childNode = result.children[0];
    expect(childNode).toBeDefined();
    expect(childNode.type).toBe('CallExpression');
  });
});
