/**
 * @file Tests for Enhanced OpenSCAD Completion Provider
 * 
 * Tests the enhanced completion provider that integrates with Symbol Information API
 * and Position Utilities for intelligent code completion.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { OpenSCADCompletionProvider } from './completion-provider';

// Use the same interfaces defined in the completion provider for testing
interface Position {
  line: number;
  column: number;
  offset: number;
}

interface ASTNode {
  type: string;
  [key: string]: any;
}

interface ParserSymbolInfo {
  name: string;
  kind: 'module' | 'function' | 'variable' | 'parameter' | 'constant';
  loc?: {
    start: Position;
    end: Position;
  };
  parameters?: Array<{ name: string; value?: any; defaultValue?: any; description?: string }>;
  documentation?: string;
  scope?: string;
}

interface SymbolProvider {
  getSymbols(ast: ASTNode[]): ParserSymbolInfo[];
  getSymbolAtPosition(ast: ASTNode[], position: Position): ParserSymbolInfo | undefined;
}

interface ParserCompletionContext {
  type: 'module_call' | 'function_call' | 'parameter' | 'expression' | 'statement' | 'assignment' | 'unknown';
  availableSymbols: ParserSymbolInfo[];
  parameterIndex?: number;
  expectedType?: string;
}

interface PositionUtilities {
  findNodeAt(ast: ASTNode[], position: Position): ASTNode | undefined;
  getNodeRange(node: ASTNode): { start: Position; end: Position };
  getHoverInfo(ast: ASTNode[], position: Position): any | undefined;
  getCompletionContext(ast: ASTNode[], position: Position): ParserCompletionContext | undefined;
  isPositionInRange(position: Position, range: { start: Position; end: Position }): boolean;
  findNodesContaining(ast: ASTNode[], position: Position): ASTNode[];
}

// Mock Monaco editor types
const createMockTextModel = (lines: string[]): monaco.editor.ITextModel => ({
  getLineContent: (lineNumber: number) => lines[lineNumber - 1] || '',
  getLineCount: () => lines.length,
  getValue: () => lines.join('\n'),
  getVersionId: () => 1,
  getWordAtPosition: (position: monaco.Position) => {
    const line = lines[position.lineNumber - 1] || '';
    const beforeCursor = line.substring(0, position.column - 1);
    const match = beforeCursor.match(/\w+$/);
    return match ? { word: match[0], startColumn: position.column - match[0].length, endColumn: position.column } : null;
  }
} as monaco.editor.ITextModel);

const createMockPosition = (lineNumber: number, column: number): monaco.Position => ({
  lineNumber,
  column,
  with: vi.fn(),
  delta: vi.fn(),
  equals: vi.fn(),
  isBefore: vi.fn(),
  isBeforeOrEqual: vi.fn(),
  clone: vi.fn(),
  toString: vi.fn()
});

// Mock parser service
const createMockParserService = () => ({
  isReady: vi.fn(() => true),
  getDocumentOutline: vi.fn(() => [
    {
      name: 'test_module',
      type: 'module' as const,
      range: { startLine: 0, startColumn: 0, endLine: 2, endColumn: 1 }
    }
  ])
});

// Mock symbol provider
const createMockSymbolProvider = (): SymbolProvider => ({
  getSymbols: vi.fn(() => [
    {
      name: 'test_module',
      kind: 'module' as const,
      loc: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 1, offset: 50 } },
      parameters: [
        { name: 'size', value: undefined },
        { name: 'center', value: false }
      ]
    },
    {
      name: 'my_var',
      kind: 'variable' as const,
      loc: { start: { line: 1, column: 0, offset: 20 }, end: { line: 1, column: 10, offset: 30 } }
    }
  ] as ParserSymbolInfo[]),
  getSymbolAtPosition: vi.fn(() => undefined)
});

// Mock position utilities
const createMockPositionUtilities = (): PositionUtilities => ({
  findNodeAt: vi.fn(() => undefined),
  getNodeRange: vi.fn(() => ({ start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 10, offset: 10 } })),
  getHoverInfo: vi.fn(() => undefined),
  getCompletionContext: vi.fn(() => ({
    type: 'statement' as const,
    availableSymbols: [
      {
        name: 'test_module',
        kind: 'module' as const,
        loc: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 1, offset: 50 } }
      }
    ] as ParserSymbolInfo[]
  } as ParserCompletionContext)),
  isPositionInRange: vi.fn(() => false),
  findNodesContaining: vi.fn(() => [])
});

describe('Enhanced OpenSCAD Completion Provider', () => {
  let provider: OpenSCADCompletionProvider;
  let mockParserService: ReturnType<typeof createMockParserService>;
  let mockSymbolProvider: SymbolProvider;
  let mockPositionUtilities: PositionUtilities;

  beforeEach(() => {
    mockParserService = createMockParserService();
    mockSymbolProvider = createMockSymbolProvider();
    mockPositionUtilities = createMockPositionUtilities();
    
    provider = new OpenSCADCompletionProvider(
      mockParserService as any,
      mockSymbolProvider,
      mockPositionUtilities
    );
  });

  describe('Basic Functionality', () => {
    it('should create completion provider with enhanced APIs', () => {
      expect(provider).toBeInstanceOf(OpenSCADCompletionProvider);
      expect(provider.triggerCharacters).toEqual(['.', '(', '[', ' ']);
    });

    it('should provide completion stats', () => {
      const stats = provider.getLastCompletionStats();
      expect(stats).toHaveProperty('totalSuggestions');
      expect(stats).toHaveProperty('astSymbols');
      expect(stats).toHaveProperty('builtinSymbols');
      expect(stats).toHaveProperty('snippets');
      expect(stats).toHaveProperty('computeTime');
    });
  });

  describe('Enhanced Context Analysis', () => {
    it('should analyze context with Position Utilities integration', async () => {
      const model = createMockTextModel(['module test() {', '  cube(10);', '}']);
      const position = createMockPosition(2, 8); // Inside cube call
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      expect(result.suggestions).toBeDefined();
      expect(mockPositionUtilities.getCompletionContext).toHaveBeenCalled();
    });

    it('should skip completion in strings', async () => {
      const model = createMockTextModel(['"test string with cube"']);
      const position = createMockPosition(1, 15); // Inside string
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      expect(result.suggestions).toHaveLength(0);
    });

    it('should skip completion in comments', async () => {
      const model = createMockTextModel(['// comment with cube']);
      const position = createMockPosition(1, 15); // Inside comment
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe('Symbol-based Completion', () => {
    it('should provide completions from Symbol Provider', async () => {
      const model = createMockTextModel(['test']);
      const position = createMockPosition(1, 5);
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(mockSymbolProvider.getSymbols).toHaveBeenCalled();
      
      // Should include symbols from Symbol Provider
      const moduleCompletion = result.suggestions.find(s => s.label === 'test_module');
      expect(moduleCompletion).toBeDefined();
      expect(moduleCompletion?.kind).toBe(monaco.languages.CompletionItemKind.Module);
    });

    it('should create smart insert text for modules with parameters', async () => {
      const model = createMockTextModel(['test_mod']);
      const position = createMockPosition(1, 8);
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      const moduleCompletion = result.suggestions.find(s => s.label === 'test_module');
      expect(moduleCompletion?.insertText).toContain('${1:size}');
      expect(moduleCompletion?.insertText).toContain('${2:center}');
    });

    it('should include built-in OpenSCAD symbols', async () => {
      const model = createMockTextModel(['cu']);
      const position = createMockPosition(1, 3);
      
      const result = await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      // Should include built-in symbols like 'cube'
      const cubeCompletion = result.suggestions.find(s => s.label === 'cube');
      expect(cubeCompletion).toBeDefined();
    });
  });

  describe('Performance and Stats', () => {
    it('should track completion performance', async () => {
      const model = createMockTextModel(['test']);
      const position = createMockPosition(1, 5);
      
      await provider.provideCompletionItems(
        model,
        position,
        { triggerKind: monaco.languages.CompletionTriggerKind.Invoke }
      );

      const stats = provider.getLastCompletionStats();
      expect(stats.computeTime).toBeGreaterThan(0);
      expect(stats.totalSuggestions).toBeGreaterThan(0);
    });
  });

  describe('API Integration', () => {
    it('should allow setting Symbol Provider', () => {
      const newSymbolProvider = createMockSymbolProvider();
      provider.setSymbolProvider(newSymbolProvider);
      // No error should be thrown
    });

    it('should allow setting Position Utilities', () => {
      const newPositionUtilities = createMockPositionUtilities();
      provider.setPositionUtilities(newPositionUtilities);
      // No error should be thrown
    });
  });
});
