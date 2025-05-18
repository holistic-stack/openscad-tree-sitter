/**
 * Tests for LinearExtrudeTransform cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the LinearExtrudeTransform cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { LinearExtrudeTransform } from '../../../../types/openscad-ast-types';
import { linearExtrudeCursorAdapter } from './linear-extrude-cursor-adapter';

describe('LinearExtrudeTransform Cursor Adapter', () => {
  // Create a child node to serve as the 2D object to be extruded
  function createChildSquare(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 1, column: 4 },
      endPosition: { row: 1, column: 24 },
      text: 'square(size=10, center=true)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified square call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 1, column: 4 },
          endPosition: { row: 1, column: 10 },
          text: 'square',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'arguments',
          startPosition: { row: 1, column: 10 },
          endPosition: { row: 1, column: 24 },
          text: '(size=10, center=true)',
          isNamed: true,
          childCount: 2,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createChildSquare().children[index] : null,
      namedChild: (index: number) => index < 2 ? createChildSquare().children[index] : null
    } as unknown as TreeSitterNode;
  }

  function createChildCircle(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 2, column: 4 },
      endPosition: { row: 2, column: 16 },
      text: 'circle(r=5)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified circle call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 2, column: 4 },
          endPosition: { row: 2, column: 10 },
          text: 'circle',
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
      child: (index: number) => index < 2 ? createChildCircle().children[index] : null,
      namedChild: (index: number) => index < 2 ? createChildCircle().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Create height argument node (required parameter)
  function createHeightArgNode(): TreeSitterNode {
    return {
      type: 'argument',
      startPosition: { row: 0, column: 14 },
      endPosition: { row: 0, column: 21 },
      text: 'height=20',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 14 },
          endPosition: { row: 0, column: 20 },
          text: 'height',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 21 },
          endPosition: { row: 0, column: 23 },
          text: '20',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createHeightArgNode().children[index] : null,
      namedChild: (index: number) => index < 2 ? createHeightArgNode().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Create twist argument node (optional parameter)
  function createTwistArgNode(): TreeSitterNode {
    return {
      type: 'argument',
      startPosition: { row: 0, column: 23 },
      endPosition: { row: 0, column: 31 },
      text: 'twist=45',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 23 },
          endPosition: { row: 0, column: 28 },
          text: 'twist',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 29 },
          endPosition: { row: 0, column: 31 },
          text: '45',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createTwistArgNode().children[index] : null,
      namedChild: (index: number) => index < 2 ? createTwistArgNode().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Create center argument node (optional parameter)
  function createCenterArgNode(): TreeSitterNode {
    return {
      type: 'argument',
      startPosition: { row: 0, column: 33 },
      endPosition: { row: 0, column: 45 },
      text: 'center=true',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 33 },
          endPosition: { row: 0, column: 39 },
          text: 'center',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'true',
          startPosition: { row: 0, column: 40 },
          endPosition: { row: 0, column: 44 },
          text: 'true',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createCenterArgNode().children[index] : null,
      namedChild: (index: number) => index < 2 ? createCenterArgNode().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Create slices argument node (optional parameter)
  function createSlicesArgNode(): TreeSitterNode {
    return {
      type: 'argument',
      startPosition: { row: 0, column: 46 },
      endPosition: { row: 0, column: 55 },
      text: 'slices=10',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 46 },
          endPosition: { row: 0, column: 52 },
          text: 'slices',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 53 },
          endPosition: { row: 0, column: 55 },
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
      child: (index: number) => index < 2 ? createSlicesArgNode().children[index] : null,
      namedChild: (index: number) => index < 2 ? createSlicesArgNode().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Create $fn argument node (optional parameter)
  function createFnArgNode(): TreeSitterNode {
    return {
      type: 'argument',
      startPosition: { row: 0, column: 57 },
      endPosition: { row: 0, column: 63 },
      text: '$fn=32',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 57 },
          endPosition: { row: 0, column: 60 },
          text: '$fn',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 61 },
          endPosition: { row: 0, column: 63 },
          text: '32',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? createFnArgNode().children[index] : null,
      namedChild: (index: number) => index < 2 ? createFnArgNode().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Test utility for creating a linear_extrude node
  function createTestLinearExtrudeNode(): TreeSitterNode {
    // Create identifier node for 'linear_extrude'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 14 },
      text: 'linear_extrude',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create argument nodes for parameters
    const heightArg = createHeightArgNode();
    const twistArg = createTwistArgNode();
    const centerArg = createCenterArgNode();
    const slicesArg = createSlicesArgNode();
    const fnArg = createFnArgNode();
    
    // Create arguments node with all parameters
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 14 },
      endPosition: { row: 0, column: 64 },
      text: '(height=20, twist=45, center=true, slices=10, $fn=32)',
      isNamed: true,
      childCount: 5,
      children: [heightArg, twistArg, centerArg, slicesArg, fnArg],
      namedChildren: [heightArg, twistArg, centerArg, slicesArg, fnArg],
      child: (index: number) => {
        if (index === 0) return heightArg;
        if (index === 1) return twistArg;
        if (index === 2) return centerArg;
        if (index === 3) return slicesArg;
        if (index === 4) return fnArg;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return heightArg;
        if (index === 1) return twistArg;
        if (index === 2) return centerArg;
        if (index === 3) return slicesArg;
        if (index === 4) return fnArg;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create child nodes for the body
    const square = createChildSquare();
    const circle = createChildCircle();
    
    // Create body node
    const bodyNode = {
      type: 'block_statement',
      startPosition: { row: 0, column: 65 },
      endPosition: { row: 3, column: 1 },
      text: '{\n    square(size=10, center=true)\n    circle(r=5)\n}',
      isNamed: true,
      childCount: 2,
      children: [square, circle],
      namedChildren: [square, circle],
      child: (index: number) => {
        if (index === 0) return square;
        if (index === 1) return circle;
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return square;
        if (index === 1) return circle;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    // Create the transform statement node
    const transformNode = {
      type: 'transform_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 3, column: 1 },
      text: 'linear_extrude(height=20, twist=45, center=true, slices=10, $fn=32) {\n    square(size=10, center=true)\n    circle(r=5)\n}',
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
    
    return transformNode;
  }
  
  // Test utility for creating a simpler linear_extrude node with minimal parameters
  function createSimpleLinearExtrudeNode(): TreeSitterNode {
    // Create identifier node for 'linear_extrude'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 14 },
      text: 'linear_extrude',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create argument nodes for parameters (just height)
    const heightArg = createHeightArgNode();
    
    // Create arguments node with just height parameter
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 14 },
      endPosition: { row: 0, column: 23 },
      text: '(height=20)',
      isNamed: true,
      childCount: 1,
      children: [heightArg],
      namedChildren: [heightArg],
      child: (index: number) => index === 0 ? heightArg : null,
      namedChild: (index: number) => index === 0 ? heightArg : null
    } as unknown as TreeSitterNode;
    
    // Create child node for the body
    const square = createChildSquare();
    
    // Create body node
    const bodyNode = {
      type: 'block_statement',
      startPosition: { row: 0, column: 24 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    square(size=10, center=true)\n}',
      isNamed: true,
      childCount: 1,
      children: [square],
      namedChildren: [square],
      child: (index: number) => index === 0 ? square : null,
      namedChild: (index: number) => index === 0 ? square : null
    } as unknown as TreeSitterNode;
    
    // Create the transform statement node
    const transformNode = {
      type: 'transform_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: 'linear_extrude(height=20) {\n    square(size=10, center=true)\n}',
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
    
    return transformNode;
  }
  
  // Test utility for creating a cursor pointing to a linear_extrude node
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
  
  let linearExtrudeNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    linearExtrudeNode = createTestLinearExtrudeNode();
    cursor = createTestCursor(linearExtrudeNode);
  });
  
  it('should convert a linear_extrude node to a LinearExtrudeTransform AST node', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('LinearExtrudeTransform');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: linearExtrudeNode.startPosition.row,
      startColumn: linearExtrudeNode.startPosition.column,
      endLine: linearExtrudeNode.endPosition.row,
      endColumn: linearExtrudeNode.endPosition.column
    });
    
    // Should have children
    expect(result.children).toBeDefined();
    expect(result.children).toBeInstanceOf(Array);
  });
  
  it('should extract the height parameter correctly', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.height).toBeDefined();
    if (result.height.type === 'LiteralExpression' && 
        'valueType' in result.height && 
        'value' in result.height) {
      expect(result.height.valueType).toBe('number');
      expect(result.height.value).toBe(20);
    }
  });
  
  it('should extract the twist parameter correctly', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.twist).toBeDefined();
    if (result.twist && result.twist.type === 'LiteralExpression' && 
        'valueType' in result.twist && 
        'value' in result.twist) {
      expect(result.twist.valueType).toBe('number');
      expect(result.twist.value).toBe(45);
    }
  });
  
  it('should extract the center parameter correctly', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.center).toBeDefined();
    if (result.center && result.center.type === 'LiteralExpression' && 
        'valueType' in result.center && 
        'value' in result.center) {
      expect(result.center.valueType).toBe('boolean');
      expect(result.center.value).toBe(true);
    }
  });
  
  it('should extract the slices parameter correctly', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.slices).toBeDefined();
    if (result.slices && result.slices.type === 'LiteralExpression' && 
        'valueType' in result.slices && 
        'value' in result.slices) {
      expect(result.slices.valueType).toBe('number');
      expect(result.slices.value).toBe(10);
    }
  });
  
  it('should extract the $fn parameter correctly', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.$fn).toBeDefined();
    if (result.$fn && result.$fn.type === 'LiteralExpression' && 
        'valueType' in result.$fn && 
        'value' in result.$fn) {
      expect(result.$fn.valueType).toBe('number');
      expect(result.$fn.value).toBe(32);
    }
  });
  
  it('should extract the correct number of children', () => {
    // Act
    const result = linearExtrudeCursorAdapter(cursor);
    
    // Assert
    expect(result.children.length).toBe(2); // Our test has 2 child nodes: square and circle
  });
  
  it('should handle a linear_extrude with minimal parameters', () => {
    // Arrange - create a simpler linear_extrude with just the height parameter
    const simpleNode = createSimpleLinearExtrudeNode();
    const simpleCursor = createTestCursor(simpleNode);
    
    // Act
    const result = linearExtrudeCursorAdapter(simpleCursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('LinearExtrudeTransform');
    expect(result.height).toBeDefined();
    
    // Optional parameters should be undefined
    expect(result.twist).toBeUndefined();
    expect(result.center).toBeUndefined();
    expect(result.slices).toBeUndefined();
    expect(result.$fn).toBeUndefined();
    
    // Should have just one child
    expect(result.children.length).toBe(1);
  });
});
