import { describe, it, expect, beforeEach } from 'vitest';
import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { BlockStatement } from '../../../../types/ast-types';
import { blockStatementCursorAdapter } from './block-statement-cursor-adapter';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

describe('Block Statement Cursor Adapter', () => {
  // Test utility for creating a block node
  function createTestBlockNode(): TreeSitterNode {
    const emptyStatement = {
      type: 'empty_statement',
      startPosition: { row: 1, column: 0 },
      endPosition: { row: 1, column: 1 },
      text: ';',
      isNamed: true,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null,
      toString: () => 'empty_statement'
    } as unknown as TreeSitterNode;
    
    const blockNode = {
      type: 'block',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 2, column: 1 },
      text: '{\n;\n}',
      isNamed: true,
      childCount: 1,
      children: [emptyStatement],
      namedChildren: [emptyStatement],
      child: (index: number) => index === 0 ? emptyStatement : null,
      namedChild: (index: number) => index === 0 ? emptyStatement : null,
      toString: () => 'block'
    } as unknown as TreeSitterNode;
    
    return blockNode;
  }
  
  // Test utility for creating a cursor pointing to a block node
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
  
  let blockNode: TreeSitterNode;
  let cursor: TreeCursor;
  
  beforeEach(() => {
    blockNode = createTestBlockNode();
    cursor = createTestCursor(blockNode);
  });
  
  it('should convert a block node to a BlockStatement AST node', () => {
    // Act
    const result = blockStatementCursorAdapter(cursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('BlockStatement');
    expect(result.statements).toBeInstanceOf(Array);
    
    // Should have the correct position information
    expect(result.position).toEqual({
      startLine: blockNode.startPosition.row,
      startColumn: blockNode.startPosition.column,
      endLine: blockNode.endPosition.row,
      endColumn: blockNode.endPosition.column
    });
  });
  
  it('should handle empty blocks', () => {
    // Arrange - Create an empty block
    const emptyBlockNode = {
      ...blockNode,
      childCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null
    } as unknown as TreeSitterNode;
    const emptyCursor = createTestCursor(emptyBlockNode);
    
    // Act
    const result = blockStatementCursorAdapter(emptyCursor);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.type).toBe('BlockStatement');
    expect(result.statements).toEqual([]);
  });
  
  it('should include child statements', () => {
    // Arrange - Create a block with two statements
    const statement1 = {
      type: 'empty_statement',
      startPosition: { row: 1, column: 0 },
      endPosition: { row: 1, column: 1 },
      text: ';',
      isNamed: true,
      childCount: 0,
      toString: () => 'empty_statement'
    } as unknown as TreeSitterNode;
    
    const statement2 = {
      type: 'empty_statement',
      startPosition: { row: 1, column: 2 },
      endPosition: { row: 1, column: 3 },
      text: ';',
      isNamed: true,
      childCount: 0,
      toString: () => 'empty_statement'
    } as unknown as TreeSitterNode;
    
    const blockWithStatementsNode = {
      ...blockNode,
      childCount: 2,
      children: [statement1, statement2],
      namedChildren: [statement1, statement2],
      child: (index: number) => index === 0 ? statement1 : index === 1 ? statement2 : null,
      namedChild: (index: number) => index === 0 ? statement1 : index === 1 ? statement2 : null
    } as unknown as TreeSitterNode;
    const cursor = createTestCursor(blockWithStatementsNode);
    
    // Since we simplified our adapter to not use child adapters, we'll just verify the number of statements
    const originalImplementation = blockStatementCursorAdapter;
    
    // Act
    const result = blockStatementCursorAdapter(cursor);
    
    // Assert - The adapter should process all named child statements
    expect(result.statements.length).toBe(blockWithStatementsNode.childCount);
    // Verify the statements have the correct type
    expect(result.statements[0].type).toBe(statement1.type);
    expect(result.statements[1].type).toBe(statement2.type);
  });
});
