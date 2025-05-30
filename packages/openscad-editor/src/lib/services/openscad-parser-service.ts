/**
 * OpenSCAD Parser Service
 *
 * Provides AST parsing and analysis capabilities for the OpenSCAD editor.
 * Integrates the openscad-parser package with Monaco editor features.
 */

import type * as TreeSitter from 'web-tree-sitter';

// Parser interface that matches the OpenscadParser class
interface IOpenscadParser {
  isInitialized: boolean;
  init(wasmPath?: string): Promise<void>;
  parse(code: string): TreeSitter.Tree | null;
  dispose(): void;
}

// Dynamic import of the parser to avoid build-time dependency issues
async function createParser(): Promise<IOpenscadParser> {
  try {
    // Try to dynamically import the parser package
    const parserModule = await import('@openscad/parser');
    return new parserModule.OpenscadParser();
  } catch (error) {
    console.warn('OpenSCAD parser not available, using mock implementation:', error);
    // Fallback to a mock implementation
    const mockParser: IOpenscadParser = {
      isInitialized: false,
      async init(_wasmPath?: string): Promise<void> {
        mockParser.isInitialized = true;
        console.warn('Using mock parser implementation - WASM file not available');
      },
      parse(_code: string): TreeSitter.Tree | null {
        console.warn('Mock parser returning null - no actual parsing performed');
        return null;
      },
      dispose(): void {
        mockParser.isInitialized = false;
      }
    };
    return mockParser;
  }
}

// Simple error interface for our service
export interface ParseError {
  message: string;
  location: {
    line: number;
    column: number;
  };
  severity: 'error' | 'warning' | 'info';
}

export interface ParseResult {
  ast: TreeSitter.Tree | null;
  errors: ParseError[];
  success: boolean;
}

export interface OutlineItem {
  name: string;
  type: 'module' | 'function' | 'variable';
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  children?: OutlineItem[];
}

export interface HoverInfo {
  contents: string[];
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface Position {
  line: number;
  column: number;
}

export interface DocumentSymbol {
  name: string;
  type: string;
  location: {
    line: number;
    column: number;
  };
  documentation?: string;
}

/**
 * Service class for parsing OpenSCAD code and providing AST-based features
 */
export class OpenSCADParserService {
  private parser: IOpenscadParser | null = null;
  private documentTree: TreeSitter.Tree | null = null;
  private lastParseErrors: ParseError[] = [];
  private isInitialized = false;

  /**
   * Initialize the parser service
   */
  async init(wasmPath = '/public/tree-sitter-openscad.wasm'): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.parser = await createParser();
      await this.parser.init(wasmPath);
      this.isInitialized = true;
      console.log('✅ OpenSCAD parser initialized successfully with WASM path:', wasmPath);
    } catch (error) {
      console.error('❌ Failed to initialize OpenSCAD parser:', error);
      throw new Error(`Parser initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse OpenSCAD document and return tree with errors
   */
  async parseDocument(content: string): Promise<ParseResult> {
    if (!this.parser || !this.isInitialized) {
      const error = 'Parser not initialized. Call init() first.';
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      console.log('🔄 Parsing OpenSCAD document...');

      // Parse the content
      const tree = this.parser.parse(content);

      if (tree) {
        this.documentTree = tree;
        this.lastParseErrors = this.extractErrorsFromTree(tree, content);

        console.log(`✅ Document parsed successfully: ${this.lastParseErrors.length} errors found`);

        return {
          ast: tree,
          errors: this.lastParseErrors,
          success: !this.hasErrors(tree.rootNode),
        };
      } else {
        console.error('❌ Parser returned null tree - this indicates a critical parser failure');
        this.documentTree = null;
        this.lastParseErrors = [
          {
            message: 'Failed to parse document - parser returned null tree. This may indicate WASM initialization issues.',
            location: { line: 1, column: 1 },
            severity: 'error',
          },
        ];

        return {
          ast: null,
          errors: this.lastParseErrors,
          success: false,
        };
      }
    } catch (error) {
      console.error('❌ Parse error:', error);
      const parseError: ParseError = {
        message: error instanceof Error ? error.message : 'Unknown parse error',
        location: { line: 1, column: 1 },
        severity: 'error',
      };

      return {
        ast: null,
        errors: [parseError],
        success: false,
      };
    }
  }

  /**
   * Extract document outline from the current tree
   */
  getDocumentOutline(): OutlineItem[] {
    if (!this.documentTree) {
      return [];
    }

    const outline: OutlineItem[] = [];

    try {
      // Walk the tree to extract outline items
      this.extractOutlineFromNode(this.documentTree.rootNode, outline);
    } catch (error) {
      console.error('Error extracting outline:', error);
    }

    return outline;
  }

  /**
   * Get hover information for a specific position
   */
  getHoverInfo(position: Position): HoverInfo | null {
    if (!this.documentTree) {
      return null;
    }

    try {
      // Find the tree node at the given position
      const node = this.findNodeAtPosition(
        this.documentTree.rootNode,
        position
      );

      if (!node) {
        return null;
      }

      // Generate hover information based on node type
      return this.generateHoverInfo(node);
    } catch (error) {
      console.error('Error generating hover info:', error);
      return null;
    }
  }

  /**
   * Extract all document symbols
   */
  getDocumentSymbols(): DocumentSymbol[] {
    if (!this.documentTree) {
      return [];
    }

    const symbols: DocumentSymbol[] = [];

    try {
      this.extractSymbolsFromNode(this.documentTree.rootNode, symbols);
    } catch (error) {
      console.error('Error extracting symbols:', error);
    }

    return symbols;
  }

  /**
   * Get the last parse errors
   */
  getLastErrors(): ParseError[] {
    return this.lastParseErrors;
  }

  /**
   * Check if the service is ready for use
   */
  isReady(): boolean {
    return this.isInitialized && this.parser !== null;
  }

  /**
   * Dispose of the parser service
   */
  dispose(): void {
    if (this.parser) {
      this.parser.dispose();
      this.parser = null;
    }

    this.documentTree = null;
    this.lastParseErrors = [];
    this.isInitialized = false;
  }

  // Private helper methods

  private extractErrorsFromTree(
    tree: TreeSitter.Tree,
    source: string
  ): ParseError[] {
    const errors: ParseError[] = [];

    const walkNode = (node: TreeSitter.Node) => {
      if (node.type === 'ERROR' || node.hasError) {
        errors.push({
          message: `Syntax error: unexpected ${node.type}`,
          location: {
            line: node.startPosition.row,
            column: node.startPosition.column,
          },
          severity: 'error',
        });
      }

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          walkNode(child);
        }
      }
    };

    walkNode(tree.rootNode);
    return errors;
  }

  private hasErrors(node: TreeSitter.Node): boolean {
    if (node.type === 'ERROR' || node.hasError) {
      return true;
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && this.hasErrors(child)) {
        return true;
      }
    }

    return false;
  }

  private extractOutlineFromNode(
    node: TreeSitter.Node,
    outline: OutlineItem[]
  ): void {
    if (!node) return;

    // Extract different types of outline items
    switch (node.type) {
      case 'module_definition':
        const moduleName = this.findChildByType(node, 'identifier')?.text;
        if (moduleName) {
          outline.push({
            name: moduleName,
            type: 'module',
            range: this.getNodeRange(node),
            children: [],
          });
        }
        break;

      case 'function_definition':
        const funcName = this.findChildByType(node, 'identifier')?.text;
        if (funcName) {
          outline.push({
            name: funcName,
            type: 'function',
            range: this.getNodeRange(node),
            children: [],
          });
        }
        break;

      case 'assignment':
        const varName = this.findChildByType(node, 'identifier')?.text;
        if (varName) {
          outline.push({
            name: varName,
            type: 'variable',
            range: this.getNodeRange(node),
            children: [],
          });
        }
        break;
    }

    // Recursively process child nodes
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.extractOutlineFromNode(child, outline);
      }
    }
  }

  private findNodeAtPosition(
    node: TreeSitter.Node,
    position: Position
  ): TreeSitter.Node | null {
    if (!node) {
      return null;
    }

    // Check if position is within this node's range
    const start = node.startPosition;
    const end = node.endPosition;

    if (position.line >= start.row && position.line <= end.row) {
      if (position.line === start.row && position.column < start.column) {
        return null;
      }
      if (position.line === end.row && position.column > end.column) {
        return null;
      }

      // Check children first for more specific matches
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          const childMatch = this.findNodeAtPosition(child, position);
          if (childMatch) {
            return childMatch;
          }
        }
      }

      // Return this node if no more specific child match found
      return node;
    }

    return null;
  }

  private generateHoverInfo(node: TreeSitter.Node): HoverInfo | null {
    const contents: string[] = [];

    switch (node.type) {
      case 'module_call':
        const moduleName = this.findChildByType(node, 'identifier')?.text;
        contents.push(`**Module Call**: ${moduleName || 'unknown'}`);
        break;

      case 'function_definition':
        const funcName = this.findChildByType(node, 'identifier')?.text;
        contents.push(`**Function Definition**: ${funcName || 'anonymous'}`);
        break;

      case 'assignment':
        const varName = this.findChildByType(node, 'identifier')?.text;
        contents.push(`**Variable**: ${varName || 'unknown'}`);
        break;

      case 'identifier':
        contents.push(`**Identifier**: ${node.text}`);
        break;

      default:
        contents.push(`**${node.type}**`);
    }

    if (contents.length === 0) {
      return null;
    }

    return {
      contents,
      range: this.getNodeRange(node),
    };
  }

  private extractSymbolsFromNode(
    node: TreeSitter.Node,
    symbols: DocumentSymbol[]
  ): void {
    if (!node) return;

    // Extract symbol information
    switch (node.type) {
      case 'module_definition':
        const moduleName = this.findChildByType(node, 'identifier')?.text;
        if (moduleName) {
          symbols.push({
            name: moduleName,
            type: 'module',
            location: this.getNodeLocation(node),
            documentation: `Module definition: ${moduleName}`,
          });
        }
        break;

      case 'function_definition':
        const funcName = this.findChildByType(node, 'identifier')?.text;
        if (funcName) {
          symbols.push({
            name: funcName,
            type: 'function',
            location: this.getNodeLocation(node),
            documentation: `Function definition: ${funcName}`,
          });
        }
        break;

      case 'assignment':
        const varName = this.findChildByType(node, 'identifier')?.text;
        if (varName) {
          symbols.push({
            name: varName,
            type: 'variable',
            location: this.getNodeLocation(node),
            documentation: `Variable assignment: ${varName}`,
          });
        }
        break;
    }

    // Recursively process child nodes
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.extractSymbolsFromNode(child, symbols);
      }
    }
  }

  private findChildByType(
    node: TreeSitter.Node,
    type: string
  ): TreeSitter.Node | null {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === type) {
        return child;
      }
    }
    return null;
  }

  private getNodeRange(node: TreeSitter.Node): OutlineItem['range'] {
    return {
      startLine: node.startPosition.row,
      startColumn: node.startPosition.column,
      endLine: node.endPosition.row,
      endColumn: node.endPosition.column,
    };
  }

  private getNodeLocation(node: TreeSitter.Node): DocumentSymbol['location'] {
    return {
      line: node.startPosition.row,
      column: node.startPosition.column,
    };
  }
}

