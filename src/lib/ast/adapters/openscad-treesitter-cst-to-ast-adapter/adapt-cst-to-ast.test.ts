import { describe, it, expect } from 'vitest';
import { adaptCstToAst } from './adapt-cst-to-ast';
import { TreeSitterNode } from '../../types/cst-types';
import { ASTNode, Program } from '../../types/ast-types';

// Mock TreeSitterNode for testing
const createMockNode = (
  type: string,
  text: string,
  startPosition = { row: 0, column: 0 },
  endPosition = { row: 0, column: text.length },
  children: TreeSitterNode[] = []
): TreeSitterNode => {
  const node: Partial<TreeSitterNode> = {
    id: Math.floor(Math.random() * 1000),
    type,
    text,
    startPosition,
    endPosition,
    startIndex: 0,
    endIndex: text.length,
    isNamed: true,
    hasError: false,
    hasChanges: false,
    isMissing: false,
    parent: null,
    children,
    namedChildren: children.filter(child => child.isNamed),
    childCount: children.length,
    namedChildCount: children.filter(child => child.isNamed).length,
    firstChild: children.length > 0 ? children[0] : null,
    lastChild: children.length > 0 ? children[children.length - 1] : null,
    firstNamedChild: children.filter(child => child.isNamed).length > 0 
      ? children.filter(child => child.isNamed)[0] 
      : null,
    lastNamedChild: children.filter(child => child.isNamed).length > 0 
      ? children.filter(child => child.isNamed)[children.filter(child => child.isNamed).length - 1] 
      : null,
    nextSibling: null,
    previousSibling: null,
    nextNamedSibling: null,
    previousNamedSibling: null,
    child: (index) => (index < children.length ? children[index] : null),
    namedChild: (index) => {
      const namedChildren = children.filter(child => child.isNamed);
      return index < namedChildren.length ? namedChildren[index] : null;
    },
    childForFieldName: () => null,
    childrenForFieldName: () => [],
    descendantsOfType: () => [],
    toString: () => text
  };

  return node as TreeSitterNode;
};

describe('adaptCstToAst', () => {
  it('should convert a simple program node', () => {
    // Arrange: Create a simple program CST node
    const rootNode = createMockNode('program', 'cube();', 
      { row: 0, column: 0 },
      { row: 0, column: 7 },
      [
        createMockNode('call_expression', 'cube()', 
          { row: 0, column: 0 },
          { row: 0, column: 6 },
          [
            createMockNode('identifier', 'cube', 
              { row: 0, column: 0 },
              { row: 0, column: 4 }
            ),
            createMockNode('argument_list', '()', 
              { row: 0, column: 4 },
              { row: 0, column: 6 }
            )
          ]
        ),
        createMockNode(';', ';', 
          { row: 0, column: 6 },
          { row: 0, column: 7 }
        )
      ]
    );

    // Act: Convert CST to AST
    const ast = adaptCstToAst(rootNode);

    // Assert: Check the structure of the AST
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');

    const program = ast as Program;
    expect(program.children.length).toBe(1);
    
    // Check position data
    expect(program.position).toEqual({
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 7
    });

    // Check the call expression
    const callExpr = program.children[0];
    expect(callExpr.type).toBe('CallExpression');
  });

  it('should handle empty program', () => {
    // Arrange: Create an empty program CST node
    const rootNode = createMockNode('program', '', 
      { row: 0, column: 0 },
      { row: 0, column: 0 },
      []
    );

    // Act: Convert CST to AST
    const ast = adaptCstToAst(rootNode);

    // Assert: Check the structure of the AST
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');

    const program = ast as Program;
    expect(program.children.length).toBe(0);
  });

  it('should convert a variable assignment', () => {
    // Arrange: Create a variable assignment CST node
    const rootNode = createMockNode('program', 'x = 10;', 
      { row: 0, column: 0 },
      { row: 0, column: 7 },
      [
        createMockNode('assignment', 'x = 10', 
          { row: 0, column: 0 },
          { row: 0, column: 6 },
          [
            createMockNode('identifier', 'x', 
              { row: 0, column: 0 },
              { row: 0, column: 1 }
            ),
            createMockNode('=', '=', 
              { row: 0, column: 2 },
              { row: 0, column: 3 }
            ),
            createMockNode('number_literal', '10', 
              { row: 0, column: 4 },
              { row: 0, column: 6 }
            )
          ]
        ),
        createMockNode(';', ';', 
          { row: 0, column: 6 },
          { row: 0, column: 7 }
        )
      ]
    );

    // Act: Convert CST to AST
    const ast = adaptCstToAst(rootNode);

    // Assert: Check the structure of the AST
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');

    const program = ast as Program;
    expect(program.children.length).toBe(1);
    
    // Check the assignment statement
    const assignment = program.children[0];
    expect(assignment.type).toBe('AssignmentStatement');
  });
});
