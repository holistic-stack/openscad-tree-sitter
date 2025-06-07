/**
 * @file Enhanced Code Folding Provider for OpenSCAD
 * 
 * Provides intelligent code folding based on OpenSCAD AST structure.
 * Supports folding for modules, functions, control structures, and blocks.
 * 
 * @example
 * ```typescript
 * const foldingProvider = new OpenSCADFoldingProvider(parserService);
 * monaco.languages.registerFoldingRangeProvider('openscad', foldingProvider);
 * ```
 */

import * as monaco from 'monaco-editor';
import { OpenSCADParserService } from '../services/openscad-parser-service';

/**
 * OpenSCAD-specific folding range types
 */
export enum OpenSCADFoldingKind {
  Module = 'module',
  Function = 'function',
  ControlStructure = 'control',
  Block = 'block',
  Comment = 'comment',
  Array = 'array',
  Object = 'object'
}

/**
 * Enhanced folding range with OpenSCAD-specific metadata
 */
export interface OpenSCADFoldingRange extends monaco.languages.FoldingRange {
  readonly nodeType?: string;
  readonly symbolName?: string | undefined;
  readonly foldingKind: OpenSCADFoldingKind;
}

/**
 * Configuration for folding behavior
 */
export interface FoldingConfig {
  readonly enableModuleFolding: boolean;
  readonly enableFunctionFolding: boolean;
  readonly enableControlStructureFolding: boolean;
  readonly enableBlockFolding: boolean;
  readonly enableCommentFolding: boolean;
  readonly enableArrayFolding: boolean;
  readonly minimumFoldingLines: number;
}

/**
 * Default folding configuration
 */
export const DEFAULT_FOLDING_CONFIG: FoldingConfig = {
  enableModuleFolding: true,
  enableFunctionFolding: true,
  enableControlStructureFolding: true,
  enableBlockFolding: true,
  enableCommentFolding: true,
  enableArrayFolding: true,
  minimumFoldingLines: 2
};

/**
 * Result type for folding operations
 */
type FoldingResult<T> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

/**
 * Enhanced Code Folding Provider for OpenSCAD
 * 
 * Provides intelligent code folding based on AST analysis:
 * - Module and function definitions
 * - Control structures (if, for, while)
 * - Block statements and compound expressions
 * - Multi-line comments and arrays
 * - Configurable folding behavior
 */
export class OpenSCADFoldingProvider implements monaco.languages.FoldingRangeProvider {
  private readonly parserService: OpenSCADParserService;
  private readonly config: FoldingConfig;

  constructor(
    parserService: OpenSCADParserService,
    config: Partial<FoldingConfig> = {}
  ) {
    this.parserService = parserService;
    this.config = { ...DEFAULT_FOLDING_CONFIG, ...config };
  }

  /**
   * Provide folding ranges for the document
   */
  async provideFoldingRanges(
    model: monaco.editor.ITextModel,
    context: monaco.languages.FoldingContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.FoldingRange[]> {
    try {
      const code = model.getValue();
      const parseResult = await this.parserService.parseDocument(code);

      if (!parseResult.success || !parseResult.ast) {
        return [];
      }

      const foldingRanges = this.extractFoldingRanges(parseResult.ast, model);
      return this.filterAndSortRanges(foldingRanges);
    } catch (error) {
      console.error('Error providing folding ranges:', error);
      return [];
    }
  }

  /**
   * Extract folding ranges from AST
   */
  private extractFoldingRanges(
    node: any,
    model: monaco.editor.ITextModel,
    ranges: OpenSCADFoldingRange[] = []
  ): OpenSCADFoldingRange[] {
    if (!node || typeof node !== 'object') {
      return ranges;
    }

    // Process current node
    const foldingRange = this.createFoldingRange(node, model);
    if (foldingRange) {
      ranges.push(foldingRange);
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.extractFoldingRanges(child, model, ranges);
      }
    }

    return ranges;
  }

  /**
   * Create folding range for a specific node
   */
  private createFoldingRange(
    node: any,
    model: monaco.editor.ITextModel
  ): OpenSCADFoldingRange | null {
    if (!node.startPosition || !node.endPosition) {
      return null;
    }

    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;

    // Check minimum folding lines requirement
    if (endLine - startLine < this.config.minimumFoldingLines) {
      return null;
    }

    const nodeType = node.type;
    const foldingKind = this.getFoldingKind(nodeType);

    // Check if this folding type is enabled
    if (!this.isFoldingEnabled(foldingKind)) {
      return null;
    }

    // Extract symbol name for modules and functions
    const symbolName = this.extractSymbolName(node);

    const kind = this.mapToMonacoFoldingKind(foldingKind);

    return {
      start: startLine + 1, // Monaco uses 1-based line numbers
      end: endLine + 1,
      ...(kind && { kind }),
      nodeType,
      symbolName,
      foldingKind
    };
  }

  /**
   * Determine folding kind based on node type
   */
  private getFoldingKind(nodeType: string): OpenSCADFoldingKind {
    switch (nodeType) {
      case 'module_definition':
        return OpenSCADFoldingKind.Module;
      case 'function_definition':
        return OpenSCADFoldingKind.Function;
      case 'if_statement':
      case 'for_statement':
      case 'while_statement':
      case 'intersection_for':
        return OpenSCADFoldingKind.ControlStructure;
      case 'block_statement':
      case 'compound_statement':
        return OpenSCADFoldingKind.Block;
      case 'comment':
      case 'block_comment':
        return OpenSCADFoldingKind.Comment;
      case 'array':
      case 'list_expression':
        return OpenSCADFoldingKind.Array;
      case 'object':
      case 'dictionary':
        return OpenSCADFoldingKind.Object;
      default:
        return OpenSCADFoldingKind.Block;
    }
  }

  /**
   * Check if folding is enabled for the given kind
   */
  private isFoldingEnabled(kind: OpenSCADFoldingKind): boolean {
    switch (kind) {
      case OpenSCADFoldingKind.Module:
        return this.config.enableModuleFolding;
      case OpenSCADFoldingKind.Function:
        return this.config.enableFunctionFolding;
      case OpenSCADFoldingKind.ControlStructure:
        return this.config.enableControlStructureFolding;
      case OpenSCADFoldingKind.Block:
        return this.config.enableBlockFolding;
      case OpenSCADFoldingKind.Comment:
        return this.config.enableCommentFolding;
      case OpenSCADFoldingKind.Array:
      case OpenSCADFoldingKind.Object:
        return this.config.enableArrayFolding;
      default:
        return true;
    }
  }

  /**
   * Map OpenSCAD folding kind to Monaco folding kind
   */
  private mapToMonacoFoldingKind(kind: OpenSCADFoldingKind): monaco.languages.FoldingRangeKind | undefined {
    switch (kind) {
      case OpenSCADFoldingKind.Comment:
        return monaco.languages.FoldingRangeKind.Comment;
      case OpenSCADFoldingKind.Array:
      case OpenSCADFoldingKind.Object:
        return monaco.languages.FoldingRangeKind.Region;
      default:
        return undefined; // Use default folding kind
    }
  }

  /**
   * Extract symbol name from node (for modules and functions)
   */
  private extractSymbolName(node: any): string | undefined {
    if (node.type === 'module_definition' || node.type === 'function_definition') {
      // Look for identifier child
      const identifier = node.children?.find((child: any) => child.type === 'identifier');
      return identifier?.text;
    }
    return undefined;
  }

  /**
   * Filter and sort folding ranges
   */
  private filterAndSortRanges(ranges: OpenSCADFoldingRange[]): monaco.languages.FoldingRange[] {
    // Remove overlapping ranges (keep the outermost)
    const filteredRanges = this.removeOverlappingRanges(ranges);

    // Sort by start line
    return filteredRanges.sort((a, b) => a.start - b.start);
  }

  /**
   * Remove overlapping folding ranges
   */
  private removeOverlappingRanges(ranges: OpenSCADFoldingRange[]): OpenSCADFoldingRange[] {
    if (ranges.length <= 1) {
      return ranges;
    }

    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
    const result: OpenSCADFoldingRange[] = [];

    for (const range of sortedRanges) {
      const isOverlapping = result.some(existing => 
        this.rangesOverlap(existing, range)
      );

      if (!isOverlapping) {
        result.push(range);
      }
    }

    return result;
  }

  /**
   * Check if two ranges overlap
   */
  private rangesOverlap(range1: OpenSCADFoldingRange, range2: OpenSCADFoldingRange): boolean {
    return (
      (range1.start <= range2.start && range1.end >= range2.end) ||
      (range2.start <= range1.start && range2.end >= range1.end)
    );
  }

  /**
   * Update folding configuration
   */
  updateConfig(newConfig: Partial<FoldingConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Get current folding configuration
   */
  getConfig(): Readonly<FoldingConfig> {
    return { ...this.config };
  }
}

/**
 * Create and configure folding provider
 */
export function createFoldingProvider(
  parserService: OpenSCADParserService,
  config?: Partial<FoldingConfig>
): OpenSCADFoldingProvider {
  return new OpenSCADFoldingProvider(parserService, config);
}
