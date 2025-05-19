import {Parser, Tree} from 'web-tree-sitter';
import { OpenscadParser } from '../openscad-parser';
import * as path from 'path';
import * as fs from 'fs';
import {afterAll} from "vitest";

// Simple type declarations for test functions
type DoneCallback = (error?: any) => void;
declare const describe: (name: string, fn: () => void) => void;
declare const beforeAll: (fn: (done: DoneCallback) => void) => void;
declare const it: (name: string, fn: (done: DoneCallback) => void) => void;
declare const expect: {
  (actual: any): any;
  toBeDefined(): void;
  toBe(value: any): void;
  toEqual(value: any): void;
  toHaveLength(length: number): void;
};

describe('AST Generator Integration Tests', () => {
  let parser: OpenscadParser;

beforeAll(async () => {
    parser = new OpenscadParser();
    // Assuming the WASM file is in the public directory when served
    await parser.init('./tree-sitter-openscad.wasm');
});

afterAll(() => {
    parser.dispose();
});


  describe('translate and cube operations', () => {
    it('should parse translate with cube without curly braces', async () => {
        const code = `translate([1,0,0]) cube([1,2,3], true);`;
        const ast = parser.parseAST(code);

        expect(ast).toBeDefined();
        expect(ast.length).toBe(1);

        const translateNode = ast[0];
        expect(translateNode.type).toBe('translate');
        expect((translateNode as any).v).toEqual([1, 0, 0]);

        // The child should be a cube
        const children = (translateNode as any).children;
        expect(children).toHaveLength(1);
        const cubeNode = children[0];
        expect(cubeNode?.type).toBe('cube');
        expect((cubeNode as any).size).toEqual([1, 2, 3]);
        expect((cubeNode as any).center).toBe(true);
    });

    it('should parse translate with cube using curly braces and named parameters', () => {
        const code = `translate(v=[3,0,0]) { cube(size=[1,2,3], center=true); };`;
        const ast = parser.parseAST(code);

        expect(ast).toBeDefined();
        expect(ast.length).toBe(1);

        const translateNode = ast[0];
        expect(translateNode.type).toBe('translate');
        expect((translateNode as any).v).toEqual([3, 0, 0]);

        // The child should be a cube
        const children = (translateNode as any).children;
        expect(children).toHaveLength(1);
        const cubeNode = children[0];
        expect(cubeNode?.type).toBe('cube');
        expect((cubeNode as any).size).toEqual([1, 2, 3]);
        expect((cubeNode as any).center).toBe(true);
    });
  });
});
