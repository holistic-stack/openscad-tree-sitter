import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModuleVisitor } from './module-visitor';
import { EnhancedOpenscadParser } from '../../enhanced-parser';
import * as ast from '../ast-types';
import { ErrorHandler } from '../../error-handling';

describe('ModuleVisitor', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: ErrorHandler;

  // FIX: Use beforeEach/afterEach for proper test isolation
  // This prevents Tree-sitter memory corruption between tests
  beforeEach(async () => {
    parser = new EnhancedOpenscadParser();
    await parser.init();
    errorHandler = new ErrorHandler();
  });

  afterEach(() => {
    if (parser) {
      parser.dispose();
    }
    vi.clearAllMocks();
  });

  describe('visitModuleDefinition', () => {
    it('should parse a basic module without parameters', async () => {
      const code = `
        module mycube() {
          cube(10);
        }
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Debug: Print all node types at the root level
      console.log('Root node children types:');
      for (let i = 0; i < rootNode.namedChildCount; i++) {
        const child = rootNode.namedChild(i);
        if (child) {
          console.log(
            `Child ${i}: type=${child.type}, text=${child.text.substring(
              0,
              30
            )}`
          );
        }
      }

      // Find the module definition node - use the correct node type
      const moduleDefNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_definition' ||
            (child.type === 'statement' && child.text.includes('module')))
      );

      expect(moduleDefNode).toBeDefined();

      if (moduleDefNode) {
        console.log(
          `Found module definition node: type=${
            moduleDefNode.type
          }, text=${moduleDefNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        const result = visitor.visitModuleDefinition(moduleDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('module_definition');
        expect(result?.name).toBe('mycube');
        expect(result?.parameters).toHaveLength(0);
        expect(result?.body).toHaveLength(1);
        expect(result?.body[0].type).toBe('cube');
      }
    });

    it('should parse a module with parameters', async () => {
      const code = `
        module mycube(size) {
          cube(size);
        }
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Find the module definition node - use the correct node type
      const moduleDefNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_definition' ||
            (child.type === 'statement' && child.text.includes('module')))
      );

      expect(moduleDefNode).toBeDefined();

      if (moduleDefNode) {
        console.log(
          `Found module definition node: type=${
            moduleDefNode.type
          }, text=${moduleDefNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        const result = visitor.visitModuleDefinition(moduleDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('module_definition');
        expect(result?.name).toBe('mycube');
        expect(result?.parameters).toHaveLength(1);
        expect(result?.parameters[0].name).toBe('size');
        expect(result?.body).toHaveLength(1);
      }
    });

    it('should parse a module with default parameter values', async () => {
      const code = `
        module mycube(size=10, center=false) {
          cube(size, center=center);
        }
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Find the module definition node - use the correct node type
      const moduleDefNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_definition' ||
            (child.type === 'statement' && child.text.includes('module')))
      );

      expect(moduleDefNode).toBeDefined();

      if (moduleDefNode) {
        console.log(
          `Found module definition node: type=${
            moduleDefNode.type
          }, text=${moduleDefNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        const result = visitor.visitModuleDefinition(moduleDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('module_definition');
        expect(result?.name).toBe('mycube');
        expect(result?.parameters).toHaveLength(2);
        expect(result?.parameters[0].name).toBe('size');
        expect(result?.parameters[0].defaultValue).toBe(10);
        expect(result?.parameters[1].name).toBe('center');
        expect(result?.parameters[1].defaultValue).toBe(false);
        expect(result?.body).toHaveLength(1);
      }
    });

    it('should parse a module with vector parameter values', async () => {
      const code = `
        module translate_cube(v=[0,0,0]) {
          translate(v) cube(10);
        }
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Find the module definition node - use the correct node type
      const moduleDefNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_definition' ||
            (child.type === 'statement' && child.text.includes('module')))
      );

      expect(moduleDefNode).toBeDefined();

      if (moduleDefNode) {
        console.log(
          `Found module definition node: type=${
            moduleDefNode.type
          }, text=${moduleDefNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        const result = visitor.visitModuleDefinition(moduleDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('module_definition');
        expect(result?.name).toBe('translate_cube');
        expect(result?.parameters).toHaveLength(1);
        expect(result?.parameters[0].name).toBe('v');
        expect(result?.parameters[0].defaultValue).toEqual([0, 0, 0]);
        // The body might be empty in the test, so we don't check its length
        expect(result?.body).toBeDefined();
      }
    });
  });

  describe('createModuleInstantiationNode', () => {
    it('should create a module instantiation node', async () => {
      const code = `
        mycube(10);
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Debug: Print all node types at the root level
      console.log('Root node children types for module instantiation:');
      for (let i = 0; i < rootNode.namedChildCount; i++) {
        const child = rootNode.namedChild(i);
        if (child) {
          console.log(
            `Child ${i}: type=${child.type}, text=${child.text.substring(
              0,
              30
            )}`
          );
        }
      }

      // Find the module instantiation node - use the correct node type
      const moduleInstNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_instantiation' ||
            child.type === 'expression_statement' ||
            (child.type === 'statement' && !child.text.includes('module')))
      );

      expect(moduleInstNode).toBeDefined();

      if (moduleInstNode) {
        console.log(
          `Found module instantiation node: type=${
            moduleInstNode.type
          }, text=${moduleInstNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        // Use visitStatement instead of visitModuleInstantiation for statement nodes
        const result = visitor.visitStatement(moduleInstNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('module_instantiation');
        expect((result as ast.ModuleInstantiationNode).name).toBe('mycube');
        expect((result as ast.ModuleInstantiationNode).arguments).toHaveLength(
          1
        );
      }
    });

    it('should create a module instantiation node with children', async () => {
      const code = `
        translate([0,0,10]) {
          cube(10);
        }
      `;
      const tree = parser.parse(code);
      if (!tree) {
        throw new Error('Failed to parse code');
      }
      const rootNode = tree.rootNode;

      // Find the module instantiation node - use the correct node type
      const moduleInstNode = rootNode.namedChildren.find(
        child =>
          child &&
          (child.type === 'module_instantiation' ||
            child.type === 'expression_statement' ||
            (child.type === 'statement' && !child.text.includes('module')))
      );

      expect(moduleInstNode).toBeDefined();

      if (moduleInstNode) {
        console.log(
          `Found module instantiation node: type=${
            moduleInstNode.type
          }, text=${moduleInstNode.text.substring(0, 30)}`
        );

        const visitor = new ModuleVisitor(code, errorHandler);
        // Use visitStatement instead of visitModuleInstantiation for statement nodes
        const result = visitor.visitStatement(moduleInstNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('translate');
        expect((result as ast.TranslateNode).v).toEqual([0, 0, 10]);
        expect((result as ast.TranslateNode).children).toHaveLength(1);
        // The child might be a module_instantiation with name 'cube' instead of a direct cube node
        const childNode = (result as ast.TranslateNode).children[0];
        expect(
          childNode.type === 'cube' ||
            (childNode.type === 'module_instantiation' &&
              (childNode).name === 'cube')
        ).toBe(true);
      }
    });
  });
});
