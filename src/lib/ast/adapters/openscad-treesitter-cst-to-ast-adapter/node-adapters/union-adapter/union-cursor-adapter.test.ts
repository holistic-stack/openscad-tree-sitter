/**
 * Tests for UnionOperation cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the UnionOperation cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { UnionOperation } from '../../../../types/openscad-ast-types';
import { unionCursorAdapter } from './union-cursor-adapter';

describe('UnionOperation Cursor Adapter', () => {
  // Create child nodes to serve as children in the union operation
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

  function createChildSphere(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 2, column: 4 },
      endPosition: { row: 2, column: 16 },
      text: 'sphere(r=5)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified sphere call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 2, column: 4 },
          endPosition: { row: 2, column: 10 },
          text: 'sphere',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'arguments',
          startPosition: { row: 2, column: 10 },
          endPosition: { row: 2, column: 16 },
          text: '(r=5)',
          isNamed: true,
          childCount: 1,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createChildSphere().children[index] : null,
      namedChild: (index: number) => index < 2 ? createChildSphere().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Test utility for creating a union node
  function createTestUnionNode(): TreeSitterNode {
    // Create identifier node for 'union'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 5 },
      text: 'union',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node (empty for union)
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 7 },
      text: '()',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const cube = createChildCube();
    const sphere = createChildSphere();
    
    // Create body block for union operation
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 3, column: 1 },
      text: '{\n    cube(size=10)\n    sphere(r=5)\n}',
      isNamed: true,
      childCount: 2,
      children: [cube, sphere],
      namedChildren: [cube, sphere],
      child: (index: number) => {
        if (index === 0) return cube;
        if (index === 1) return sphere;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return cube;
        if (index === 1) return sphere;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create union operation node
    const unionNode = {
      type: 'operation_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 3, column: 1 },
      text: 'union() {\n    cube(size=10)\n    sphere(r=5)\n}',
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
    
    return unionNode;
  }
  
  // Test utility for creating a cursor pointing to a union node
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
  
  let unionNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    unionNode = createTestUnionNode();
    cursor = createTestCursor(unionNode);
  });
  
  it('should convert a union node to a UnionOperation AST node', () => {
    // Act
    const result = unionCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('UnionOperation');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: unionNode.startPosition.row,
      startColumn: unionNode.startPosition.column,
      endLine: unionNode.endPosition.row,
      endColumn: unionNode.endPosition.column
    });
    
    // Should have children
    expect(result.children).toBeDefined();
    expect(result.children).toBeInstanceOf(Array);
  });
  
  it('should extract the correct number of children', () => {
    // Act
    const result = unionCursorAdapter(cursor);
    
    // Assert
    expect(result.children.length).toBe(2); // Our test has 2 child nodes: cube and sphere
  });
  
  it('should extract children as call expressions', () => {
    // Act
    const result = unionCursorAdapter(cursor);
    
    // Assert
    expect(result.children[0].type).toBe('CallExpression');
    expect(result.children[1].type).toBe('CallExpression');
  });
  
  it('should preserve the order of children', () => {
    // Act
    const result = unionCursorAdapter(cursor);
    
    // Assert
    // First child should be cube, second should be sphere
    // We can check by verifying their positions match what we set up
    expect(result.children[0].position.startLine).toBe(1); // cube is on row 1
    expect(result.children[1].position.startLine).toBe(2); // sphere is on row 2
  });
});
