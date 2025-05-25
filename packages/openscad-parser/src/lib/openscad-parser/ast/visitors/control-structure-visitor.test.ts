import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ControlStructureVisitor } from './control-structure-visitor';
import { EnhancedOpenscadParser } from '../../enhanced-parser';
import { Node as TSNode } from 'web-tree-sitter';
import * as extractorModule from '../extractors';
import { getLocation } from '../utils/location-utils';
import { ErrorHandler } from '../../error-handling';

describe('ControlStructureVisitor', () => {
  let visitor: ControlStructureVisitor;
  let parser: EnhancedOpenscadParser;

  beforeEach(async () => {
    // Mock the extractArguments function
    vi.spyOn(extractorModule, 'extractArguments').mockImplementation(
      (node: TSNode) => {
        if (node.text.includes('true')) {
          return [
            {
              name: undefined,
              value: {
                type: 'expression',
                expressionType: 'literal',
                value: 'true',
                location: getLocation(node),
              },
            },
          ];
        } else if (node.text.includes('i = [0:10]')) {
          return [
            {
              name: 'i',
              value: {
                type: 'expression',
                expressionType: 'literal',
                value: '[0:10]',
                location: getLocation(node),
              },
            },
          ];
        }
        return [];
      }
    );

    const errorHandler = new ErrorHandler();
    visitor = new ControlStructureVisitor('', errorHandler);
    parser = new EnhancedOpenscadParser();
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
    vi.clearAllMocks();
  });

  describe('createASTNodeForFunction', () => {
    it('should create an if node with condition', () => {
      // Create a mock if node
      const mockIfNode = {
        type: 'module_instantiation',
        text: 'if (true) { cube(10); }',
        childCount: 3,
        child: (index: number) => {
          if (index === 0) {
            return {
              type: 'identifier',
              text: 'if',
              childCount: 0,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          } else if (index === 1) {
            return {
              type: 'argument_list',
              text: '(true)',
              childCount: 1,
              child: () => ({
                type: 'true',
                text: 'true',
                childCount: 0,
                child: () => null,
                childForFieldName: () => null,
                namedChildren: [],
              }),
              childForFieldName: () => null,
              namedChildren: [
                {
                  type: 'true',
                  text: 'true',
                  childCount: 0,
                  child: () => null,
                  childForFieldName: () => null,
                  namedChildren: [],
                },
              ],
            };
          } else if (index === 2) {
            return {
              type: 'block',
              text: '{ cube(10); }',
              childCount: 3,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          }
          return null;
        },
        childForFieldName: (name: string) => {
          if (name === 'name') {
            return {
              type: 'identifier',
              text: 'if',
              childCount: 0,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          } else if (name === 'arguments') {
            return {
              type: 'argument_list',
              text: '(true)',
              childCount: 1,
              child: () => ({
                type: 'true',
                text: 'true',
                childCount: 0,
                child: () => null,
                childForFieldName: () => null,
                namedChildren: [],
              }),
              childForFieldName: () => null,
              namedChildren: [
                {
                  type: 'true',
                  text: 'true',
                  childCount: 0,
                  child: () => null,
                  childForFieldName: () => null,
                  namedChildren: [],
                },
              ],
            };
          } else if (name === 'block') {
            return {
              type: 'block',
              text: '{ cube(10); }',
              childCount: 3,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          }
          return null;
        },
        namedChildren: [
          {
            type: 'identifier',
            text: 'if',
            childCount: 0,
            child: () => null,
            childForFieldName: () => null,
            namedChildren: [],
          },
          {
            type: 'argument_list',
            text: '(true)',
            childCount: 1,
            child: () => ({
              type: 'true',
              text: 'true',
              childCount: 0,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            }),
            childForFieldName: () => null,
            namedChildren: [
              {
                type: 'true',
                text: 'true',
                childCount: 0,
                child: () => null,
                childForFieldName: () => null,
                namedChildren: [],
              },
            ],
          },
          {
            type: 'block',
            text: '{ cube(10); }',
            childCount: 3,
            child: () => null,
            childForFieldName: () => null,
            namedChildren: [],
          },
        ],
      } as unknown as TSNode;

      // Visit the node
      const result = visitor.visitModuleInstantiation(mockIfNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('if');
      expect((result as any).condition).toBeDefined();
      expect((result as any).condition.type).toBe('expression');
      expect((result as any).condition.expressionType).toBe('literal');
      expect((result as any).condition.value).toBe('true');
      expect((result as any).thenBranch).toEqual([]);
    });

    it('should create a for loop node with variables', () => {
      // Create a mock for loop node
      const mockForNode = {
        type: 'module_instantiation',
        text: 'for (i = [0:10]) { cube(i); }',
        childCount: 3,
        child: (index: number) => {
          if (index === 0) {
            return {
              type: 'identifier',
              text: 'for',
              childCount: 0,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          } else if (index === 1) {
            return {
              type: 'argument_list',
              text: '(i = [0:10])',
              childCount: 1,
              child: () => ({
                type: 'named_argument',
                text: 'i = [0:10]',
                childCount: 3,
                child: (j: number) => {
                  if (j === 0) {
                    return {
                      type: 'identifier',
                      text: 'i',
                      childCount: 0,
                      child: () => null,
                      childForFieldName: () => null,
                      namedChildren: [],
                    };
                  } else if (j === 1) {
                    return {
                      type: 'equals',
                      text: '=',
                      childCount: 0,
                      child: () => null,
                      childForFieldName: () => null,
                      namedChildren: [],
                    };
                  } else if (j === 2) {
                    return {
                      type: 'range_expression',
                      text: '[0:10]',
                      childCount: 0,
                      child: () => null,
                      childForFieldName: () => null,
                      namedChildren: [],
                    };
                  }
                  return null;
                },
                childForFieldName: (name: string) => {
                  if (name === 'name') {
                    return {
                      type: 'identifier',
                      text: 'i',
                      childCount: 0,
                      child: () => null,
                      childForFieldName: () => null,
                      namedChildren: [],
                    };
                  } else if (name === 'value') {
                    return {
                      type: 'range_expression',
                      text: '[0:10]',
                      childCount: 0,
                      child: () => null,
                      childForFieldName: () => null,
                      namedChildren: [],
                    };
                  }
                  return null;
                },
                namedChildren: [
                  {
                    type: 'identifier',
                    text: 'i',
                    childCount: 0,
                    child: () => null,
                    childForFieldName: () => null,
                    namedChildren: [],
                  },
                  {
                    type: 'equals',
                    text: '=',
                    childCount: 0,
                    child: () => null,
                    childForFieldName: () => null,
                    namedChildren: [],
                  },
                  {
                    type: 'range_expression',
                    text: '[0:10]',
                    childCount: 0,
                    child: () => null,
                    childForFieldName: () => null,
                    namedChildren: [],
                  },
                ],
              }),
              childForFieldName: () => null,
              namedChildren: [
                {
                  type: 'named_argument',
                  text: 'i = [0:10]',
                  childCount: 3,
                  child: () => null,
                  childForFieldName: () => null,
                  namedChildren: [],
                },
              ],
            };
          } else if (index === 2) {
            return {
              type: 'block',
              text: '{ cube(i); }',
              childCount: 3,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          }
          return null;
        },
        childForFieldName: (name: string) => {
          if (name === 'name') {
            return {
              type: 'identifier',
              text: 'for',
              childCount: 0,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          } else if (name === 'arguments') {
            return {
              type: 'argument_list',
              text: '(i = [0:10])',
              childCount: 1,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          } else if (name === 'block') {
            return {
              type: 'block',
              text: '{ cube(i); }',
              childCount: 3,
              child: () => null,
              childForFieldName: () => null,
              namedChildren: [],
            };
          }
          return null;
        },
        namedChildren: [
          {
            type: 'identifier',
            text: 'for',
            childCount: 0,
            child: () => null,
            childForFieldName: () => null,
            namedChildren: [],
          },
          {
            type: 'argument_list',
            text: '(i = [0:10])',
            childCount: 1,
            child: () => null,
            childForFieldName: () => null,
            namedChildren: [],
          },
          {
            type: 'block',
            text: '{ cube(i); }',
            childCount: 3,
            child: () => null,
            childForFieldName: () => null,
            namedChildren: [],
          },
        ],
      } as unknown as TSNode;

      // Visit the node
      const result = visitor.visitModuleInstantiation(mockForNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('for_loop');
      expect((result as any).variables).toHaveLength(1);
      expect((result as any).variables[0].variable).toBe('i');
      expect((result as any).variables[0].range).toBeDefined();
      expect((result as any).body).toEqual([]);
    });
  });
});
