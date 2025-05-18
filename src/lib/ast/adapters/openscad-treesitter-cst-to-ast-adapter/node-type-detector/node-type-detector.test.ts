import { describe, it, expect } from 'vitest';
import { detectNodeType } from './node-type-detector';
// Using a direct import path for the test file
import type { TreeSitterNode } from '../../../../../../src/lib/ast/types/cst-types';

// Create mock nodes for testing
const createMockNode = (type: string): TreeSitterNode => {
  return {
    type,
    id: 1,
    tree: {},
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 0 },
    startIndex: 0,
    endIndex: 0,
    text: '',
    isNamed: true,
    hasError: false,
    hasChanges: false,
    isMissing: false,
    parent: null,
    children: [],
    namedChildren: [],
    childCount: 0,
    namedChildCount: 0,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    nextSibling: null,
    previousSibling: null,
    nextNamedSibling: null,
    previousNamedSibling: null,
    child: () => null,
    namedChild: () => null,
    childForFieldName: () => null,
    childrenForFieldName: () => [],
    descendantsOfType: () => [],
    toString: () => ''
  } as TreeSitterNode;
};

describe('NodeTypeDetector', () => {
  it('should detect program nodes', () => {
    const node = createMockNode('program');
    expect(detectNodeType(node)).toBe('Program');
  });

  it('should detect call expression nodes', () => {
    const node = createMockNode('call_expression');
    expect(detectNodeType(node)).toBe('CallExpression');
  });

  it('should detect identifier nodes', () => {
    const node = createMockNode('identifier');
    expect(detectNodeType(node)).toBe('IdentifierExpression');
  });

  it('should detect number literal nodes', () => {
    const node = createMockNode('number_literal');
    expect(detectNodeType(node)).toBe('LiteralExpression');
  });

  it('should detect string literal nodes', () => {
    const node = createMockNode('string_literal');
    expect(detectNodeType(node)).toBe('LiteralExpression');
  });

  it('should detect boolean literal nodes', () => {
    const node = createMockNode('boolean_literal');
    expect(detectNodeType(node)).toBe('LiteralExpression');
  });

  it('should detect assignment nodes', () => {
    const node = createMockNode('assignment');
    expect(detectNodeType(node)).toBe('AssignmentStatement');
  });

  it('should detect module declaration nodes', () => {
    const node = createMockNode('module_declaration');
    expect(detectNodeType(node)).toBe('ModuleDeclaration');
  });

  it('should detect block statement nodes', () => {
    const node = createMockNode('block');
    expect(detectNodeType(node)).toBe('BlockStatement');
  });

  it('should detect if statement nodes', () => {
    const node = createMockNode('if_statement');
    expect(detectNodeType(node)).toBe('IfStatement');
  });

  it('should detect for statement nodes', () => {
    const node = createMockNode('for_statement');
    expect(detectNodeType(node)).toBe('ForStatement');
  });

  it('should detect binary expression nodes', () => {
    const node = createMockNode('binary_expression');
    expect(detectNodeType(node)).toBe('BinaryExpression');
  });

  it('should return Unknown for unsupported node types', () => {
    const node = createMockNode('unsupported_type');
    expect(detectNodeType(node)).toBe('Unknown');
  });
});
