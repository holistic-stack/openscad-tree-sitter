/**
 * @file mockNodeFactory.ts
 * @description Factory functions for creating mock syntax nodes
 *
 * This file provides factory functions for creating mock syntax nodes with sensible defaults
 * that can be easily customized for specific test cases.
 *
 * @example
 * // Create a basic node
 * const node = mockNode({ type: 'identifier', text: 'foo' });
 *
 * // Create a node with children
 * const parentNode = mockNode({
 *   type: 'source_file',
 *   children: [
 *     mockNode({ type: 'identifier', text: 'foo' }),
 *     mockNode({ type: 'operator', text: '+' }),
 *     mockNode({ type: 'identifier', text: 'bar' })
 *   ]
 * });
 */

/**
 * Interface for a basic syntax node
 */
export interface SyntaxNode {
  type: string;
  text: string;
  childCount: number;
  child: (index: number) => SyntaxNode | null;
  descendantForPosition: (position: { row: number, column: number }) => SyntaxNode | null;
  childForFieldName?: (name: string) => SyntaxNode | null;
  [key: string]: any;
}

/**
 * Interface for a syntax tree
 */
export interface SyntaxTree {
  rootNode: SyntaxNode;
}

/**
 * Interface for mock syntax node options
 */
export interface MockNodeOptions {
  type: string;
  text?: string;
  childCount?: number;
  children?: SyntaxNode[];
  fieldName?: string;
  [key: string]: any;
}

/**
 * Create a mock syntax node with the given options
 *
 * @param options - The options for the mock node
 * @returns A mock syntax node
 *
 * @example
 * // Create a simple identifier node
 * const idNode = mockNode({ type: 'identifier', text: 'foo' });
 *
 * // Create a node with children
 * const parentNode = mockNode({
 *   type: 'binary_expression',
 *   text: 'a + b',
 *   childCount: 3,
 *   children: [
 *     mockNode({ type: 'identifier', text: 'a', fieldName: 'left' }),
 *     mockNode({ type: 'operator', text: '+', fieldName: 'operator' }),
 *     mockNode({ type: 'identifier', text: 'b', fieldName: 'right' })
 *   ]
 * });
 */
export function mockNode(options: MockNodeOptions): SyntaxNode {
  const { type, text = '', childCount = 0, children = [] } = options;

  // Create the base node
  const node: SyntaxNode = {
    type,
    text,
    childCount: children.length || childCount,

    // Methods
    child: (index: number) => children[index] || null,
    descendantForPosition: () => mockNode({ type: 'identifier', text: 'default' }),

    // Add any additional properties
    ...Object.keys(options)
      .filter(key => !['type', 'text', 'childCount', 'children'].includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: options[key] }), {})
  };

  // Add childForFieldName method if not already defined
  if (!node.childForFieldName) {
    node.childForFieldName = (name: string) => {
      // Try to find a child with the matching field name
      const child = children.find(c => c.fieldName === name);
      return child || mockNode({ type: 'unknown', text: name });
    };
  }

  return node;
}

/**
 * Create a mock root node for the given code
 *
 * @param code - The code being parsed
 * @returns A mock root node
 *
 * @example
 * const rootNode = mockRootNode('const x = 1;');
 */
export function mockRootNode(code: string): SyntaxNode {
  return mockNode({
    type: 'source_file',
    text: code,
    childCount: 0,
    children: []
  });
}

/**
 * Create a mock syntax tree for the given code
 *
 * @param code - The code being parsed
 * @returns A mock syntax tree
 *
 * @example
 * const tree = mockTree('const x = 1;');
 * const rootNode = tree.rootNode;
 */
export function mockTree(code: string): SyntaxTree {
  return {
    rootNode: mockRootNode(code)
  };
}
