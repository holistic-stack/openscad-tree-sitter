/**
 * Tests for Cylinder3D cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the Cylinder3D cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Cylinder3D } from '../../../../types/openscad-ast-types';
import { cylinderCursorAdapter } from './cylinder-cursor-adapter';

describe('Cylinder3D Cursor Adapter', () => {
  // Test utility for creating a cylinder node with arguments
  function createTestCylinderNode(): TreeSitterNode {
    // Create identifier node for 'cylinder'
    const identifierNode = {
      type: 'identifier',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 8 },
      text: 'cylinder',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create height argument node
    const heightArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 9 },
      endPosition: { row: 0, column: 13 },
      text: 'h=10',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 9 },
          endPosition: { row: 0, column: 10 },
          text: 'h',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
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
        } as unknown as TreeSitterNode
      ],
      namedChildren: [],
      child: (index: number) => index < 2 ? heightArgNode.children[index] : null,
      namedChild: (index: number) => index < 2 ? heightArgNode.children[index] : null
    } as unknown as TreeSitterNode;
    heightArgNode.namedChildren = heightArgNode.children;
    
    // Create radius argument node
    const radiusArgNode = {
      type: 'argument',
      startPosition: { row: 0, column: 15 },
      endPosition: { row: 0, column: 19 },
      text: 'r=5',
      isNamed: true,
      childCount: 2,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 15 },
          endPosition: { row: 0, column: 16 },
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
          startPosition: { row: 0, column: 17 },
          endPosition: { row: 0, column: 19 },
          text: '5',
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
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 20 },
      text: '(h=10, r=5)',
      isNamed: true,
      childCount: 2,
      children: [heightArgNode, radiusArgNode],
      namedChildren: [heightArgNode, radiusArgNode],
      child: (index: number) => index === 0 ? heightArgNode : index === 1 ? radiusArgNode : null,
      namedChild: (index: number) => index === 0 ? heightArgNode : index === 1 ? radiusArgNode : null
    } as unknown as TreeSitterNode;
    
    // Create call expression node for cylinder
    const callExprNode = {
      type: 'call_expression',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 20 },
      text: 'cylinder(h=10, r=5)',
      isNamed: true,
      childCount: 2,
      children: [identifierNode, argumentsNode],
      namedChildren: [identifierNode, argumentsNode],
      child: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? identifierNode : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return callExprNode;
  }
  
  // Test utility for creating a cylinder node with other parameter combinations
  function createCylinderNodeWithArgs(args: Record<string, any>): TreeSitterNode {
    // Start with a basic cylinder node
    const cylinderNode = createTestCylinderNode();
    
    // Replace the arguments node with custom arguments
    const argNodes: TreeSitterNode[] = [];
    
    // Create argument nodes for each key-value pair
    Object.entries(args).forEach(([key, value], index) => {
      const valueType = typeof value === 'number' ? 'number' : 
                       typeof value === 'boolean' ? (value ? 'true' : 'false') : 'string';
      
      const valueText = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
      
      // Create identifier node for argument name
      const identifierNode = {
        type: 'identifier',
        startPosition: { row: 0, column: 10 + index * 10 },
        endPosition: { row: 0, column: 10 + index * 10 + key.length },
        text: key,
        isNamed: true,
        childCount: 0,
        children: [],
        namedChildren: [],
        child: () => null,
        namedChild: () => null
      } as unknown as TreeSitterNode;
      
      // Create value node for argument value
      const valueNode = {
        type: valueType,
        startPosition: { row: 0, column: 10 + index * 10 + key.length + 1 },
        endPosition: { row: 0, column: 10 + index * 10 + key.length + 1 + valueText.length },
        text: valueText,
        isNamed: true,
        childCount: 0,
        children: [],
        namedChildren: [],
        child: () => null,
        namedChild: () => null
      } as unknown as TreeSitterNode;
      
      // Create argument node
      const argNode = {
        type: 'argument',
        startPosition: { row: 0, column: 10 + index * 10 },
        endPosition: { row: 0, column: 10 + index * 10 + key.length + 1 + valueText.length },
        text: `${key}=${valueText}`,
        isNamed: true,
        childCount: 2,
        children: [identifierNode, valueNode],
        namedChildren: [identifierNode, valueNode],
        child: (idx: number) => idx === 0 ? identifierNode : idx === 1 ? valueNode : null,
        namedChild: (idx: number) => idx === 0 ? identifierNode : idx === 1 ? valueNode : null
      } as unknown as TreeSitterNode;
      
      argNodes.push(argNode);
    });
    
    // Create new arguments node
    const argsText = '(' + argNodes.map(n => n.text).join(', ') + ')';
    const argumentsNode = {
      type: 'arguments',
      startPosition: { row: 0, column: 8 },
      endPosition: { row: 0, column: 8 + argsText.length },
      text: argsText,
      isNamed: true,
      childCount: argNodes.length,
      children: argNodes,
      namedChildren: argNodes,
      child: (index: number) => index < argNodes.length ? argNodes[index] : null,
      namedChild: (index: number) => index < argNodes.length ? argNodes[index] : null
    } as unknown as TreeSitterNode;
    
    // Update the call expression with the new arguments
    const updatedCallExpr = {
      ...cylinderNode,
      text: 'cylinder' + argsText,
      endPosition: { 
        row: 0, 
        column: cylinderNode.startPosition.column + 'cylinder'.length + argsText.length 
      },
      children: [cylinderNode.child(0) as TreeSitterNode, argumentsNode],
      namedChildren: [cylinderNode.namedChild(0) as TreeSitterNode, argumentsNode],
      child: (index: number) => index === 0 ? cylinderNode.child(0) : index === 1 ? argumentsNode : null,
      namedChild: (index: number) => index === 0 ? cylinderNode.namedChild(0) : index === 1 ? argumentsNode : null
    } as unknown as TreeSitterNode;
    
    return updatedCallExpr;
  }
  
  // Test utility for creating a cursor pointing to a cylinder node
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
  
  let cylinderNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    cylinderNode = createTestCylinderNode();
    cursor = createTestCursor(cylinderNode);
  });
  
  it('should convert a cylinder node to a Cylinder3D AST node', () => {
    // Act
    const result = cylinderCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('Cylinder3D');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: cylinderNode.startPosition.row,
      startColumn: cylinderNode.startPosition.column,
      endLine: cylinderNode.endPosition.row,
      endColumn: cylinderNode.endPosition.column
    });
    
    // Should extract the height and radius
    expect(result.height).toBeDefined();
    expect(result.radius1).toBeDefined();
  });
  
  it('should handle height parameter specified as h', () => {
    // Arrange
    const cylinderWithH = createCylinderNodeWithArgs({ h: 15 });
    const cursorWithH = createTestCursor(cylinderWithH);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithH);
    
    // Assert
    expect(result.height).toBeDefined();
    if (result.height.type === 'LiteralExpression' && 
        'valueType' in result.height && 
        'value' in result.height) {
      expect(result.height.valueType).toBe('number');
      expect(result.height.value).toBe(15);
    }
  });
  
  it('should handle radius parameter specified as r', () => {
    // Arrange
    const cylinderWithR = createCylinderNodeWithArgs({ h: 10, r: 5 });
    const cursorWithR = createTestCursor(cylinderWithR);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithR);
    
    // Assert
    expect(result.radius1).toBeDefined();
    if (result.radius1.type === 'LiteralExpression' && 
        'valueType' in result.radius1 && 
        'value' in result.radius1) {
      expect(result.radius1.valueType).toBe('number');
      expect(result.radius1.value).toBe(5);
    }
  });
  
  it('should handle different top and bottom radii (r1 and r2)', () => {
    // Arrange
    const cylinderWithR1R2 = createCylinderNodeWithArgs({ h: 10, r1: 5, r2: 3 });
    const cursorWithR1R2 = createTestCursor(cylinderWithR1R2);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithR1R2);
    
    // Assert
    expect(result.radius1).toBeDefined();
    expect(result.radius2).toBeDefined();
    if (result.radius1.type === 'LiteralExpression' && 
        'valueType' in result.radius1 && 
        'value' in result.radius1) {
      expect(result.radius1.valueType).toBe('number');
      expect(result.radius1.value).toBe(5);
    }
    if (result.radius2 && 
        result.radius2.type === 'LiteralExpression' && 
        'valueType' in result.radius2 && 
        'value' in result.radius2) {
      expect(result.radius2.valueType).toBe('number');
      expect(result.radius2.value).toBe(3);
    }
  });
  
  it('should handle diameter parameters specified as d, d1, and d2', () => {
    // Arrange
    const cylinderWithD = createCylinderNodeWithArgs({ h: 10, d1: 10, d2: 6 });
    const cursorWithD = createTestCursor(cylinderWithD);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithD);
    
    // Assert
    // Should calculate radius1 as d1/2
    expect(result.radius1).toBeDefined();
    if (result.radius1.type === 'LiteralExpression' && 
        'valueType' in result.radius1 && 
        'value' in result.radius1) {
      expect(result.radius1.valueType).toBe('number');
      expect(result.radius1.value).toBe(5); // 10/2
    }
    
    // Should calculate radius2 as d2/2
    expect(result.radius2).toBeDefined();
    if (result.radius2 && 
        result.radius2.type === 'LiteralExpression' && 
        'valueType' in result.radius2 && 
        'value' in result.radius2) {
      expect(result.radius2.valueType).toBe('number');
      expect(result.radius2.value).toBe(3); // 6/2
    }
  });
  
  it('should handle diameter parameter specified as just d', () => {
    // Arrange
    const cylinderWithD = createCylinderNodeWithArgs({ h: 10, d: 8 });
    const cursorWithD = createTestCursor(cylinderWithD);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithD);
    
    // Assert
    // Should calculate both radius1 and radius2 as d/2
    expect(result.radius1).toBeDefined();
    if (result.radius1.type === 'LiteralExpression' && 
        'valueType' in result.radius1 && 
        'value' in result.radius1) {
      expect(result.radius1.valueType).toBe('number');
      expect(result.radius1.value).toBe(4); // 8/2
    }
    
    // radius2 should be undefined or equal to radius1
    if (result.radius2 && 
        result.radius2.type === 'LiteralExpression' && 
        'valueType' in result.radius2 && 
        'value' in result.radius2) {
      expect(result.radius2.valueType).toBe('number');
      expect(result.radius2.value).toBe(4); // 8/2
    }
  });
  
  it('should handle the center parameter when true', () => {
    // Arrange
    const cylinderCentered = createCylinderNodeWithArgs({ h: 10, r: 5, center: true });
    const cursorCentered = createTestCursor(cylinderCentered);
    
    // Act
    const result = cylinderCursorAdapter(cursorCentered);
    
    // Assert
    expect(result.center).toBe(true);
  });
  
  it('should handle the center parameter when false', () => {
    // Arrange
    const cylinderNotCentered = createCylinderNodeWithArgs({ h: 10, r: 5, center: false });
    const cursorNotCentered = createTestCursor(cylinderNotCentered);
    
    // Act
    const result = cylinderCursorAdapter(cursorNotCentered);
    
    // Assert
    expect(result.center).toBe(false);
  });
  
  it('should handle $fn special variable when specified', () => {
    // Arrange
    const cylinderWithFn = createCylinderNodeWithArgs({ h: 10, r: 5, $fn: 36 });
    const cursorWithFn = createTestCursor(cylinderWithFn);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithFn);
    
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
    // Arrange
    const cylinderWithMultiple = createCylinderNodeWithArgs({ 
      h: 15, 
      r1: 8,
      r2: 4,
      center: true,
      $fn: 48,
      $fa: 2.5
    });
    const cursorWithMultiple = createTestCursor(cylinderWithMultiple);
    
    // Act
    const result = cylinderCursorAdapter(cursorWithMultiple);
    
    // Assert
    expect(result.height).toBeDefined();
    if (result.height.type === 'LiteralExpression' && 
        'value' in result.height) {
      expect(result.height.value).toBe(15);
    }
    
    expect(result.radius1).toBeDefined();
    if (result.radius1.type === 'LiteralExpression' && 
        'value' in result.radius1) {
      expect(result.radius1.value).toBe(8);
    }
    
    expect(result.radius2).toBeDefined();
    if (result.radius2 && 
        result.radius2.type === 'LiteralExpression' && 
        'value' in result.radius2) {
      expect(result.radius2.value).toBe(4);
    }
    
    expect(result.center).toBe(true);
    expect(result.$fn).toBeDefined();
    expect(result.$fa).toBeDefined();
  });
});
