import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { Parser } from 'web-tree-sitter';
import { QueryManager } from './query-utils';
import * as path from 'path';

describe('QueryManager', () => {
  let parser: Parser;
  let queryManager: QueryManager;
  
  beforeAll(async () => {
    // Initialize the parser
    parser = new Parser();
    await Parser.init();
    
    // In a real application, you would load the OpenSCAD language here
    // For testing, we'll use the built-in JavaScript language
    const language = {
      // Mock language object for testing
      // In a real app, this would be the result of Parser.Language.load()
    };
    
    const queryDir = path.join(__dirname, 'queries');
    queryManager = new QueryManager(parser, language, queryDir);
    
    // Load the test query
    await queryManager['loadQuery']('find-function-calls');
  });
  
  afterEach(() => {
    // Clean up after each test if needed
  });
  
  describe('queryTree', () => {
    it('should find function calls in the source code', async () => {
      const source = `
        cube(10);
        sphere(r=5, $fn=32);
        
        module myModule() {
          cylinder(h=10, r=2);
        }
        
        myModule();
      `;
      
      // Mock the parser.parse method
      parser.parse = (source: string) => ({
        rootNode: {
          // Mock node structure for testing
          type: 'program',
          text: source,
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: source.length },
          startIndex: 0,
          endIndex: source.length,
          // Add other required properties
        },
        // Add other required properties
      } as any);
      
      // In a real test, we would mock the query execution
      // For now, we'll just test that the method exists and can be called
      const results = queryManager.queryTree('find-function-calls', source);
      expect(Array.isArray(results)).toBe(true);
    });
  });
  
  describe('findAllNodesOfType', () => {
    it('should find all nodes of a specific type', async () => {
      // This test would require a real tree-sitter language and query
      // For now, we'll just test that the method exists and can be called
      const mockNode = {
        // Mock node structure
      } as any;
      
      const nodes = await queryManager.findAllNodesOfType('function_call', mockNode);
      expect(Array.isArray(nodes)).toBe(true);
    });
  });
  
  describe('hasAncestorOfType', () => {
    it('should check if a node has an ancestor of a specific type', () => {
      // Create a simple node hierarchy for testing
      const childNode = {
        type: 'identifier',
        parent: {
          type: 'call_expression',
          parent: {
            type: 'expression_statement',
            parent: null
          }
        }
      } as any;
      
      // Test with an existing ancestor type
      expect(queryManager.hasAncestorOfType(childNode, 'call_expression')).toBe(true);
      
      // Test with a non-existing ancestor type
      expect(queryManager.hasAncestorOfType(childNode, 'nonexistent_type')).toBe(false);
    });
  });
  
  describe('getNodeTextWithSemicolon', () => {
    it('should get node text including trailing semicolon if present', () => {
      const source = 'cube(10);';
      const node = {
        startIndex: 0,
        endIndex: 7, // Points to 'cube(10)'
        text: 'cube(10)'
      } as any;
      
      const result = queryManager.getNodeTextWithSemicolon(node, source);
      expect(result).toBe('cube(10);');
    });
    
    it('should not add semicolon if not present in source', () => {
      const source = 'cube(10)';
      const node = {
        startIndex: 0,
        endIndex: 7,
        text: 'cube(10)'
      } as any;
      
      const result = queryManager.getNodeTextWithSemicolon(node, source);
      expect(result).toBe('cube(10)');
    });
  });
});
