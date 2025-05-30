/**
 * OpenSCAD Completion Provider
 * 
 * Provides intelligent code completion for OpenSCAD using AST analysis
 * and built-in symbol database.
 */

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { ALL_OPENSCAD_SYMBOLS, SYMBOL_BY_NAME, OPENSCAD_SNIPPETS, type SymbolInfo } from './openscad-symbols';
import { type OutlineItem, type OpenSCADParserService } from '../services/openscad-parser-service';

interface CompletionContext {
  position: monaco.Position;
  model: monaco.editor.ITextModel;
  lineContent: string;
  wordAtPosition: string;
  isInString: boolean;
  isInComment: boolean;
  triggerCharacter?: string | undefined;
}

interface CompletionStats {
  totalSuggestions: number;
  astSymbols: number;
  builtinSymbols: number;
  snippets: number;
  computeTime: number;
}

export class OpenSCADCompletionProvider implements monaco.languages.CompletionItemProvider {
  private parserService: OpenSCADParserService | null = null;
  private lastCompletionStats: CompletionStats = {
    totalSuggestions: 0,
    astSymbols: 0,
    builtinSymbols: 0,
    snippets: 0,
    computeTime: 0
  };

  constructor(parserService?: OpenSCADParserService) {
    this.parserService = parserService || null;
  }

  triggerCharacters = ['.', '(', '[', ' '];

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext
  ): Promise<monaco.languages.CompletionList> {
    const startTime = performance.now();
    
    try {
      const completionContext = this.analyzeContext(model, position, context.triggerCharacter);
      const suggestions: monaco.languages.CompletionItem[] = [];

      // Skip completion in strings and comments
      if (completionContext.isInString || completionContext.isInComment) {
        return { suggestions: [] };
      }

      // Get AST-based symbols
      const astSymbols = await this.getASTSymbols(completionContext);
      suggestions.push(...astSymbols);

      // Get built-in OpenSCAD symbols
      const builtinSymbols = this.getBuiltinSymbols(completionContext);
      suggestions.push(...builtinSymbols);

      // Get snippets
      const snippets = this.getSnippets(completionContext);
      suggestions.push(...snippets);

      // Update stats
      const computeTime = performance.now() - startTime;
      this.lastCompletionStats = {
        totalSuggestions: suggestions.length,
        astSymbols: astSymbols.length,
        builtinSymbols: builtinSymbols.length,
        snippets: snippets.length,
        computeTime: Math.round(computeTime * 100) / 100
      };

      console.log(`🔍 Completion: ${suggestions.length} suggestions in ${computeTime.toFixed(2)}ms`);

      return {
        suggestions,
        incomplete: false
      };

    } catch (error) {
      console.error('Completion provider error:', error);
      return { suggestions: [] };
    }
  }

  private analyzeContext(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    triggerCharacter?: string
  ): CompletionContext {
    const lineContent = model.getLineContent(position.lineNumber);
    const wordInfo = model.getWordAtPosition(position);
    const wordAtPosition = wordInfo?.word || '';

    // Simple heuristics for context detection
    const beforeCursor = lineContent.substring(0, position.column - 1);
    const isInString = this.isInsideString(beforeCursor);
    const isInComment = this.isInsideComment(beforeCursor);

    return {
      position,
      model,
      lineContent,
      wordAtPosition,
      isInString,
      isInComment,
      triggerCharacter
    };
  }

  private isInsideString(text: string): boolean {
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
      }
    }
    
    return inString;
  }

  private isInsideComment(text: string): boolean {
    // Check for single-line comment
    if (text.includes('//')) {
      const commentIndex = text.lastIndexOf('//');
      // Make sure it's not inside a string
      const beforeComment = text.substring(0, commentIndex);
      if (!this.isInsideString(beforeComment)) {
        return true;
      }
    }
    
    // TODO: Add multi-line comment detection
    return false;
  }

  private async getASTSymbols(context: CompletionContext): Promise<monaco.languages.CompletionItem[]> {
    if (!this.parserService?.isReady()) {
      return [];
    }

    try {
      // Get document outline (symbols from AST)
      const outline = this.parserService.getDocumentOutline();
      return this.convertOutlineToCompletions(outline, context);
    } catch (error) {
      console.error('Error getting AST symbols:', error);
      return [];
    }
  }

  private convertOutlineToCompletions(
    outline: OutlineItem[],
    context: CompletionContext
  ): monaco.languages.CompletionItem[] {
    const completions: monaco.languages.CompletionItem[] = [];

    const processOutlineItem = (item: OutlineItem) => {
      // Skip if this symbol is defined after current position
      if (item.range.startLine >= context.position.lineNumber - 1) {
        return;
      }

      const completion: monaco.languages.CompletionItem = {
        label: item.name,
        kind: this.getCompletionKind(item.type),
        detail: `${item.type} (line ${item.range.startLine + 1})`,
        documentation: `User-defined ${item.type}: ${item.name}`,
        insertText: item.name,
        range: {
          startLineNumber: context.position.lineNumber,
          endLineNumber: context.position.lineNumber,
          startColumn: context.position.column - context.wordAtPosition.length,
          endColumn: context.position.column
        },
        sortText: `1_${item.name}` // Prioritize user symbols
      };

      completions.push(completion);

      // Process children recursively
      if (item.children) {
        item.children.forEach(processOutlineItem);
      }
    };

    outline.forEach(processOutlineItem);
    return completions;
  }

  private getBuiltinSymbols(context: CompletionContext): monaco.languages.CompletionItem[] {
    const completions: monaco.languages.CompletionItem[] = [];
    const filter = context.wordAtPosition.toLowerCase();

    ALL_OPENSCAD_SYMBOLS.forEach(symbol => {
      // Simple filtering based on current word
      if (filter && !symbol.name.toLowerCase().startsWith(filter)) {
        return;
      }

      const completion: monaco.languages.CompletionItem = {
        label: symbol.name,
        kind: this.getCompletionKindFromSymbol(symbol),
        detail: `${symbol.type} - ${symbol.category}`,
        documentation: this.createDocumentation(symbol),
        insertText: this.createInsertText(symbol),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: {
          startLineNumber: context.position.lineNumber,
          endLineNumber: context.position.lineNumber,
          startColumn: context.position.column - context.wordAtPosition.length,
          endColumn: context.position.column
        },
        sortText: `2_${symbol.name}` // Lower priority than user symbols
      };

      completions.push(completion);
    });

    return completions;
  }

  private getSnippets(context: CompletionContext): monaco.languages.CompletionItem[] {
    const completions: monaco.languages.CompletionItem[] = [];
    const filter = context.wordAtPosition.toLowerCase();

    Object.entries(OPENSCAD_SNIPPETS).forEach(([name, snippet]) => {
      // Simple filtering
      if (filter && !name.toLowerCase().startsWith(filter)) {
        return;
      }

      const completion: monaco.languages.CompletionItem = {
        label: name,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Snippet',
        documentation: `Code snippet for ${name}`,
        insertText: snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: {
          startLineNumber: context.position.lineNumber,
          endLineNumber: context.position.lineNumber,
          startColumn: context.position.column - context.wordAtPosition.length,
          endColumn: context.position.column
        },
        sortText: `3_${name}` // Lowest priority
      };

      completions.push(completion);
    });

    return completions;
  }

  private getCompletionKind(itemType: string): monaco.languages.CompletionItemKind {
    switch (itemType) {
      case 'module': return monaco.languages.CompletionItemKind.Module;
      case 'function': return monaco.languages.CompletionItemKind.Function;
      case 'variable': return monaco.languages.CompletionItemKind.Variable;
      default: return monaco.languages.CompletionItemKind.Text;
    }
  }

  private getCompletionKindFromSymbol(symbol: SymbolInfo): monaco.languages.CompletionItemKind {
    switch (symbol.type) {
      case 'module': return monaco.languages.CompletionItemKind.Module;
      case 'function': return monaco.languages.CompletionItemKind.Function;
      case 'constant': return monaco.languages.CompletionItemKind.Constant;
      case 'variable': return monaco.languages.CompletionItemKind.Variable;
      default: return monaco.languages.CompletionItemKind.Text;
    }
  }

  private createDocumentation(symbol: SymbolInfo): monaco.IMarkdownString {
    let markdown = `**${symbol.name}** (${symbol.type})\n\n${symbol.description}`;

    if (symbol.parameters && symbol.parameters.length > 0) {
      markdown += '\n\n**Parameters:**\n';
      symbol.parameters.forEach(param => {
        const required = param.required ? '*(required)*' : '*(optional)*';
        const defaultVal = param.defaultValue ? ` = ${param.defaultValue}` : '';
        markdown += `- \`${param.name}\`: ${param.type}${defaultVal} ${required} - ${param.description}\n`;
      });
    }

    if (symbol.returnType) {
      markdown += `\n**Returns:** ${symbol.returnType}`;
    }

    if (symbol.examples && symbol.examples.length > 0) {
      markdown += '\n\n**Examples:**\n```openscad\n';
      symbol.examples.forEach(example => {
        markdown += `${example}\n`;
      });
      markdown += '```';
    }

    return { value: markdown };
  }

  private createInsertText(symbol: SymbolInfo): string {
    if (symbol.type === 'function' && symbol.parameters && symbol.parameters.length > 0) {
      // Create function call with parameter placeholders
      const requiredParams = symbol.parameters.filter(p => p.required);
      if (requiredParams.length > 0) {
        const paramPlaceholders = requiredParams.map((param, index) => 
          `\${${index + 1}:${param.name}}`
        ).join(', ');
        return `${symbol.name}(${paramPlaceholders})`;
      }
    }

    if (symbol.type === 'module' && symbol.parameters && symbol.parameters.length > 0) {
      // Create module call with parameter placeholders
      const requiredParams = symbol.parameters.filter(p => p.required);
      if (requiredParams.length > 0) {
        const paramPlaceholders = requiredParams.map((param, index) => 
          `\${${index + 1}:${param.name}}`
        ).join(', ');
        return `${symbol.name}(${paramPlaceholders})`;
      }
    }

    return symbol.name;
  }

  getLastCompletionStats(): CompletionStats {
    return this.lastCompletionStats;
  }

  setParserService(parserService: OpenSCADParserService): void {
    this.parserService = parserService;
  }
}
