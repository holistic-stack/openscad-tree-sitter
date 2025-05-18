import { describe, it, expect } from 'vitest';
import { adaptCstToAst } from './adapt-cst-to-ast';
import { createTestTree } from './cursor-adapter/create-test-tree';
import { Program, ModuleDeclaration, CallExpression } from '../../types/ast-types';

describe('adaptCstToAst with cursor-based implementation', () => {
  it('should convert a Tree-sitter CST to an OpenSCAD AST using cursors', () => {
    // Arrange
    const tree = createTestTree();
    
    // Act
    const ast = adaptCstToAst(tree.rootNode) as Program;
    
    // Assert - check overall structure
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(2);
    
    // Check first child - module declaration
    const moduleNode = ast.children[0] as ModuleDeclaration;
    expect(moduleNode.type).toBe('ModuleDeclaration');
    expect(moduleNode.name).toBe('test');
    expect(moduleNode.parameters).toEqual([]);
    expect(moduleNode.body.type).toBe('BlockStatement');
    expect(moduleNode.body.statements).toEqual([]);
    
    // Check second child - call expression
    const callNode = ast.children[1] as CallExpression;
    expect(callNode.type).toBe('CallExpression');
    expect(callNode.callee.type).toBe('IdentifierExpression');
    expect(callNode.callee.name).toBe('test');
    expect(callNode.arguments).toEqual([]);
    
    // Check position information
    expect(ast.position).toBeDefined();
    expect(moduleNode.position).toBeDefined();
    expect(callNode.position).toBeDefined();
  });
  
  it('should handle an empty program', () => {
    // Arrange - Create an empty program node
    const emptyProgram = {
      type: 'program',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 0 },
      text: '',
      isNamed: true,
      childCount: 0,
      namedChildCount: 0,
      children: [],
      namedChildren: [],
      child: () => null,
      namedChild: () => null,
      toString: () => 'program'
    } as any;
    
    // Act
    const ast = adaptCstToAst(emptyProgram) as Program;
    
    // Assert
    expect(ast.type).toBe('Program');
    expect(ast.children.length).toBe(0);
    expect(ast.position).toBeDefined();
  });
});
