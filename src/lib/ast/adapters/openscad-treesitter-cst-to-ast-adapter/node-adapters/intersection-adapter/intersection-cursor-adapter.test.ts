/**
 * Tests for IntersectionOperation cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the IntersectionOperation cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { IntersectionOperation } from '../../../../types/openscad-ast-types';
import { intersectionCursorAdapter } from './intersection-cursor-adapter';

describe('IntersectionOperation Cursor Adapter', () => {
  // Create child nodes to serve as children in the intersection operation
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

  function createChildCylinder(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 3, column: 4 },
      endPosition: { row: 3, column: 22 },
      text: 'cylinder(h=8, r=3)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified cylinder call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 3, column: 4 },
          endPosition: { row: 3, column: 12 },
          text: 'cylinder',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'arguments',
          startPosition: { row: 3, column: 12 },
          endPosition: { row: 3, column: 22 },
          text: '(h=8, r=3)',
          isNamed: true,
          childCount: 2,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createChildCylinder().children[index] : null,
      namedChild: (index: number) => index < 2 ? createChildCylinder().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Test utility for creating an intersection node
  function createTestIntersectionNode(): TreeSitterNode {
    // Create identifier node for 'intersection'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 12 },
      text: 'intersection',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create arguments node (empty for intersection)
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 12 },
      endPosition: { row: 0, column: 14 },
      text: '()',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create child nodes for the body
    const cube = createChildCube();
    const sphere = createChildSphere();
    const cylinder = createChildCylinder();
    
    // Create body node
    const bodyNode = {
      type: 'block_statement',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 4, column: 1 },
      text: '{\n    cube(size=10)\n    sphere(r=5)\n    cylinder(h=8, r=3)\n}',
      isNamed: true,
      childCount: 3,
      children: [cube, sphere, cylinder],
      namedChildren: [cube, sphere, cylinder],
      child: (index: number) => {
        if (index === 0) return cube;
        if (index === 1) return sphere;
        if (index === 2) return cylinder;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return cube;
        if (index === 1) return sphere;
        if (index === 2) return cylinder;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create intersection operation node
    const intersectionNode = {
      type: 'operation_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 4, column: 1 },
      text: 'intersection() {\n    cube(size=10)\n    sphere(r=5)\n    cylinder(h=8, r=3)\n}',
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
    
    return intersectionNode;
  }
  
  // Test utility for creating a cursor pointing to an intersection node
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
  
  let intersectionNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    intersectionNode = createTestIntersectionNode();
    cursor = createTestCursor(intersectionNode);
  });
  
  it('should convert an intersection node to an IntersectionOperation AST node', () => {
    // Act
    const result = intersectionCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('IntersectionOperation');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: intersectionNode.startPosition.row,
      startColumn: intersectionNode.startPosition.column,
      endLine: intersectionNode.endPosition.row,
      endColumn: intersectionNode.endPosition.column
    });
    
    // Should have children
    expect(result.children).toBeDefined();
    expect(result.children).toBeInstanceOf(Array);
  });
  
  it('should extract the correct number of children', () => {
    // Act
    const result = intersectionCursorAdapter(cursor);
    
    // Assert
    expect(result.children.length).toBe(3); // Our test has 3 child nodes: cube, sphere, and cylinder
  });
  
  it('should extract children as call expressions', () => {
    // Act
    const result = intersectionCursorAdapter(cursor);
    
    // Assert
    expect(result.children[0].type).toBe('CallExpression');
    expect(result.children[1].type).toBe('CallExpression');
    expect(result.children[2].type).toBe('CallExpression');
  });
  
  it('should preserve the order of children', () => {
    // Act
    const result = intersectionCursorAdapter(cursor);
    
    // Assert
    // Children should be in order: cube, sphere, cylinder
    // We can check by verifying their positions match what we set up
    expect(result.children[0].position.startLine).toBe(1); // cube is on row 1
    expect(result.children[1].position.startLine).toBe(2); // sphere is on row 2
    expect(result.children[2].position.startLine).toBe(3); // cylinder is on row 3
  });
  
  it('should handle an intersection with no children gracefully', () => {
    // Arrange - create an intersection with no children
    const emptyNode = {
      ...intersectionNode,
      child: (index: number) => {
        if (index === 0) return intersectionNode.child(0);
        if (index === 1) return intersectionNode.child(1);
        if (index === 2) return {
          ...intersectionNode.child(2) as TreeSitterNode,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        };
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return intersectionNode.namedChild(0);
        if (index === 1) return intersectionNode.namedChild(1);
        if (index === 2) return {
          ...intersectionNode.namedChild(2) as TreeSitterNode,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        };
        return null;
      }
    };
    const emptyCursor = createTestCursor(emptyNode);
    
    // Act
    const result = intersectionCursorAdapter(emptyCursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('IntersectionOperation');
    expect(result.children).toBeInstanceOf(Array);
    expect(result.children.length).toBe(0);
  });
});
