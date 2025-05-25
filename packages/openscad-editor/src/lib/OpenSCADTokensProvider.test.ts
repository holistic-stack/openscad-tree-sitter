import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Parser as TreeSitterParser, Language as TreeSitterLanguage, Tree, Point } from 'web-tree-sitter';
import { OpenSCADTokensProvider } from './OpenSCADTokensProvider';
import * as monaco from 'monaco-editor';

// Determine paths relative to the current test file
const baseDir = path.resolve(__dirname); // c:\\Users\\luciano\\git\\openscad-tree-sitter-p1\\packages\\openscad-editor\\src\\lib

// Paths to WASM files, now expected to be in `packages/openscad-editor/public/`
// due to the new postinstall script in openscad-editor's package.json
const publicDir = path.resolve(baseDir, '../../public'); // Adjust to point to `packages/openscad-editor/public`

const treeSitterWasmPath = path.join(publicDir, 'tree-sitter.wasm');
const openSCADGrammarWasmPath = path.join(publicDir, 'tree-sitter-openscad.wasm');

// Path to highlight query file, also expected to be in `packages/openscad-editor/public/`
const highlightQueryFilePath = path.join(publicDir, 'highlights.scm');

let ActualOpenSCADLanguage: TreeSitterLanguage;
let actualHighlightQueryText: string;

// Minimal mock for monaco.editor.ITextModel - this can remain as it's helpful for simulating Monaco's model
const createMockTextModel = (lines: string[], versionId = 1): monaco.editor.ITextModel => ({
  getLineContent: vi.fn((lineNumber: number) => lines[lineNumber - 1] || ''),
  getLineCount: vi.fn(() => lines.length),
  getVersionId: vi.fn(() => versionId),
  uri: { fsPath: '/test/file.scad' } as monaco.Uri, // Add a mock URI
  // Add other methods if OpenSCADTokensProvider starts using them
} as any);


beforeAll(async () => {
  try {
    await TreeSitterParser.init({
      locateFile: (scriptName: string, scriptDirectory: string) => {
        if (scriptName === 'tree-sitter.wasm') {
          if (!fs.existsSync(treeSitterWasmPath)) {
            throw new Error(`tree-sitter.wasm not found at ${treeSitterWasmPath}. Ensure web-tree-sitter is installed correctly.`);
          }
          return treeSitterWasmPath;
        }
        return path.join(scriptDirectory, scriptName);
      }
    });

    if (!fs.existsSync(openSCADGrammarWasmPath)) {
      throw new Error(`OpenSCAD grammar WASM not found at ${openSCADGrammarWasmPath}. Ensure the tree-sitter-openscad package is built (npm run build:wasm in its directory).`);
    }
    // Load WASM as a buffer
    const wasmBuffer = fs.readFileSync(openSCADGrammarWasmPath);
    ActualOpenSCADLanguage = await TreeSitterLanguage.load(wasmBuffer);

    if (!fs.existsSync(highlightQueryFilePath)) {
      throw new Error(`Highlight query file not found at ${highlightQueryFilePath}.`);
    }
    actualHighlightQueryText = fs.readFileSync(highlightQueryFilePath, 'utf8');

  } catch (error) {
    console.error("Error during beforeAll setup:", error);
    throw error; // Re-throw to fail the test suite if setup fails
  }
});

describe('OpenSCADTokensProvider (Integration)', () => {
  let parser: TreeSitterParser;
  let provider: OpenSCADTokensProvider;

  beforeEach(() => {
    if (!ActualOpenSCADLanguage || !actualHighlightQueryText) {
      throw new Error("Language or highlight query not loaded. Check beforeAll hook.");
    }
    parser = new TreeSitterParser();
    parser.setLanguage(ActualOpenSCADLanguage);
    provider = new OpenSCADTokensProvider(parser, ActualOpenSCADLanguage, actualHighlightQueryText);
  });

  it('should construct and initialize with a valid language and query', () => {
    expect(provider).toBeInstanceOf(OpenSCADTokensProvider);
    // No specific mock calls to check, but constructor should not throw
  });

  it('should throw an error if highlight query compilation fails', () => {
    const invalidQuery = "((())) @unterminated"; // Example of an invalid query
    expect(() => new OpenSCADTokensProvider(parser, ActualOpenSCADLanguage, invalidQuery))
      .toThrow(/^Failed to compile Tree-sitter highlight query:/);
  });

  it('getInitialState should return a valid IState object', () => {
    const state = provider.getInitialState();
    expect(state).toBeInstanceOf(Object);
    expect(state.clone).toBeInstanceOf(Function);
    expect(state.equals).toBeInstanceOf(Function);
    // Check initial properties if TokenizerState was exported and its structure known
    // For an internal class, we rely on it being a 'TokenizerState' instance internally.
    // e.g. expect((state as any).lineNumber).toBe(0);
    // expect((state as any).treeSnapshot).toBeNull();
  });

  describe('updateDocument', () => {
    it('should parse the code and update the internal tree', () => {
      const code = 'cube(10);';
      provider.updateDocument(code, 1);
      expect((provider as any).tree).toBeInstanceOf(Tree);
      expect((provider as any).codeVersion).toBe(1);
      expect((provider as any).tree.rootNode.text).toBe(code);

      const newerCode = 'sphere(5);';
      provider.updateDocument(newerCode, 2); // New version
      expect((provider as any).tree).toBeInstanceOf(Tree);
      expect((provider as any).codeVersion).toBe(2);
      expect((provider as any).tree.rootNode.text).toBe(newerCode);
    });

    it('should not re-parse if versionId is the same and tree exists', () => {
      const code = 'cube(10);';
      provider.updateDocument(code, 1);
      const initialTree = (provider as any).tree;
      vi.spyOn(parser, 'parse'); // Spy on the actual parse method

      provider.updateDocument(code, 1); // Same version
      expect(parser.parse).not.toHaveBeenCalled();
      expect((provider as any).tree).toBe(initialTree);
      vi.restoreAllMocks();
    });
  });

  describe('tokenize', () => {
    let mockModel: monaco.editor.ITextModel;

    it('should return default tokens if state is invalid (not an instance of internal TokenizerState)', () => {
      const lineContent = 'module test() {}';
      mockModel = createMockTextModel([lineContent]);
      const initialState = provider.getInitialState(); // A valid state
      const invalidState = {} as monaco.languages.IState; // Not an instance of TokenizerState

      const lineTokens = provider.tokenize(lineContent, invalidState);
      expect(lineTokens.tokens).toEqual([{ startIndex: 0, scopes: 'source.openscad' }]);
      // Check if endState is a fresh initial state by comparing relevant properties
      const freshInitialState = provider.getInitialState();
      expect(lineTokens.endState.clone().equals(freshInitialState)).toBe(true);
    });
    
    it('should return default tokens for a line if tree is not ready (e.g., updateDocument not called)', () => {
      const lineContent = 'module test() {}';
      mockModel = createMockTextModel([lineContent]);
      // Provider is fresh, (provider as any).tree is null
      const initialState = provider.getInitialState(); // lineNumber 0, treeSnapshot null
      
      // We need to simulate the state that would be passed for line 1
      // The actual TokenizerState is internal, so we construct a compatible one for testing this edge case
      // Or, more simply, ensure the initial state passed to tokenize for the first line is handled.
      // The `tokenize` method itself expects state.lineNumber and state.model to be potentially set.
      // Let's use the state from getInitialState, which should have lineNumber 0.
      // The provider's tokenize method will use state.lineNumber.
      // If state.lineNumber is 0, it might be an issue if model.getLineContent(0) is called.
      // Monaco line numbers are 1-based.
      // A state for line 1 would typically have lineNumber 1.

      // Let's test with the direct initial state.
      // If (provider as any).tree is null, it should hit the fallback.
      const lineTokens = provider.tokenize(lineContent, initialState);
      expect(lineTokens.tokens).toEqual([{ startIndex: 0, scopes: 'source.openscad' }]);
      expect(lineTokens.endState.equals(initialState)).toBe(true); // State should be preserved
    });

    it('should tokenize a simple line: "module test_module()"', () => {
      const lineContent = 'module test_module()'; // module name, parens
      const fullCode = lineContent + ';'; // Add semicolon for valid top-level statement
      mockModel = createMockTextModel([lineContent]);
      provider.updateDocument(fullCode, 1);

      const stateForLine1 = provider.getInitialState();
      // Manually advance state to represent being called for line 1 (after potential previous lines)
      // This is tricky because TokenizerState is internal.
      // Let's assume getInitialState() is for the very start, and tokenize will be called with line number 1.
      // The state passed to tokenize for the *first* line is the result of getInitialState().
      // The provider's TokenizerState constructor takes (treeSnapshot, lineNumber, model).
      // getInitialState returns new TokenizerState(null, 0).
      // tokenize then uses state.lineNumber.
      // The provider's `tokenize` method uses `state.lineNumber` and `state.model`.
      // It creates `endState: new TokenizerState(this.tree, lineNumber + 1, model)`
      // This implies the `state` passed in should have these.
      // Let's simulate the state that would be passed for the first line.
      const testState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);


      const result = provider.tokenize(lineContent, testState);
      
      // Expected based on highlights.scm and OpenSCADTokensProvider's map:
      // "module" @keyword -> keyword.openscad
      // "test_module" in module_definition name: (identifier) @function -> entity.name.function.openscad
      // "(" @punctuation.bracket -> punctuation.bracket.openscad
      // ")" @punctuation.bracket -> punctuation.bracket.openscad
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'keyword.openscad' }, // "module"
        { startIndex: 6, scopes: 'source.openscad' },   // " "
        { startIndex: 7, scopes: 'entity.name.function.openscad' }, // "test_module"
        { startIndex: 18, scopes: 'punctuation.bracket.openscad' }, // "("
        { startIndex: 19, scopes: 'punctuation.bracket.openscad' }, // ")"
        // The provider should fill until the end of the line with source.openscad if needed
        // or the last token extends to the end.
        // If lastTokenEndIndex < lineLength, it pushes a source.openscad token.
        // Here, last token ends at 20, line length is 20. So no final fill.
      ]);
      const endState = result.endState as any;
      expect(endState.lineNumber).toBe(2);
      expect(endState.treeSnapshot).toBe((provider as any).tree);
      expect(endState.model).toBe(mockModel);
    });

    it('should tokenize a line with a comment: "// test comment"', () => {
      const lineContent = '// test comment';
      mockModel = createMockTextModel([lineContent]);
      provider.updateDocument(lineContent, 1);
      
      const testState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);
      const result = provider.tokenize(lineContent, testState);

      // (comment) @comment -> comment.openscad
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'comment.openscad' }, // "// test comment"
      ]);
    });

    it('should tokenize "a = 10 + b;"', () => {
      const lineContent = 'a = 10 + b;';
      mockModel = createMockTextModel([lineContent]);
      provider.updateDocument(lineContent, 1);

      const testState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);
      const result = provider.tokenize(lineContent, testState);
      
      // "a" @variable -> variable.openscad
      // "=" (part of binary_expression operator) @operator -> operator.openscad
      // "10" @number -> number.openscad
      // "+" (part of binary_expression operator) @operator -> operator.openscad
      // "b" @variable -> variable.openscad
      // ";" @punctuation.delimiter -> punctuation.delimiter.openscad
      // Gaps filled with source.openscad
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'variable.openscad' }, // "a"
        { startIndex: 1, scopes: 'source.openscad' },   // " "
        { startIndex: 2, scopes: 'operator.openscad' }, // "="
        { startIndex: 3, scopes: 'source.openscad' },   // " "
        { startIndex: 4, scopes: 'number.openscad' },   // "10"
        { startIndex: 6, scopes: 'source.openscad' },   // " "
        { startIndex: 7, scopes: 'operator.openscad' }, // "+"
        { startIndex: 8, scopes: 'source.openscad' },   // " "
        { startIndex: 9, scopes: 'variable.openscad' }, // "b"
        { startIndex: 10, scopes: 'punctuation.delimiter.openscad' }, // ";"
      ]);
    });
    
    it('should handle empty line content correctly', () => {
      const lineContent = '';
      mockModel = createMockTextModel([lineContent]);
      provider.updateDocument(lineContent, 1); // Tree-sitter will parse empty string

      const testState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);
      const result = provider.tokenize(lineContent, testState);
      
      // Provider logic: if lineLength === 0, returns [{ startIndex: 0, scopes: 'source.openscad' }]
      // This seems to be handled by getTokensForLine
      expect(result.tokens).toEqual([{ startIndex: 0, scopes: 'source.openscad' }]);
      const endState = result.endState as any;
      expect(endState.lineNumber).toBe(2);
    });

    it('should handle line with only whitespace correctly', () => {
      const lineContent = '    ';
      mockModel = createMockTextModel([lineContent]);
      provider.updateDocument(lineContent, 1);

      const testState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);
      const result = provider.tokenize(lineContent, testState);
      
      // No captures, provider logic should fill with source.openscad
      expect(result.tokens).toEqual([{ startIndex: 0, scopes: 'source.openscad' }]);
    });

    it('should tokenize multiple lines correctly, advancing state', () => {
      const lines = [
        'module first_mod();', // Line 1
        '// comment on line 2', // Line 2
        'sphere(r=5);'         // Line 3
      ];
      const fullCode = lines.join('\\n');
      mockModel = createMockTextModel(lines);
      provider.updateDocument(fullCode, 1);

      // Line 1
      let currentState = new (provider.getInitialState() as any).constructor((provider as any).tree, 1, mockModel);
      let result = provider.tokenize(lines[0], currentState);
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'keyword.openscad' }, // "module"
        { startIndex: 6, scopes: 'source.openscad' },
        { startIndex: 7, scopes: 'entity.name.function.openscad' }, // "first_mod"
        { startIndex: 16, scopes: 'punctuation.bracket.openscad' }, // "("
        { startIndex: 17, scopes: 'punctuation.bracket.openscad' }, // ")"
        { startIndex: 18, scopes: 'punctuation.delimiter.openscad' }, // ";"
      ]);
      currentState = result.endState;
      expect((currentState as any).lineNumber).toBe(2);

      // Line 2
      result = provider.tokenize(lines[1], currentState);
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'comment.openscad' }, // "// comment on line 2"
      ]);
      currentState = result.endState;
      expect((currentState as any).lineNumber).toBe(3);
      
      // Line 3
      result = provider.tokenize(lines[2], currentState);
      // sphere(r=5);
      // "sphere" @function.call -> entity.name.function.call.openscad
      // "(" @punctuation.bracket
      // "r" @variable (could be parameter if grammar distinguishes) -> variable.openscad (or variable.parameter.openscad)
      //     highlights.scm: (identifier) @variable. Default map: variable.openscad
      //     The OpenSCAD grammar might have specific nodes for parameters in calls.
      //     Let's assume it's `variable.openscad` for now if not more specific.
      //     The `OpenSCADTokensProvider` map has `parameter: 'variable.parameter.openscad'`.
      //     If the grammar emits `(parameter name: (identifier) @parameter)`, this would be used.
      //     Current `highlights.scm` does not have `@parameter` for call arguments. It's generic `(identifier) @variable`.
      // "=" @operator
      // "5" @number
      // ")" @punctuation.bracket
      // ";" @punctuation.delimiter
      expect(result.tokens).toEqual([
        { startIndex: 0, scopes: 'entity.name.function.call.openscad' }, // "sphere"
        { startIndex: 6, scopes: 'punctuation.bracket.openscad' },      // "("
        { startIndex: 7, scopes: 'variable.openscad' },                  // "r"
        { startIndex: 8, scopes: 'operator.openscad' },                  // "="
        { startIndex: 9, scopes: 'number.openscad' },                    // "5"
        { startIndex: 10, scopes: 'punctuation.bracket.openscad' },     // ")"
        { startIndex: 11, scopes: 'punctuation.delimiter.openscad' },    // ";"
      ]);
      currentState = result.endState;
      expect((currentState as any).lineNumber).toBe(4);
    });
  });
});
