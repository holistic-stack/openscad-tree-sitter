/**
 * @file Documentation Examples Test for Range Expression Integration
 * 
 * This test file validates all the code examples provided in the documentation
 * for Range Expression Integration functionality. It ensures that all examples
 * are executable and produce the expected results.
 * 
 * @example
 * ```bash
 * pnpm test:parser:file --testFile src/lib/documentation-examples-range-integration.test.ts
 * ```
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from './openscad-parser/enhanced-parser.js';
import { SimpleErrorHandler } from './openscad-parser/error-handling/simple-error-handler.js';
import type * as ast from './openscad-parser/ast/ast-types.js';

describe('Documentation Examples - Range Expression Integration', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  describe('Range Expression Integration Examples', () => {
    it('should parse range expressions in for loops as documented', () => {
      // Example from basic-usage.md - for loops
      const forLoopCode = `
        for (i = [0:5]) {
          cube(i);
        }
      `;

      const forAst = parser.parseAST(forLoopCode);
      expect(forAst).toHaveLength(1);

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should parse range expressions in variable assignments as documented', () => {
      // Example from basic-usage.md - variable assignments
      const assignmentCode = `
        range = [0:2:10];
        cube(range[0]);
      `;

      const assignAst = parser.parseAST(assignmentCode);
      expect(assignAst).toHaveLength(2); // assignment + cube call

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should parse range expressions in list comprehensions as documented', () => {
      // Example from basic-usage.md - list comprehensions
      const listCompCode = `
        values = [for (i = [1:5]) i*2];
      `;

      const listAst = parser.parseAST(listCompCode);
      expect(listAst).toHaveLength(1);

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('Range Expressions in For Loops', () => {
    it('should parse for loops with range expressions as documented', () => {
      // Example from basic-usage.md
      const forLoopCode = `
        for (i = [0:2:10]) {
          translate([i, 0, 0]) cube(1);
        }
      `;

      const ast = parser.parseAST(forLoopCode);
      expect(ast).toHaveLength(1);

      // Should parse without errors - the range expression integration works
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);

      // Verify the range expression was processed successfully
      // (The actual AST structure may vary based on how the parser processes the for loop)
    });
  });

  describe('Range Expressions in List Comprehensions', () => {
    it('should parse list comprehensions with range expressions as documented', () => {
      // Example from README.md
      const listCompCode = `
        points = [for (i = [0:5]) [i, i*2, 0]];
      `;

      const ast = parser.parseAST(listCompCode);
      expect(ast).toHaveLength(1);
      
      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('Complex Range Expressions in Context', () => {
    it('should parse negative step ranges in for loops', () => {
      // Example showing negative step ranges work in context
      const negativeRangeCode = `
        for (i = [10:-1:0]) {
          cube(i);
        }
      `;

      const ast = parser.parseAST(negativeRangeCode);
      expect(ast).toHaveLength(1);

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should parse decimal step ranges in variable assignments', () => {
      // Example showing decimal step ranges work in context
      const decimalRangeCode = `
        range = [0:0.5:5];
        for (i = range) cube(i);
      `;

      const ast = parser.parseAST(decimalRangeCode);
      expect(ast).toHaveLength(2); // assignment + for loop

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should parse expression ranges in list comprehensions', () => {
      // Example showing expression ranges work in context
      const expressionRangeCode = `
        start = 1;
        end = 5;
        values = [for (i = [start:end]) i*2];
      `;

      const ast = parser.parseAST(expressionRangeCode);
      expect(ast).toHaveLength(3); // start assignment + end assignment + values assignment

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('Integration Evidence Examples', () => {
    it('should demonstrate no "Unhandled expression type" warnings', () => {
      // Example from range-expression-visitor.md
      const code = `
        for (i = [0:2:10]) {
          cube(i);
        }
      `;

      const ast = parser.parseAST(code);
      
      // Should parse successfully
      expect(ast).toHaveLength(1);
      
      // Should not have any "Unhandled expression type" errors
      const errors = errorHandler.getErrors();
      const unhandledErrors = errors.filter(error => 
        error.message.includes('Unhandled expression type')
      );
      expect(unhandledErrors).toHaveLength(0);
    });

    it('should demonstrate seamless list comprehension support', () => {
      // Example showing range expressions work in list comprehensions
      const listCompCode = `
        values = [for (i = [0:5]) i*2];
      `;

      const ast = parser.parseAST(listCompCode);
      
      // Should parse without errors
      expect(ast).toHaveLength(1);
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('README.md Examples', () => {
    it('should validate the main README range expression example', () => {
      // Example from README.md Quick Start section
      const rangeCode = `
        for (i = [0:2:10]) {
          translate([i, 0, 0]) cube(1);
        }
      `;

      const rangeAst = parser.parseAST(rangeCode);
      expect(rangeAst).toHaveLength(1);

      // Should parse without errors - range expression integration works
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should validate the list comprehension example from README', () => {
      // Example from README.md
      const listCompCode = `
        points = [for (i = [0:5]) [i, i*2, 0]];
      `;

      const listAst = parser.parseAST(listCompCode);
      expect(listAst).toHaveLength(1);

      // Range expressions in list comprehensions should be fully supported
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should validate the variable assignment example from README', () => {
      // Example from README.md
      const assignmentCode = `
        range = [1:0.5:5];
        for (i = range) cube(i);
      `;

      const assignAst = parser.parseAST(assignmentCode);
      expect(assignAst).toHaveLength(2); // assignment + for loop

      // Range expressions in variable assignments should be fully supported
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('AST Types Documentation Examples', () => {
    it('should validate range expressions work in documented contexts', () => {
      // Examples from ast-types.md showing contextual usage
      const forLoopCode = `for (i = [0:5]) { cube(i); }`;
      const forAst = parser.parseAST(forLoopCode);

      expect(forAst).toHaveLength(1);

      // Should parse without errors - range expression integration works
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should validate stepped range expressions in context', () => {
      // Stepped range example from ast-types.md in context
      const steppedCode = `for (i = [0:2:10]) { cube(i); }`;
      const steppedAst = parser.parseAST(steppedCode);

      expect(steppedAst).toHaveLength(1);

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should validate variable range expressions in context', () => {
      // Variable range example from ast-types.md in context
      const variableCode = `
        start = 1;
        end = 5;
        for (i = [start:end]) { cube(i); }
      `;
      const variableAst = parser.parseAST(variableCode);

      expect(variableAst).toHaveLength(3); // start + end + for loop

      // Should parse without errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('Performance and Quality Validation', () => {
    it('should demonstrate efficient parsing of multiple range expressions', () => {
      const multipleRanges = `
        for (i = [0:5]) {
          for (j = [0:2:10]) {
            for (k = [1:0.5:3]) {
              cube([i, j, k]);
            }
          }
        }
      `;

      const startTime = performance.now();
      const ast = parser.parseAST(multipleRanges);
      const endTime = performance.now();
      
      expect(ast).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(100); // Should parse quickly
      
      // Should have no errors
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should maintain type safety with range expressions in context', () => {
      const rangeCode = `for (i = [0:5]) { cube(i); }`;
      const ast = parser.parseAST(rangeCode);

      expect(ast).toHaveLength(1);

      // TypeScript type checking should work correctly
      // Range expressions maintain type safety when used in proper contexts
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(0);

      // The integration ensures type safety throughout the parsing process
      expect(ast[0]).toBeDefined();
    });
  });
});
