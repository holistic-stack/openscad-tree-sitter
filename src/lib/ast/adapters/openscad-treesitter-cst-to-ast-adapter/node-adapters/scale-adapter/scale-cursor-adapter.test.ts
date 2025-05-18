/**
 * Tests for ScaleTransform cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the ScaleTransform cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ScaleTransform } from '../../../../types/openscad-ast-types';
import { scaleCursorAdapter } from './scale-cursor-adapter';

describe('ScaleTransform Cursor Adapter', () => {
  // Create a test scale node with vector [2, 3, 4]
  function createVectorScaleNode(): TreeSitterNode {
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 5 },
      text: 'scale',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create vector literal for scale
    const vectorNode = {
      type: 'vector_literal',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 13 },
      text: '[2,3,4]',
      isNamed: true,
      childCount: 3,
      children: [
        {
          type: 'number_literal',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 8 },
          text: '2',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number_literal',
          startPosition: { row: 0, column: 9 },
          endPosition: { row: 0, column: 10 },
          text: '3',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number_literal',
          startPosition: { row: 0, column: 11 },
          endPosition: { row: 0, column: 12 },
          text: '4',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [
        // Same number literals as above
      ],
      child: (index: number) => index < 3 ? vectorNode.children[index] : null,
      namedChild: (index: number) => index < 3 ? vectorNode.children[index] : null
    } as unknown as TreeSitterNode;
    
    // Copy number literal nodes to namedChildren
    vectorNode.namedChildren = [...vectorNode.children];
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 14 },
      text: '([2,3,4])',
      isNamed: true,
      childCount: 1,
      children: [vectorNode],
      namedChildren: [vectorNode],
      child: (index: number) => index === 0 ? vectorNode : null,
      namedChild: (index: number) => index === 0 ? vectorNode : null
    } as unknown as TreeSitterNode;
    
    // Create cube for the body
    const cubeNode = {
      type: 'call_expression',
      startPosition: { row: 1, column: 4 },
      endPosition: { row: 1, column: 15 },
      text: 'cube([10])',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified cube call
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
          endPosition: { row: 1, column: 15 },
          text: '([10])',
          isNamed: true,
          childCount: 1,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? cubeNode.children[index] : null,
      namedChild: (index: number) => index < 2 ? cubeNode.children[index] : null
    } as unknown as TreeSitterNode;
    
    // Copy identifier and arguments to namedChildren
    cubeNode.namedChildren = [...cubeNode.children];
    
    // Create block for the body
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 14 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube([10])\n}',
      isNamed: true,
      childCount: 1,
      children: [cubeNode],
      namedChildren: [cubeNode],
      child: (index: number) => index === 0 ? cubeNode : null,
      namedChild: (index: number) => index === 0 ? cubeNode : null
    } as unknown as TreeSitterNode;
    
    // Create scale operation node
    const scaleNode = {
      type: 'operation_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'scale([2,3,4]) {\n    cube([10])\n}',
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
    
    return scaleNode;
  }
  
  // Create a test scale node with single value 2
  function createScalarScaleNode(): TreeSitterNode {
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 5 },
      text: 'scale',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create scalar for scale
    const scalarNode = {
      type: 'number_literal',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 7 },
      text: '2',
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
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 8 },
      text: '(2)',
      isNamed: true,
      childCount: 1,
      children: [scalarNode],
      namedChildren: [scalarNode],
      child: (index: number) => index === 0 ? scalarNode : null,
      namedChild: (index: number) => index === 0 ? scalarNode : null
    } as unknown as TreeSitterNode;
    
    // Create cube for the body
    const cubeNode = {
      type: 'call_expression',
      startPosition: { row: 1, column: 4 },
      endPosition: { row: 1, column: 15 },
      text: 'cube([10])',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified cube call
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
          endPosition: { row: 1, column: 15 },
          text: '([10])',
          isNamed: true,
          childCount: 1,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? cubeNode.children[index] : null,
      namedChild: (index: number) => index < 2 ? cubeNode.children[index] : null
    } as unknown as TreeSitterNode;
    
    // Copy identifier and arguments to namedChildren
    cubeNode.namedChildren = [...cubeNode.children];
    
    // Create block for the body
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube([10])\n}',
      isNamed: true,
      childCount: 1,
      children: [cubeNode],
      namedChildren: [cubeNode],
      child: (index: number) => index === 0 ? cubeNode : null,
      namedChild: (index: number) => index === 0 ? cubeNode : null
    } as unknown as TreeSitterNode;
    
    // Create scale operation node
    const scaleNode = {
      type: 'operation_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'scale(2) {\n    cube([10])\n}',
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
    
    return scaleNode;
  }
  
  // Create a cursor pointing to a scale node
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
      gotoFirstChild: () => false,
      gotoLastChild: () => false,
      gotoNextSibling: () => false,
      gotoPreviousSibling: () => false,
      gotoParent: () => false,
      gotoFirstChildForIndex: () => false,
      gotoFirstChildForPosition: () => false,
      reset: () => {}
    } as unknown as TreeCursor;
  }
  
  describe('Vector scale', () => {
    let scaleNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      scaleNode = createVectorScaleNode();
      cursor = createTestCursor(scaleNode);
    });
    
    it('should convert a scale node to a ScaleTransform AST node', () => {
      // Act
      const result = scaleCursorAdapter(cursor);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('ScaleTransform');
      
      // Should have the correct position information
      expect(result.position).toEqual({
        startLine: scaleNode.startPosition.row,
        startColumn: scaleNode.startPosition.column,
        endLine: scaleNode.endPosition.row,
        endColumn: scaleNode.endPosition.column
      });
    });
    
    it('should extract the vector scale factors', () => {
      // Act
      const result = scaleCursorAdapter(cursor);
      
      // Assert
      expect(result.scaleFactors).toBeDefined();
      expect(result.scaleFactors.type).toBe('VectorLiteral');
      expect(result.scaleFactors.values).toHaveLength(3);
      expect(result.scaleFactors.values[0]).toBe(2);
      expect(result.scaleFactors.values[1]).toBe(3);
      expect(result.scaleFactors.values[2]).toBe(4);
    });
    
    it('should extract child nodes', () => {
      // Act
      const result = scaleCursorAdapter(cursor);
      
      // Assert
      expect(result.children).toBeDefined();
      expect(result.children).toHaveLength(1);
      expect(result.children[0].type).toBe('CallExpression');
    });
  });
  
  describe('Scalar scale', () => {
    let scaleNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      scaleNode = createScalarScaleNode();
      cursor = createTestCursor(scaleNode);
    });
    
    it('should handle scalar scale factor', () => {
      // Act
      const result = scaleCursorAdapter(cursor);
      
      // Assert
      expect(result.scaleFactors).toBeDefined();
      expect(result.scaleFactors.type).toBe('VectorLiteral');
      expect(result.scaleFactors.values).toHaveLength(3);
      // Scalar value 2 should be applied to all axes
      expect(result.scaleFactors.values[0]).toBe(2);
      expect(result.scaleFactors.values[1]).toBe(2);
      expect(result.scaleFactors.values[2]).toBe(2);
    });
  });
});
