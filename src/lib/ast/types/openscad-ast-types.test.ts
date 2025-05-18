/**
 * Tests for OpenSCAD AST type definitions
 * 
 * These tests validate that our type definitions correctly model
 * the expected OpenSCAD language elements and their properties.
 */

import { describe, it, expect } from 'vitest';
import * as OpenSCAD from './openscad-ast-types';
import { ASTPosition } from './ast-types';

// Common test position for nodes
const testPosition: ASTPosition = {
  startLine: 0,
  startColumn: 0,
  endLine: 1,
  endColumn: 10
};

describe('OpenSCAD AST Type Definitions', () => {
  describe('2D Primitives', () => {
    it('should define Circle2D with required properties', () => {
      const circle: OpenSCAD.Circle2D = {
        type: 'Circle2D',
        radius: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 10,
          position: testPosition
        },
        position: testPosition
      };
      
      expect(circle.type).toBe('Circle2D');
      expect(circle.radius).toBeDefined();
      expect(circle.position).toBeDefined();
    });
    
    it('should define Square2D with required properties', () => {
      const square: OpenSCAD.Square2D = {
        type: 'Square2D',
        size: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 10,
          position: testPosition
        },
        center: true,
        position: testPosition
      };
      
      expect(square.type).toBe('Square2D');
      expect(square.size).toBeDefined();
      expect(square.center).toBeDefined();
      expect(square.position).toBeDefined();
    });
    
    it('should define Polygon2D with required properties', () => {
      const polygon: OpenSCAD.Polygon2D = {
        type: 'Polygon2D',
        points: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: [[0, 0], [10, 0], [10, 10]],
          position: testPosition
        },
        position: testPosition
      };
      
      expect(polygon.type).toBe('Polygon2D');
      expect(polygon.points).toBeDefined();
      expect(polygon.position).toBeDefined();
    });
  });
  
  describe('3D Primitives', () => {
    it('should define Cube3D with required properties', () => {
      const cube: OpenSCAD.Cube3D = {
        type: 'Cube3D',
        size: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 10,
          position: testPosition
        },
        center: false,
        position: testPosition
      };
      
      expect(cube.type).toBe('Cube3D');
      expect(cube.size).toBeDefined();
      expect(cube.center).toBeDefined();
      expect(cube.position).toBeDefined();
    });
    
    it('should define Sphere3D with required properties', () => {
      const sphere: OpenSCAD.Sphere3D = {
        type: 'Sphere3D',
        radius: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 5,
          position: testPosition
        },
        position: testPosition
      };
      
      expect(sphere.type).toBe('Sphere3D');
      expect(sphere.radius).toBeDefined();
      expect(sphere.position).toBeDefined();
    });
    
    it('should define Cylinder3D with required properties', () => {
      const cylinder: OpenSCAD.Cylinder3D = {
        type: 'Cylinder3D',
        height: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 10,
          position: testPosition
        },
        radius1: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 5,
          position: testPosition
        },
        position: testPosition
      };
      
      expect(cylinder.type).toBe('Cylinder3D');
      expect(cylinder.height).toBeDefined();
      expect(cylinder.radius1).toBeDefined();
      expect(cylinder.position).toBeDefined();
    });
  });
  
  describe('Transformations', () => {
    it('should define TranslateTransform with required properties', () => {
      const translate: OpenSCAD.TranslateTransform = {
        type: 'TranslateTransform',
        vector: [
          {
            type: 'LiteralExpression',
            valueType: 'number',
            value: 10,
            position: testPosition
          },
          {
            type: 'LiteralExpression',
            valueType: 'number',
            value: 20,
            position: testPosition
          },
          {
            type: 'LiteralExpression',
            valueType: 'number',
            value: 30,
            position: testPosition
          }
        ],
        children: [],
        position: testPosition
      };
      
      expect(translate.type).toBe('TranslateTransform');
      expect(translate.vector).toHaveLength(3);
      expect(translate.children).toBeDefined();
      expect(translate.position).toBeDefined();
    });
    
    it('should define RotateTransform with required properties', () => {
      const rotate: OpenSCAD.RotateTransform = {
        type: 'RotateTransform',
        angle: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 45,
          position: testPosition
        },
        children: [],
        position: testPosition
      };
      
      expect(rotate.type).toBe('RotateTransform');
      expect(rotate.angle).toBeDefined();
      expect(rotate.children).toBeDefined();
      expect(rotate.position).toBeDefined();
    });
  });
  
  describe('Boolean Operations', () => {
    it('should define UnionOperation with required properties', () => {
      const union: OpenSCAD.UnionOperation = {
        type: 'UnionOperation',
        children: [],
        position: testPosition
      };
      
      expect(union.type).toBe('UnionOperation');
      expect(union.children).toBeDefined();
      expect(union.position).toBeDefined();
    });
    
    it('should define DifferenceOperation with required properties', () => {
      const difference: OpenSCAD.DifferenceOperation = {
        type: 'DifferenceOperation',
        children: [],
        position: testPosition
      };
      
      expect(difference.type).toBe('DifferenceOperation');
      expect(difference.children).toBeDefined();
      expect(difference.position).toBeDefined();
    });
  });
  
  describe('Control Flow', () => {
    it('should define ForStatement with required properties', () => {
      const forLoop: OpenSCAD.ForStatement = {
        type: 'ForStatement',
        variable: 'i',
        iterable: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: [0, 1, 2, 3],
          position: testPosition
        },
        children: [],
        position: testPosition
      };
      
      expect(forLoop.type).toBe('ForStatement');
      expect(forLoop.variable).toBe('i');
      expect(forLoop.iterable).toBeDefined();
      expect(forLoop.children).toBeDefined();
      expect(forLoop.position).toBeDefined();
    });
    
    it('should define IfStatement with required properties', () => {
      const ifStatement: OpenSCAD.IfStatement = {
        type: 'IfStatement',
        condition: {
          type: 'LiteralExpression',
          valueType: 'boolean',
          value: true,
          position: testPosition
        },
        thenBranch: [],
        position: testPosition
      };
      
      expect(ifStatement.type).toBe('IfStatement');
      expect(ifStatement.condition).toBeDefined();
      expect(ifStatement.thenBranch).toBeDefined();
      expect(ifStatement.position).toBeDefined();
    });
  });
  
  describe('Module & Function Declarations', () => {
    it('should define ModuleDeclaration with required properties', () => {
      const moduleDecl: OpenSCAD.ModuleDeclaration = {
        type: 'ModuleDeclaration',
        name: 'test_module',
        parameters: [],
        body: [],
        position: testPosition
      };
      
      expect(moduleDecl.type).toBe('ModuleDeclaration');
      expect(moduleDecl.name).toBe('test_module');
      expect(moduleDecl.parameters).toBeDefined();
      expect(moduleDecl.body).toBeDefined();
      expect(moduleDecl.position).toBeDefined();
    });
    
    it('should define FunctionDeclaration with required properties', () => {
      const functionDecl: OpenSCAD.FunctionDeclaration = {
        type: 'FunctionDeclaration',
        name: 'test_function',
        parameters: [],
        expression: {
          type: 'LiteralExpression',
          valueType: 'number',
          value: 42,
          position: testPosition
        },
        position: testPosition
      };
      
      expect(functionDecl.type).toBe('FunctionDeclaration');
      expect(functionDecl.name).toBe('test_function');
      expect(functionDecl.parameters).toBeDefined();
      expect(functionDecl.expression).toBeDefined();
      expect(functionDecl.position).toBeDefined();
    });
  });
  
  describe('Special Variables', () => {
    it('should define SpecialVariable with required properties', () => {
      const specialVar: OpenSCAD.SpecialVariable = {
        type: 'SpecialVariable',
        name: '$fn',
        position: testPosition
      };
      
      expect(specialVar.type).toBe('SpecialVariable');
      expect(specialVar.name).toBe('$fn');
      expect(specialVar.position).toBeDefined();
    });
  });
});
