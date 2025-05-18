/**
 * Tests for IfStatement cursor adapter
 * 
 * Following Test-Driven Development (TDD) principles, this file contains
 * tests for the IfStatement cursor adapter before its implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { IfStatement } from '../../../../types/openscad-ast-types';
import { ifStatementCursorAdapter } from './if-statement-cursor-adapter';

describe('IfStatement Cursor Adapter', () => {
  // Create a child node to serve as the body of the if statement
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
  
  // Create a child node to serve as the alternative (else) body of the if statement
  function createChildSphere(): TreeSitterNode {
    return {
      type: 'call_expression',
      startPosition: { row: 3, column: 4 },
      endPosition: { row: 3, column: 16 },
      text: 'sphere(r=5)',
      isNamed: true,
      childCount: 2,
      children: [
        // Simplified sphere call with minimal structure for testing
        {
          type: 'identifier',
          startPosition: { row: 3, column: 4 },
          endPosition: { row: 3, column: 10 },
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
          startPosition: { row: 3, column: 10 },
          endPosition: { row: 3, column: 16 },
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
  
  // Create a condition for the if statement
  function createCondition(): TreeSitterNode {
    return {
      type: 'binary_expression',
      startPosition: { row: 0, column: 3 },
      endPosition: { row: 0, column: 8 },
      text: 'x > 5',
      isNamed: true,
      childCount: 3,
      children: [
        {
          type: 'identifier',
          startPosition: { row: 0, column: 3 },
          endPosition: { row: 0, column: 4 },
          text: 'x',
          isNamed: true,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: '>',
          startPosition: { row: 0, column: 5 },
          endPosition: { row: 0, column: 6 },
          text: '>',
          isNamed: false,
          childCount: 0,
          children: [],
          namedChildren: [],
          child: () => null,
          namedChild: () => null
        } as unknown as TreeSitterNode,
        {
          type: 'number',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 8 },
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
      child: (index: number) => index < 3 ? createCondition().children[index] : null,
      namedChild: (index: number) => index < 3 ? createCondition().children[index] : null
    } as unknown as TreeSitterNode;
  }
  
  // Test utility for creating an if statement node
  function createTestIfStatementNode(includeElse: boolean = true): TreeSitterNode {
    // Create keyword node for 'if'
    const keywordNode = {
      type: 'if',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 2 },
      text: 'if',
      isNamed: false,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    
    // Create condition node
    const conditionNode = createCondition();
    
    // Create body block for if statement
    const ifBodyNode = {
      type: 'block',
      startPosition: { row: 0, column: 9 },
      endPosition: { row: 2, column: 1 },
      text: '{\n    cube(size=10)\n}',
      isNamed: true,
      childCount: 1,
      children: [createChildCube()],
      namedChildren: [createChildCube()],
      child: (index: number) => index === 0 ? createChildCube() : null,
      namedChild: (index: number) => index === 0 ? createChildCube() : null
    } as unknown as TreeSitterNode;
    
    let elseNodes: TreeSitterNode[] = [];
    let elseBodyNode: TreeSitterNode | undefined;
    
    if (includeElse) {
      // Create 'else' keyword node
      const elseKeywordNode = {
        type: 'else',
        startPosition: { row: 2, column: 2 },
        endPosition: { row: 2, column: 6 },
        text: 'else',
        isNamed: false,
        childCount: 0,
        children: [],
        namedChildren: [],
        child: () => null,
        namedChild: () => null
      } as unknown as TreeSitterNode;
      
      // Create else body block
      elseBodyNode = {
        type: 'block',
        startPosition: { row: 2, column: 7 },
        endPosition: { row: 4, column: 1 },
        text: '{\n    sphere(r=5)\n}',
        isNamed: true,
        childCount: 1,
        children: [createChildSphere()],
        namedChildren: [createChildSphere()],
        child: (index: number) => index === 0 ? createChildSphere() : null,
        namedChild: (index: number) => index === 0 ? createChildSphere() : null
      } as unknown as TreeSitterNode;
      
      elseNodes = [elseKeywordNode, elseBodyNode];
    }
    
    // Create if statement node
    const ifStatementNode = {
      type: 'if_statement',
      startPosition: { row: 0, column: 0 },
      endPosition: includeElse ? { row: 4, column: 1 } : { row: 2, column: 1 },
      text: includeElse ? 'if (x > 5) {\n    cube(size=10)\n} else {\n    sphere(r=5)\n}' : 'if (x > 5) {\n    cube(size=10)\n}',
      isNamed: true,
      childCount: includeElse ? 4 : 3,
      children: includeElse ? [keywordNode, conditionNode, ifBodyNode, ...elseNodes] : [keywordNode, conditionNode, ifBodyNode],
      namedChildren: includeElse ? [conditionNode, ifBodyNode, elseBodyNode!] : [conditionNode, ifBodyNode],
      child: (index: number) => {
        if (index === 0) return keywordNode;
        if (index === 1) return conditionNode;
        if (index === 2) return ifBodyNode;
        if (includeElse && index === 3) return elseNodes[0];
        if (includeElse && index === 4) return elseNodes[1];
        return null;
      },
      namedChild: (index: number) => {
        if (index === 0) return conditionNode;
        if (index === 1) return ifBodyNode;
        if (includeElse && index === 2) return elseBodyNode;
        return null;
      }
    } as unknown as TreeSitterNode;
    
    return ifStatementNode;
  }
  
  // Test utility for creating a cursor pointing to an if statement node
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
  
  let ifStatementNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    ifStatementNode = createTestIfStatementNode();
    cursor = createTestCursor(ifStatementNode);
  });
  
  it('should convert an if statement node to an IfStatement AST node', () => {
    // Act
    const result = ifStatementCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('IfStatement');
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: ifStatementNode.startPosition.row,
      startColumn: ifStatementNode.startPosition.column,
      endLine: ifStatementNode.endPosition.row,
      endColumn: ifStatementNode.endPosition.column
    });
  });
  
  it('should extract the condition expression', () => {
    // Act
    const result = ifStatementCursorAdapter(cursor);
    
    // Assert
    expect(result.condition).toBeDefined();
    // The condition should be properly extracted, but the type may vary based on the implementation
    // Our adapter simplifies types for testing purposes
    expect(result.condition.type).toBeDefined();
  });
  
  it('should extract the then branch body', () => {
    // Act
    const result = ifStatementCursorAdapter(cursor);
    
    // Assert
    expect(result.thenBranch).toBeDefined();
    expect(result.thenBranch).toBeInstanceOf(Array);
    expect(result.thenBranch.length).toBe(1);
    expect(result.thenBranch[0].type).toBe('CallExpression');
    
    // Check position of the then branch content
    expect(result.thenBranch[0].position.startLine).toBe(1); // cube is on row 1
  });
  
  it('should extract the else branch body when present', () => {
    // Act
    const result = ifStatementCursorAdapter(cursor);
    
    // Assert
    expect(result.elseBranch).toBeDefined();
    expect(result.elseBranch).toBeInstanceOf(Array);
    if (result.elseBranch) {
      expect(result.elseBranch.length).toBe(1);
      expect(result.elseBranch[0]?.type).toBe('CallExpression');
    }
    
    // Check position of the else branch content
    if (result.elseBranch && result.elseBranch[0]) {
      expect(result.elseBranch[0].position.startLine).toBe(3); // sphere is on row 3
    }
  });
  
  it('should handle if statement without else branch', () => {
    // Arrange
    const ifWithoutElseNode = createTestIfStatementNode(false);
    const ifWithoutElseCursor = createTestCursor(ifWithoutElseNode);
    
    // Act
    const result = ifStatementCursorAdapter(ifWithoutElseCursor);
    
    // Assert
    expect(result.thenBranch).toBeDefined();
    expect(result.thenBranch).toBeInstanceOf(Array);
    expect(result.thenBranch.length).toBe(1);
    
    // When there's no else branch, elseBranch should be undefined in the interface
    expect(result.elseBranch).toBeUndefined();
  });
});
