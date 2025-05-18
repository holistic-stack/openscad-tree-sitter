import { describe, it, expect } from 'vitest';
import { TreeSitterNode, TreeCursor, SyntaxTree } from '../../../types';
import { ASTNode, Program, ModuleDeclaration, CallExpression, IdentifierExpression, BlockStatement } from '../../../types/ast-types';
import { createCursorAdapter } from './cursor-adapter-factory';

// Interface for testing cursor cleanup tracking
interface TestSyntaxTree extends SyntaxTree {
  cursorDeleteCalled: { value: boolean };
}

// Test utilities for creating a test syntax tree and cursor
function createTestSyntaxTree(): TestSyntaxTree {
  const rootNode = {
    type: 'program',
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 5, column: 0 },
    text: 'program content',
    childCount: 2,
    isNamed: true,
    child: (index: number) => {
      if (index === 0) {
        return {
          type: 'module_declaration',
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 3, column: 0 },
          text: 'module test() {}',
          childCount: 0,
          isNamed: true
        } as unknown as TreeSitterNode;
      }
      if (index === 1) {
        return {
          type: 'call_expression',
          startPosition: { row: 4, column: 0 },
          endPosition: { row: 5, column: 0 },
          text: 'test();',
          childCount: 0,
          isNamed: true
        } as unknown as TreeSitterNode;
      }
      return null;
    }
  } as unknown as TreeSitterNode;

  // We need to track cursor position and node types for debugging
  let cursorCallCount = 0;
  const cursorDeleteCalled = { value: false };
  let currentNodeType = 'program';

  // Create a cursor that tracks if delete() was called
  const cursor = {
    nodeType: 'program',
    nodeIsNamed: true,
    nodeIsMissing: false,
    nodeStartPosition: { row: 0, column: 0 },
    nodeEndPosition: { row: 5, column: 0 },
    nodeStartIndex: 0,
    nodeEndIndex: 50,
    currentNode: () => {
      if (cursor.nodeType === 'module_declaration') {
        return rootNode.child(0);
      } else if (cursor.nodeType === 'call_expression') {
        return rootNode.child(1);
      }
      return rootNode;
    },
    currentFieldName: () => null,
    delete: () => { cursorDeleteCalled.value = true; },
    gotoFirstChild: () => {
      cursorCallCount++;
      // First call goes to first child, second call returns false
      if (cursorCallCount === 1) {
        // Update cursor to point to module_declaration
        cursor.nodeType = 'module_declaration';
        return true;
      }
      return false;
    },
    gotoNextSibling: () => {
      cursorCallCount++;
      // Only the third call (after first child, then next sibling) returns false
      if (cursorCallCount < 3) {
        // Update cursor to point to call_expression
        cursor.nodeType = 'call_expression';
        return true;
      }
      return false;
    },
    gotoParent: () => true,
    gotoFirstChildForIndex: () => false,
    gotoFirstChildForPosition: () => false
  } as unknown as TreeCursor;

  return {
    rootNode,
    walk: () => cursor,
    getChangedRanges: () => [],
    getEditedRange: () => ({ 
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 0 },
      startIndex: 0,
      endIndex: 0
    }),
    getLanguage: () => ({}),
    cursorDeleteCalled
  } as TestSyntaxTree;
}

describe('Cursor Adapter Factory', () => {
  it('should create a cursor adapter that processes nodes', () => {
    // Arrange
    const tree = createTestSyntaxTree();
    
    // Mock adapter map for testing different node types
    const adapterMap = {
      'Program': (cursor: TreeCursor): Program => {
        return {
          type: 'Program',
          position: {
            startLine: cursor.nodeStartPosition.row,
            startColumn: cursor.nodeStartPosition.column,
            endLine: cursor.nodeEndPosition.row,
            endColumn: cursor.nodeEndPosition.column
          },
          children: []
        };
      },
      'ModuleDeclaration': (cursor: TreeCursor): ModuleDeclaration => {
        const blockStatement: BlockStatement = {
          type: 'BlockStatement',
          position: {
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 0
          },
          statements: []
        };
        
        return {
          type: 'ModuleDeclaration',
          position: {
            startLine: cursor.nodeStartPosition.row,
            startColumn: cursor.nodeStartPosition.column,
            endLine: cursor.nodeEndPosition.row,
            endColumn: cursor.nodeEndPosition.column
          },
          name: 'test',
          parameters: [],
          body: blockStatement
        };
      },
      'CallExpression': (cursor: TreeCursor): CallExpression => {
        const callee: IdentifierExpression = {
          type: 'IdentifierExpression',
          name: 'test',
          position: {
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 0
          }
        };
        
        return {
          type: 'CallExpression',
          position: {
            startLine: cursor.nodeStartPosition.row,
            startColumn: cursor.nodeStartPosition.column,
            endLine: cursor.nodeEndPosition.row,
            endColumn: cursor.nodeEndPosition.column
          },
          callee,
          arguments: []
        };
      }
    };
    
    // Act
    const adaptTree = createCursorAdapter(adapterMap);
    const result = adaptTree(tree) as Program;
    
    // Assert
    expect(result.type).toBe('Program');
    expect(result.children.length).toBe(2);
    expect(result.children[0].type).toBe('ModuleDeclaration');
    expect(result.children[1].type).toBe('CallExpression');
    
    // Verify cursor was properly cleaned up
    expect(tree.cursorDeleteCalled.value).toBe(true);
  });

  it('should handle syntax tree with no children', () => {
    // Arrange
    const emptyRootNode = {
      type: 'program',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 0 },
      text: '',
      childCount: 0,
      isNamed: true,
      child: () => null
    } as unknown as TreeSitterNode;
    
    const cursorDeleteCalled = { value: false };
    
    const cursor = {
      nodeType: 'program',
      nodeIsNamed: true,
      nodeIsMissing: false,
      nodeStartPosition: { row: 0, column: 0 },
      nodeEndPosition: { row: 0, column: 0 },
      nodeStartIndex: 0,
      nodeEndIndex: 0,
      currentNode: () => emptyRootNode,
      currentFieldName: () => null,
      delete: () => { cursorDeleteCalled.value = true; },
      gotoFirstChild: () => false,
      gotoNextSibling: () => false,
      gotoParent: () => false,
      gotoFirstChildForIndex: () => false,
      gotoFirstChildForPosition: () => false
    } as unknown as TreeCursor;
    
    const emptyTree: TestSyntaxTree = {
      rootNode: emptyRootNode,
      walk: () => cursor,
      getChangedRanges: () => [],
      getEditedRange: () => ({ 
        startPosition: { row: 0, column: 0 },
        endPosition: { row: 0, column: 0 },
        startIndex: 0,
        endIndex: 0
      }),
      getLanguage: () => ({}),
      cursorDeleteCalled
    };
    
    // Mock adapter map with just Program handler
    const adapterMap = {
      'Program': (cursor: TreeCursor): Program => {
        return {
          type: 'Program',
          position: {
            startLine: cursor.nodeStartPosition.row,
            startColumn: cursor.nodeStartPosition.column,
            endLine: cursor.nodeEndPosition.row,
            endColumn: cursor.nodeEndPosition.column
          },
          children: []
        };
      }
    };
    
    // Act
    const adaptTree = createCursorAdapter(adapterMap);
    const result = adaptTree(emptyTree) as Program;
    
    // Assert
    expect(result.type).toBe('Program');
    expect(result.children.length).toBe(0);
    
    // Verify cursor was properly cleaned up even with empty tree
    expect(emptyTree.cursorDeleteCalled.value).toBe(true);
  });

  it('should handle errors and still clean up cursor', () => {
    // Arrange
    const tree = createTestSyntaxTree();
    
    // Mock adapter map that will throw an error
    const adapterMap = {
      'Program': (cursor: TreeCursor): Program => {
        throw new Error('Test error');
      }
    };
    
    // Act & Assert
    const adaptTree = createCursorAdapter(adapterMap);
    expect(() => adaptTree(tree)).toThrow('Test error');
    
    // Verify cursor was still deleted even with error
    expect(tree.cursorDeleteCalled.value).toBe(true);
  });
});
