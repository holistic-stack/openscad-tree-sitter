import { describe, it, expect } from 'vitest';
import { ASTNode, Program, ModuleDeclaration, CallExpression, IdentifierExpression } from '../../../types/ast-types';
import { createCursorAdapter } from './cursor-adapter-factory';
import { extractPositionFromCursor } from '../position-extractor/cursor-position-extractor';
import { createTestTree } from './create-test-tree';
import { TreeCursor } from '../../../types';

describe('Cursor Adapter Integration', () => {
  it('should integrate with adaptCstToAst using cursor-based approach', () => {
    // Create a test syntax tree with accurate cursor implementation
    const testTree = createTestTree();
    
    // Create adapters that use the cursor position extractor
    const adapterMap = {
      'Program': (cursor: TreeCursor): Program => {
        return {
          type: 'Program',
          position: extractPositionFromCursor(cursor),
          children: []
        };
      },
      'ModuleDeclaration': (cursor: TreeCursor): ModuleDeclaration => {
        return {
          type: 'ModuleDeclaration',
          position: extractPositionFromCursor(cursor),
          name: 'test',
          parameters: [],
          body: {
            type: 'BlockStatement',
            position: extractPositionFromCursor(cursor),
            statements: []
          }
        };
      },
      'CallExpression': (cursor: TreeCursor): CallExpression => {
        const callee: IdentifierExpression = {
          type: 'IdentifierExpression',
          name: 'test',
          position: extractPositionFromCursor(cursor)
        };
        
        return {
          type: 'CallExpression',
          position: extractPositionFromCursor(cursor),
          callee,
          arguments: []
        };
      }
    };
    
    // Create the adapter function using our cursor-based factory
    const adaptCstToAst = createCursorAdapter(adapterMap);
    
    // Run the conversion
    const result = adaptCstToAst(testTree) as Program;
    
    // Verify the converted AST
    expect(result.type).toBe('Program');
    expect(result.children.length).toBe(2);
    expect(result.children[0].type).toBe('ModuleDeclaration');
    expect((result.children[0] as ModuleDeclaration).name).toBe('test');
    expect(result.children[1].type).toBe('CallExpression');
    expect(((result.children[1] as CallExpression).callee).name).toBe('test');
    
    // Verify that the cursor was properly deleted (memory cleanup)
    expect((testTree as any).cursorDeleteCalled.value).toBe(true);
  });
});
