/**
 * Tests for Polygon2D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Polygon2D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Polygon2D } from '../../../../types/openscad-ast-types';
import { polygonCursorAdapter } from './polygon-cursor-adapter';

describe('Polygon2D Cursor Adapter', () => {
  // Create a test polygon node with points array
  function createBasicPolygonNode(): TreeSitterNode {
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 7 },
      text: 'polygon',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create points parameter - a vector of vectors for the polygon points
    // polygon([[0,0],[10,0],[10,10],[0,10]])
    const pointsVectorNode = {
      type: 'vector_literal',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 40 },
      text: '[[0,0],[10,0],[10,10],[0,10]]',
      isNamed: true,
      childCount: 4,
      children: [
        // First point [0,0]
        {
          type: 'vector_literal',
          startPosition: { row: 0, column: 9 },
          endPosition: { row: 0, column: 14 },
          text: '[0,0]',
          isNamed: true,
          childCount: 2,
          children: [
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 10 },
              endPosition: { row: 0, column: 11 },
              text: '0',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 12 },
              endPosition: { row: 0, column: 13 },
              text: '0',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode
          ],
          namedChildren: [],
          child: (index: number) => index < 2 ? (index === 0 ? {
            type: 'number_literal',
            text: '0'
          } as unknown as TreeSitterNode : {
            type: 'number_literal',
            text: '0'
          } as unknown as TreeSitterNode) : null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        // Second point [10,0]
        {
          type: 'vector_literal',
          startPosition: { row: 0, column: 15 },
          endPosition: { row: 0, column: 21 },
          text: '[10,0]',
          isNamed: true,
          childCount: 2,
          children: [
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 16 },
              endPosition: { row: 0, column: 18 },
              text: '10',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 19 },
              endPosition: { row: 0, column: 20 },
              text: '0',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode
          ],
          namedChildren: [],
          child: (index: number) => index < 2 ? (index === 0 ? {
            type: 'number_literal',
            text: '10'
          } as unknown as TreeSitterNode : {
            type: 'number_literal',
            text: '0'
          } as unknown as TreeSitterNode) : null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        // Third point [10,10]
        {
          type: 'vector_literal',
          startPosition: { row: 0, column: 22 },
          endPosition: { row: 0, column: 29 },
          text: '[10,10]',
          isNamed: true,
          childCount: 2,
          children: [
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 23 },
              endPosition: { row: 0, column: 25 },
              text: '10',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 26 },
              endPosition: { row: 0, column: 28 },
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
          child: (index: number) => index < 2 ? (index === 0 ? {
            type: 'number_literal',
            text: '10'
          } as unknown as TreeSitterNode : {
            type: 'number_literal',
            text: '10'
          } as unknown as TreeSitterNode) : null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        // Fourth point [0,10]
        {
          type: 'vector_literal',
          startPosition: { row: 0, column: 30 },
          endPosition: { row: 0, column: 36 },
          text: '[0,10]',
          isNamed: true,
          childCount: 2,
          children: [
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 31 },
              endPosition: { row: 0, column: 32 },
              text: '0',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 33 },
              endPosition: { row: 0, column: 35 },
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
          child: (index: number) => index < 2 ? (index === 0 ? {
            type: 'number_literal',
            text: '0'
          } as unknown as TreeSitterNode : {
            type: 'number_literal',
            text: '10'
          } as unknown as TreeSitterNode) : null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 4 ? pointsVectorNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node with named parameter
    const parameterNode = {
      type: 'parameter',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 47 },
      text: 'points=[[0,0],[10,0],[10,10],[0,10]]',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 8 },
          endPosition: { row: 0, column: 14 },
          text: 'points',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        pointsVectorNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? parameterNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 48 },
      text: '(points=[[0,0],[10,0],[10,10],[0,10]])',
      isNamed: true,
      childCount: 1,
      children: [parameterNode],
      namedChildren: [parameterNode],
      child: (index: number) => index === 0 ? parameterNode : null,
      namedChild: (index: number) => index === 0 ? parameterNode : null
    } as unknown as TreeSitterNode;
    
    // Create polygon node
    const polygonNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 48 },
      text: 'polygon(points=[[0,0],[10,0],[10,10],[0,10]])',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return polygonNode;
  }
  
  // Create a test polygon node with points and paths
  function createPolygonWithPathsNode(): TreeSitterNode {
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 7 },
      text: 'polygon',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create points parameter - vector of vectors
    const pointsVectorNode = {
      type: 'vector_literal',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 0, column: 47 },
      text: '[[0,0],[10,0],[10,10],[0,10]]',
      isNamed: true,
      childCount: 4,
      children: [
        // Points vectors, simplified for brevity
        { type: 'vector_literal', text: '[0,0]' } as unknown as TreeSitterNode,
        { type: 'vector_literal', text: '[10,0]' } as unknown as TreeSitterNode,
        { type: 'vector_literal', text: '[10,10]' } as unknown as TreeSitterNode,
        { type: 'vector_literal', text: '[0,10]' } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 4 ? pointsVectorNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create paths parameter - vector of vectors for the polygon paths
    const pathsVectorNode = {
      type: 'vector_literal',
      startPosition: { row: 0, column: 54 },
      endPosition: { row: 0, column: 69 },
      text: '[[0,1,2,3]]',
      isNamed: true,
      childCount: 1,
      children: [
        {
          type: 'vector_literal',
          startPosition: { row: 0, column: 55 },
          endPosition: { row: 0, column: 64 },
          text: '[0,1,2,3]',
          isNamed: true,
          childCount: 4,
          children: [
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 56 },
              endPosition: { row: 0, column: 57 },
              text: '0',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 58 },
              endPosition: { row: 0, column: 59 },
              text: '1',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode,
            {
              type: 'number_literal',
              startPosition: { row: 0, column: 60 },
              endPosition: { row: 0, column: 61 },
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
              startPosition: { row: 0, column: 62 },
              endPosition: { row: 0, column: 63 },
              text: '3',
              isNamed: true,
              childCount: 0,
              children: [],
              namedChildren: [],
              child: () => null,
              namedChild: () => null
            } as unknown as TreeSitterNode
          ],
          namedChildren: [],
          child: (index: number) => index < 4 ? {
            type: 'number_literal',
            text: String(index)
          } as unknown as TreeSitterNode : null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index === 0 ? pathsVectorNode.children[0] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create convexity parameter
    const convexityNode = {
      type: 'number_literal',
      startPosition: { row: 0, column: 80 },
      endPosition: { row: 0, column: 81 },
      text: '2',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create argument parameters
    const pointsParamNode = {
      type: 'parameter',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 47 },
      text: 'points=[[0,0],[10,0],[10,10],[0,10]]',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 8 },
          endPosition: { row: 0, column: 14 },
          text: 'points',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        pointsVectorNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? pointsParamNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const pathsParamNode = {
      type: 'parameter',
      startPosition: { row: 0, column: 48 },
      endPosition: { row: 0, column: 69 },
      text: 'paths=[[0,1,2,3]]',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 48 },
          endPosition: { row: 0, column: 53 },
          text: 'paths',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        pathsVectorNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? pathsParamNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const convexityParamNode = {
      type: 'parameter',
      startPosition: { row: 0, column: 70 },
      endPosition: { row: 0, column: 81 },
      text: 'convexity=2',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 70 },
          endPosition: { row: 0, column: 79 },
          text: 'convexity',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        convexityNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? convexityParamNode.children[index] : null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 7 },
      endPosition: { row: 0, column: 82 },
      text: '(points=[[0,0],[10,0],[10,10],[0,10]], paths=[[0,1,2,3]], convexity=2)',
      isNamed: true,
      childCount: 3,
      children: [pointsParamNode, pathsParamNode, convexityParamNode],
      namedChildren: [pointsParamNode, pathsParamNode, convexityParamNode],
      child: (index: number) => {
        if (index === 0) return pointsParamNode;
        if (index === 1) return pathsParamNode;
        if (index === 2) return convexityParamNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return pointsParamNode;
        if (index === 1) return pathsParamNode;
        if (index === 2) return convexityParamNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create polygon node
    const polygonNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 82 },
      text: 'polygon(points=[[0,0],[10,0],[10,10],[0,10]], paths=[[0,1,2,3]], convexity=2)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return identifierNode;
        if (index === 1) return argumentsNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return polygonNode;
  }
  
  // Create a cursor pointing to a polygon node
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
  
  describe('Basic polygon with points only', () => {
    let polygonNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      polygonNode = createBasicPolygonNode();
      cursor = createTestCursor(polygonNode);
    });
    
    it('should convert a polygon node to a Polygon2D AST node', () => {
      // Act
      const result = polygonCursorAdapter(cursor);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('Polygon2D');
      
      // Should have the correct position information
      expect(result.position).toEqual({
        startLine: polygonNode.startPosition.row,
        startColumn: polygonNode.startPosition.column,
        endLine: polygonNode.endPosition.row,
        endColumn: polygonNode.endPosition.column
      });
    });
    
    it('should extract the points parameter', () => {
      // Act
      const result = polygonCursorAdapter(cursor);
      
      // Assert
      expect(result.points).toBeDefined();
      expect(result.points.type).toBe('VectorLiteral');
    });
    
    it('should handle a polygon with only the required points parameter', () => {
      // Act
      const result = polygonCursorAdapter(cursor);
      
      // Assert
      expect(result.paths).toBeUndefined();
      expect(result.convexity).toBeUndefined();
    });
  });
  
  describe('Polygon with points, paths, and convexity', () => {
    let polygonNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      polygonNode = createPolygonWithPathsNode();
      cursor = createTestCursor(polygonNode);
    });
    
    it('should extract all parameters from a complete polygon node', () => {
      // Act
      const result = polygonCursorAdapter(cursor);
      
      // Assert
      expect(result.points).toBeDefined();
      expect(result.paths).toBeDefined();
      expect(result.convexity).toBeDefined();
      
      // Check that the convexity value is processed correctly
      expect(result.convexity.type).toBe('LiteralExpression');
      expect(result.convexity.value).toBe(2);
    });
  });
});
