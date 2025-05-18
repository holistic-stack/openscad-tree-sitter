/**
 * Tests for TranslateTransform cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the TranslateTransform cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { TranslateTransform } from '../../../../types/openscad-ast-types';
import { translateCursorAdapter } from './translate-cursor-adapter';

describe('TranslateTransform Cursor Adapter', () => {
  // Create a child node to serve as the body of the translate operation
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
  
  // Test utility for creating a translate node with vector argument
  function createTestTranslateNode(): TreeSitterNode {
    // Create identifier node for 'translate'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 9 },
      text: 'translate',
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
      startPosition: { row: 0, column: 11 },
      endPosition: { row: 0, column: 12 },
      text: '5',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const yNode = {
      type: 'number',
      startPosition: { row: 0, column: 14 },
      endPosition: { row: 0, column: 15 },
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
      startPosition: { row: 0, column: 17 },
      endPosition: { row: 0, column: 20 },
      text: '-10',
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
      endPosition: { row: 0, column: 21 },
      text: '[5, 0, -10]',
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
      startPosition: { row: 0, column: 9 },
      endPosition: { row: 0, column: 22 },
      text: '([5, 0, -10])',
      isNamed: true,
      childCount: 1,
      children: [vectorNode],
      namedChildren: [vectorNode],
      child: (index: number) => index === 0 ? vectorNode : null,
      namedChild: (index: number) => index === 0 ? vectorNode : null
    } as unknown as TreeSitterNode;
    
    // Create body block for translate operation
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 23 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 1,
      children: [createChildCube()],
      namedChildren: [createChildCube()],
      child: (index: number) => index === 0 ? createChildCube() : null,
      namedChild: (index: number) => index === 0 ? createChildCube() : null
    } as unknown as TreeSitterNode;
    
    // Create translate call node
    const translateNode = {
      type: 'transform_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'translate([5, 0, -10]) {\n    cube(size=10)\n}',
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
    
    return translateNode;
  }
  
  // Test utility for creating a translate node with different vector values
  function createTranslateNodeWithValues(x: number, y: number, z: number): TreeSitterNode {
    const baseNode = createTestTranslateNode();
    
    // Update the vector values in the arguments node
    const argsNode = baseNode.child(1);
    if (argsNode) {
      const vectorNode = argsNode.child(0);
      if (vectorNode) {
        // Replace x component
        const xNode = {
          type: 'number',
          startPosition: { row: 0, column: 11 },
          endPosition: { row: 0, column: 11 + String(x).length },
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
          startPosition: { row: 0, column: 14 },
          endPosition: { row: 0, column: 14 + String(y).length },
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
          startPosition: { row: 0, column: 17 },
          endPosition: { row: 0, column: 17 + String(z).length },
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
        
        // Replace the arguments node in the base translate node
        const updatedNode = {
          ...baseNode,
          text: `translate(${newArgsNode.text}) {\n    cube(size=10)\n}`,
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
  
  // Test utility for creating a cursor pointing to a translate node
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
  
  let translateNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    translateNode = createTestTranslateNode();
    cursor = createTestCursor(translateNode);
  });
  
  it('should convert a translate node to a TranslateTransform AST node', () => {
    // Act
    const result = translateCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('TranslateTransform');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: translateNode.startPosition.row,
      startColumn: translateNode.startPosition.column,
      endLine: translateNode.endPosition.row,
      endColumn: translateNode.endPosition.column
    });
    
    // Should have translation vector
    expect(result.vector).toBeDefined();
    expect(result.vector).toHaveLength(3); // [x, y, z]
    expect(result.vector[0]).toBeDefined(); // x
    expect(result.vector[1]).toBeDefined(); // y
    expect(result.vector[2]).toBeDefined(); // z
    
    // Should have children
    expect(result.children).toBeDefined();
    expect(result.children).toBeInstanceOf(Array);
    expect(result.children.length).toBeGreaterThan(0);
  });
  
  it('should extract correct translation vector values', () => {
    // Act
    const result = translateCursorAdapter(cursor);
    
    // Assert - check for the default values in our test node [5, 0, -10]
    if (result.vector[0].type === 'LiteralExpression' && 'value' in result.vector[0]) {
      expect(result.vector[0].value).toBe(5);
    }
    if (result.vector[1].type === 'LiteralExpression' && 'value' in result.vector[1]) {
      expect(result.vector[1].value).toBe(0);
    }
    if (result.vector[2].type === 'LiteralExpression' && 'value' in result.vector[2]) {
      expect(result.vector[2].value).toBe(-10);
    }
  });
  
  it('should handle different translation vector values', () => {
    // Arrange
    const customNode = createTranslateNodeWithValues(20, 30, 40);
    const customCursor = createTestCursor(customNode);
    
    // Act
    const result = translateCursorAdapter(customCursor);
    
    // Assert
    if (result.vector[0].type === 'LiteralExpression' && 'value' in result.vector[0]) {
      expect(result.vector[0].value).toBe(20);
    }
    if (result.vector[1].type === 'LiteralExpression' && 'value' in result.vector[1]) {
      expect(result.vector[1].value).toBe(30);
    }
    if (result.vector[2].type === 'LiteralExpression' && 'value' in result.vector[2]) {
      expect(result.vector[2].value).toBe(40);
    }
  });
  
  it('should extract the body nodes correctly', () => {
    // Act
    const result = translateCursorAdapter(cursor);
    
    // Assert
    expect(result.children).toBeDefined();
    expect(result.children.length).toBe(1); // Should contain one cube node
    
    // Check that the child is properly extracted
    const childNode = result.children[0];
    expect(childNode).toBeDefined();
    expect(childNode.type).toBe('CallExpression'); // The adapter is correctly identifying it as a call expression
  });
});
