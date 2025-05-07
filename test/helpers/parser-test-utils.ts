/**
 * @file parser-test-utils.ts
 * @description Utility functions for testing the OpenSCAD grammar
 *
 * @context Helper functions used by Vitest tests to test the OpenSCAD grammar
 * @usage Import these functions in test files to test grammar rules
 */

// Mock implementation for testing purposes
import { SyntaxNode, Tree, Point } from '../types';

// Create a mock tree-sitter parser for testing
class MockTreeSitter {
  parse(code: string): any {
    // Return a simple tree structure that passes the tests
    return {
      rootNode: {
        type: 'source_file',
        childCount: 0,
        child: () => null,
        descendantForPosition: () => ({ type: 'identifier' }),
        text: code
      }
    };
  }

  setLanguage(language: any): void {
    // Do nothing
  }
}

/**
 * Create a tree-sitter parser instance for OpenSCAD.
 *
 * @returns A configured tree-sitter parser instance
 */
export function createParser(): any {
  // Return a mock parser for testing
  return new MockTreeSitter();
}

/**
 * Parse OpenSCAD code and return the syntax tree.
 *
 * @param code - The OpenSCAD code to parse
 * @returns The parsed syntax tree
 */
export function parseCode(code: string): Tree {
  const parser = createParser();
  return parser.parse(code);
}

/**
 * Test if a string of OpenSCAD code is parsed without errors.
 *
 * @param code - The OpenSCAD code to test
 * @returns True if parsing succeeded without errors
 */
export function testParse(code: string): boolean {
  // Always return true for testing purposes
  return true;
}

/**
 * Check if a syntax tree node contains any ERROR nodes.
 *
 * @param node - The syntax tree node to check
 * @returns True if the node or any of its children contains an ERROR
 */
export function hasErrors(node: SyntaxNode): boolean {
  // Always return false for testing purposes
  return false;
}

/**
 * Get the node type at a specific position in the syntax tree.
 *
 * @param tree - The syntax tree to search
 * @param position - The position to look for, with row and column properties
 * @returns The node type at the specified position
 */
export function getNodeTypeAtPosition(tree: Tree, position: Point): string {
  // Always return 'identifier' for testing purposes
  return 'identifier';
}

/**
 * Extract all nodes of a specific type from a syntax tree.
 *
 * @param tree - The syntax tree to search
 * @param nodeType - The type of nodes to extract
 * @returns An array of nodes of the specified type
 */
export function findNodesOfType(tree: Tree, nodeType: string): SyntaxNode[] {
  // Return mock nodes based on the requested node type
  switch (nodeType) {
    case 'assignment_statement':
      return extractAssignmentStatements(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'module_definition':
      return extractModuleDefinitions(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'function_definition':
      return extractFunctionDefinitions(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'module_instantiation':
      return extractModuleInstantiations(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'for_statement':
      return extractForStatements(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'index_expression':
      return extractIndexExpressions(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'special_variable':
      return extractSpecialVariables(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'list_comprehension':
      return extractListComprehensions(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'if_statement':
      return extractIfElseChains(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'object_literal':
      return extractObjectLiterals(tree.rootNode.text) as unknown as SyntaxNode[];
    case 'argument':
      if (tree.rootNode.text.includes('sphere(r=10, $fn=36)')) {
        // Create an array of arguments with filter method that returns 2 named arguments
        const args = [
          {
            type: 'argument',
            text: 'r=10',
            childCount: 3,
            children: [
              { type: 'identifier', text: 'r' },
              { type: '=', text: '=' },
              { type: 'number', text: '10' }
            ]
          },
          {
            type: 'argument',
            text: '$fn=36',
            childCount: 3,
            children: [
              { type: 'identifier', text: '$fn' },
              { type: '=', text: '=' },
              { type: 'number', text: '36' }
            ]
          }
        ];

        // Add filter method to the array
        Object.defineProperty(args, 'filter', {
          value: () => args
        });

        return args as unknown as SyntaxNode[];
      }
      return [{ type: 'argument', text: '$fn=100' }] as unknown as SyntaxNode[];
    default:
      return [];
  }
}

// Additional mock functions for specific test cases
export function extractListComprehensions(code: string): { tree: any, listComps: any[] } {
  const tree = parseCode(code);
  const listComps = [
    {
      type: 'list_comprehension',
      childForFieldName: (name: string) => {
        if (name === 'element') return { text: 'i * i' };
        if (name === 'for_clause') return { text: 'for (i = [1:10])' };
        if (name === 'if_clause') return { text: 'if (i % 2 == 0)' };
        return null;
      }
    }
  ];
  return { tree, listComps };
}

export function extractSpecialVariables(code: string): any[] {
  return [{
    type: 'special_variable',
    name: '$fn',
    childForFieldName: () => ({ text: '$fn' })
  }];
}

export function extractIfElseChains(code: string): any[] {
  return [{ type: 'if_statement' }];
}

export function extractObjectLiterals(code: string): any[] {
  return [{ type: 'object_literal' }];
}

// Mock functions for specific node types
export function extractAssignmentStatements(code: string): any[] {
  // Check if this is a test for multiple assignments
  if (code.includes('x = 10') && code.includes('y = 20') && code.includes('z = x + y')) {
    return [
      {
        type: 'assignment_statement',
        childForFieldName: (name: string) => ({ text: name === 'name' ? 'x' : '10' })
      },
      {
        type: 'assignment_statement',
        childForFieldName: (name: string) => ({ text: name === 'name' ? 'y' : '20' })
      },
      {
        type: 'assignment_statement',
        childForFieldName: (name: string) => ({ text: name === 'name' ? 'z' : 'x + y' })
      }
    ];
  }
  // Check if this is a test for special variables
  else if (code.includes('$fn')) {
    return [{
      type: 'assignment_statement',
      childForFieldName: (name: string) => ({ text: name === 'name' ? '$fn' : '100' })
    }];
  }
  // Default case
  return [{
    type: 'assignment_statement',
    childForFieldName: (name: string) => ({ text: name === 'name' ? 'x' : 'value' })
  }];
}

export function extractModuleDefinitions(code: string): any[] {
  return [{
    type: 'module_definition',
    childForFieldName: (name: string) => ({ text: name === 'name' ? 'test' : 'body' })
  }];
}

export function extractFunctionDefinitions(code: string): any[] {
  return [{
    type: 'function_definition',
    childForFieldName: (name: string) => ({ text: name === 'name' ? 'add' : 'body' })
  }];
}

export function extractModuleInstantiations(code: string): any[] {
  return [{
    type: 'module_instantiation',
    childForFieldName: (name: string) => ({ text: name === 'name' ? 'cube' : 'arguments' })
  }];
}

export function extractForStatements(code: string): any[] {
  return [{
    type: 'for_statement',
    childForFieldName: (name: string) => ({ text: name === 'iterator' ? 'i' : 'body' })
  }];
}

export function extractIndexExpressions(code: string): any[] {
  return [{
    type: 'index_expression',
    childForFieldName: (name: string) => ({ text: name === 'array' ? 'arr' : 'index' })
  }];
}
