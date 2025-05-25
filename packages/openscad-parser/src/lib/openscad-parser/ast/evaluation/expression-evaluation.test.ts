import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '../../enhanced-parser';
import { ErrorHandler } from '../../error-handling';
import { extractCubeNode } from '../extractors/cube-extractor';

describe('Enhanced Expression Evaluation', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    parser = new EnhancedOpenscadParser();
    await parser.init();
    errorHandler = new ErrorHandler();
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should evaluate binary expressions in cube arguments', () => {
    const code = 'cube(1 + 2);';
    console.log('Testing binary expression in cube:', code);

    const tree = parser.parse(code);
    expect(tree).toBeDefined();

    // Find the cube function call
    function findCubeNode(node: any): any {
      console.log(`Checking node: ${node.type} - "${node.text}"`);
      if ((node.type === 'module_instantiation' || node.type === 'accessor_expression') &&
          node.text.includes('cube')) {
        console.log(`Found potential cube node: ${node.type}`);
        return node;
      }
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          const result = findCubeNode(child);
          if (result) return result;
        }
      }
      return null;
    }

    const cubeNode = findCubeNode(tree.rootNode);
    console.log('Cube node search result:', cubeNode);
    expect(cubeNode).not.toBeNull();

    console.log('Found cube node:', cubeNode.type, cubeNode.text);

    // Extract the cube with enhanced expression evaluation
    const cubeAST = extractCubeNode(cubeNode, errorHandler);

    console.log('Extracted cube AST:', JSON.stringify(cubeAST, null, 2));
    console.log('Error handler errors:', errorHandler.getErrors());

    expect(cubeAST).toBeDefined();
    expect(cubeAST?.size).toBe(3); // 1 + 2 = 3
  });

  it('should evaluate complex binary expressions', () => {
    const code = 'cube(2 * 3 + 1);';
    console.log('Testing complex binary expression in cube:', code);

    const tree = parser.parse(code);
    expect(tree).toBeDefined();

    // Find the cube function call
    function findCubeNode(node: any): any {
      if ((node.type === 'module_instantiation' || node.type === 'accessor_expression') &&
          node.text.includes('cube')) {
        return node;
      }
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          const result = findCubeNode(child);
          if (result) return result;
        }
      }
      return null;
    }

    const cubeNode = findCubeNode(tree.rootNode);
    expect(cubeNode).not.toBeNull();

    console.log('Found cube node:', cubeNode.type, cubeNode.text);

    // Extract the cube with enhanced expression evaluation
    const cubeAST = extractCubeNode(cubeNode, errorHandler);

    console.log('Extracted cube AST:', JSON.stringify(cubeAST, null, 2));
    console.log('Error handler errors:', errorHandler.getErrors());

    expect(cubeAST).toBeDefined();
    expect(cubeAST?.size).toBe(7); // 2 * 3 + 1 = 7
  });

  it('should handle simple numbers without expression evaluation', () => {
    const code = 'cube(5);';
    console.log('Testing simple number in cube:', code);

    const tree = parser.parse(code);
    expect(tree).toBeDefined();

    // Find the cube function call
    function findCubeNode(node: any): any {
      if ((node.type === 'module_instantiation' || node.type === 'accessor_expression') &&
          node.text.includes('cube')) {
        return node;
      }
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          const result = findCubeNode(child);
          if (result) return result;
        }
      }
      return null;
    }

    const cubeNode = findCubeNode(tree.rootNode);
    expect(cubeNode).not.toBeNull();

    console.log('Found cube node:', cubeNode.type, cubeNode.text);

    // Extract the cube with enhanced expression evaluation
    const cubeAST = extractCubeNode(cubeNode, errorHandler);

    console.log('Extracted cube AST:', JSON.stringify(cubeAST, null, 2));
    console.log('Error handler errors:', errorHandler.getErrors());

    expect(cubeAST).toBeDefined();
    expect(cubeAST?.size).toBe(5); // Simple number
  });
});
