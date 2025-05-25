import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Node as TSNode } from 'web-tree-sitter';

import { BinaryExpressionVisitor } from './binary-expression-visitor';
import { ExpressionVisitor } from '../../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { EnhancedOpenscadParser } from '../../../../enhanced-parser';

describe('SimpleBinaryExpressionTest', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: BinaryExpressionVisitor;

  beforeEach(async () => {
    parser = new EnhancedOpenscadParser();
    await parser.init();

    errorHandler = new ErrorHandler();
    parentExpressionVisitor = new ExpressionVisitor('test source', errorHandler);
    visitor = new BinaryExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should handle simple addition with direct AST parsing', () => {
    // Use valid OpenSCAD statement (assignment) instead of standalone expression
    const code = 'x = 1 + 2;';
    console.log('Testing code:', code);

    try {
      const ast = parser.parseAST(code);
      console.log('Generated AST:', JSON.stringify(ast, null, 2));

      // The AST should contain the assignment statement
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      console.log('Test completed successfully');
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });

  it('should handle simple number parsing', () => {
    // Test number in valid OpenSCAD statement
    const code = 'y = 42;';
    console.log('Testing number code:', code);

    try {
      const ast = parser.parseAST(code);
      console.log('Generated number AST:', JSON.stringify(ast, null, 2));

      expect(ast).toBeDefined();
      console.log('Number test completed successfully');
    } catch (error) {
      console.error('Number test failed with error:', error);
      throw error;
    }
  });
});
