/**
 * Tests for ForStatement cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the ForStatement cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ForStatement } from '../../../../types/openscad-ast-types';
import { forLoopCursorAdapter } from './for-loop-cursor-adapter-minimal';

describe('ForStatement Cursor Adapter', () => {
  // We'll use a simplified adapter implementation to avoid circular dependencies
  // Create a test for loop node with range expression
  function createRangeForLoopNode(): TreeSitterNode {
    // Create the 'for' keyword node
    const forNode = {
      type: 'for',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 3 },
      text: 'for',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create variable node (i)
    const variableNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 5 },
      text: 'i',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create range expression
    const startNode = {
      type: 'number_literal',
      startPosition: { row: 0, column: 9 },
      endPosition: { row: 0, column: 10 },
      text: '0',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const stepNode = {
      type: 'number_literal',
      startPosition: { row: 0, column: 11 },
      endPosition: { row: 0, column: 12 },
      text: '1',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const endNode = {
      type: 'number_literal',
      startPosition: { row: 0, column: 13 },
      endPosition: { row: 0, column: 15 },
      text: '10',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Range expression [0:1:10]
    const rangeNode = {
      type: 'range_expression',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 16 },
      text: '[0:1:10]',
      isNamed: true,
      childCount: 3,
      children: [startNode, stepNode, endNode],
      namedChildren: [startNode, stepNode, endNode],
      child: (index: number) => {
        if (index === 0) return startNode;
        if (index === 1) return stepNode;
        if (index === 2) return endNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return startNode;
        if (index === 1) return stepNode;
        if (index === 2) return endNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create the declaration part (i = [0:1:10])
    const declarationNode = {
      type: 'assignment',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 16 },
      text: 'i = [0:1:10]',
      isNamed: true,
      childCount: 2,
      children: [variableNode, rangeNode],
      namedChildren: [variableNode, rangeNode],
      child: (index: number) => {
        if (index === 0) return variableNode;
        if (index === 1) return rangeNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return variableNode;
        if (index === 1) return rangeNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create parameters node
    const parametersNode = {
      type: 'parameters',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 16 },
      text: 'i = [0:1:10]',
      isNamed: true,
      childCount: 1,
      children: [declarationNode],
      namedChildren: [declarationNode],
      child: (index: number) => index === 0 ? declarationNode : null,
      namedChild: (index: number) => index === 0 ? declarationNode : null
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
    
    // Create block for the body
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 17 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube([10])\n}',
      isNamed: true,
      childCount: 1,
      children: [cubeNode],
      namedChildren: [cubeNode],
      child: (index: number) => index === 0 ? cubeNode : null,
      namedChild: (index: number) => index === 0 ? cubeNode : null
    } as unknown as TreeSitterNode;
    
    // Create for_statement node
    const forLoopNode = {
      type: 'for_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'for(i = [0:1:10]) {\n    cube([10])\n}',
      isNamed: true,
      childCount: 3,
      children: [forNode, parametersNode, bodyNode],
      namedChildren: [parametersNode, bodyNode],
      child: (index: number) => {
        if (index === 0) return forNode;
        if (index === 1) return parametersNode;
        if (index === 2) return bodyNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return parametersNode;
        if (index === 1) return bodyNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return forLoopNode;
  }
  
  // Create a test for loop node with vector expression
  function createVectorForLoopNode(): TreeSitterNode {
    // Create the 'for' keyword node
    const forNode = {
      type: 'for',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 3 },
      text: 'for',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create variable node (item)
    const variableNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 8 },
      text: 'item',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create vector child nodes
    const value1Node = {
      type: 'number_literal',
      startPosition: { row: 0, column: 12 },
      endPosition: { row: 0, column: 13 },
      text: '1',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const value2Node = {
      type: 'number_literal',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 0, column: 16 },
      text: '2',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    const value3Node = {
      type: 'number_literal',
      startPosition: { row: 0, column: 18 },
      endPosition: { row: 0, column: 19 },
      text: '3',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create vector literal [1, 2, 3]
    const vectorNode = {
      type: 'vector_literal',
      startPosition: { row: 0, column: 11 },
      endPosition: { row: 0, column: 20 },
      text: '[1, 2, 3]',
      isNamed: true,
      childCount: 3,
      children: [value1Node, value2Node, value3Node],
      namedChildren: [value1Node, value2Node, value3Node],
      child: (index: number) => {
        if (index === 0) return value1Node;
        if (index === 1) return value2Node;
        if (index === 2) return value3Node;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return value1Node;
        if (index === 1) return value2Node;
        if (index === 2) return value3Node;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create the declaration part (item = [1, 2, 3])
    const declarationNode = {
      type: 'assignment',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 20 },
      text: 'item = [1, 2, 3]',
      isNamed: true,
      childCount: 2,
      children: [variableNode, vectorNode],
      namedChildren: [variableNode, vectorNode],
      child: (index: number) => {
        if (index === 0) return variableNode;
        if (index === 1) return vectorNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return variableNode;
        if (index === 1) return vectorNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create parameters node
    const parametersNode = {
      type: 'parameters',
      startPosition: { row: 0, column: 4 },
      endPosition: { row: 0, column: 20 },
      text: 'item = [1, 2, 3]',
      isNamed: true,
      childCount: 1,
      children: [declarationNode],
      namedChildren: [declarationNode],
      child: (index: number) => index === 0 ? declarationNode : null,
      namedChild: (index: number) => index === 0 ? declarationNode : null
    } as unknown as TreeSitterNode;
    
    // Create translate for the body
    const translateNode = {
      type: 'operation_statement',
      startPosition: { row: 1, column: 4 },
      endPosition: { row: 1, column: 28 },
      text: 'translate([item, 0, 0]) cube(5)',
      isNamed: true,
      childCount: 3,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create block for the body
    const bodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 21 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    translate([item, 0, 0]) cube(5)\n}',
      isNamed: true,
      childCount: 1,
      children: [translateNode],
      namedChildren: [translateNode],
      child: (index: number) => index === 0 ? translateNode : null,
      namedChild: (index: number) => index === 0 ? translateNode : null
    } as unknown as TreeSitterNode;
    
    // Create for_statement node
    const forLoopNode = {
      type: 'for_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'for(item = [1, 2, 3]) {\n    translate([item, 0, 0]) cube(5)\n}',
      isNamed: true,
      childCount: 3,
      children: [forNode, parametersNode, bodyNode],
      namedChildren: [parametersNode, bodyNode],
      child: (index: number) => {
        if (index === 0) return forNode;
        if (index === 1) return parametersNode;
        if (index === 2) return bodyNode;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return parametersNode;
        if (index === 1) return bodyNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return forLoopNode;
  }
  
  // Create a cursor pointing to a for loop node
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
  
  describe('Range-based for loop', () => {
    let forLoopNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      forLoopNode = createRangeForLoopNode();
      cursor = createTestCursor(forLoopNode);
    });
    
    it('should convert a for loop node to a ForStatement AST node', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('ForStatement');
      
      // Should have the correct position information
      expect(result.position).toEqual({
        startLine: forLoopNode.startPosition.row,
        startColumn: forLoopNode.startPosition.column,
        endLine: forLoopNode.endPosition.row,
        endColumn: forLoopNode.endPosition.column
      });
    });
    
    it('should extract the variable name', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result.variable).toBe('i');
    });
    
    it('should extract the iterable expression for a range', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result.iterable).toBeDefined();
      expect(result.iterable.type).toBe('RangeExpression');
    });
    
    it('should extract child nodes from the body', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result.children).toBeDefined();
      expect(result.children).toHaveLength(1);
      expect(result.children[0].type).toBe('CallExpression');
    });
  });
  
  describe('Vector-based for loop', () => {
    let forLoopNode: TreeSitterNode;
    let cursor: TreeCursor;
    
    beforeEach(() => {
      forLoopNode = createVectorForLoopNode();
      cursor = createTestCursor(forLoopNode);
    });
    
    it('should extract the variable name for vector iteration', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result.variable).toBe('item');
    });
    
    it('should extract the iterable expression for a vector', () => {
      // Act
      const result = forLoopCursorAdapter(cursor);
      
      // Assert
      expect(result.iterable).toBeDefined();
      expect(result.iterable.type).toBe('VectorLiteral');
    });
  });
});
