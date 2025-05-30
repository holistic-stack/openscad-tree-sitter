/**
 * OpenSCAD Navigation Provider
 * 
 * Provides advanced navigation features like go-to-definition,
 * find-all-references, and symbol search.
 */

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { type OutlineItem, type OpenSCADParserService } from '../services/openscad-parser-service';

interface NavigationContext {
  position: monaco.Position;
  model: monaco.editor.ITextModel;
  wordAtPosition: string;
  lineContent: string;
}

interface SymbolLocation {
  name: string;
  type: string;
  range: {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
  };
  kind: 'definition' | 'reference' | 'usage';
}

interface NavigationStats {
  lastOperation: string;
  symbolsFound: number;
  searchTime: number;
}

export class OpenSCADNavigationProvider implements 
  monaco.languages.DefinitionProvider,
  monaco.languages.ReferenceProvider {
  
  private parserService: OpenSCADParserService | null = null;
  private lastNavigationStats: NavigationStats = {
    lastOperation: '',
    symbolsFound: 0,
    searchTime: 0
  };

  constructor(parserService?: OpenSCADParserService) {
    this.parserService = parserService || null;
  }

  // Monaco Definition Provider Interface
  async provideDefinition(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): Promise<monaco.languages.Definition | null> {
    const startTime = performance.now();
    
    try {
      const context = this.analyzeNavigationContext(model, position);
      if (!context.wordAtPosition) {
        return null;
      }

      const definition = await this.findSymbolDefinition(context);
      
      const searchTime = performance.now() - startTime;
      this.lastNavigationStats = {
        lastOperation: 'go-to-definition',
        symbolsFound: definition ? 1 : 0,
        searchTime: Math.round(searchTime * 100) / 100
      };

      console.log(`🎯 Go-to-definition: "${context.wordAtPosition}" -> ${definition ? 'found' : 'not found'} (${searchTime.toFixed(2)}ms)`);

      return definition;

    } catch (error) {
      console.error('Navigation provider error:', error);
      return null;
    }
  }

  // Monaco Reference Provider Interface
  async provideReferences(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.ReferenceContext
  ): Promise<monaco.languages.Location[] | null> {
    const startTime = performance.now();
    
    try {
      const navContext = this.analyzeNavigationContext(model, position);
      if (!navContext.wordAtPosition) {
        return null;
      }

      const references = await this.findAllReferences(navContext, context.includeDeclaration);
      
      const searchTime = performance.now() - startTime;
      this.lastNavigationStats = {
        lastOperation: 'find-references',
        symbolsFound: references.length,
        searchTime: Math.round(searchTime * 100) / 100
      };

      console.log(`🔍 Find references: "${navContext.wordAtPosition}" -> ${references.length} found (${searchTime.toFixed(2)}ms)`);

      return references;

    } catch (error) {
      console.error('Reference provider error:', error);
      return null;
    }
  }

  private analyzeNavigationContext(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): NavigationContext {
    const lineContent = model.getLineContent(position.lineNumber);
    const wordInfo = model.getWordAtPosition(position);
    const wordAtPosition = wordInfo?.word || '';

    return {
      position,
      model,
      wordAtPosition,
      lineContent
    };
  }

  private async findSymbolDefinition(context: NavigationContext): Promise<monaco.languages.Definition | null> {
    if (!this.parserService?.isReady()) {
      return null;
    }

    try {
      // Get document outline to find symbol definitions
      const outline = this.parserService.getDocumentOutline();
      const definition = this.searchOutlineForDefinition(outline, context.wordAtPosition);
      
      if (definition) {
        return {
          uri: context.model.uri,
          range: new monaco.Range(
            definition.range.startLine + 1,
            definition.range.startColumn + 1,
            definition.range.endLine + 1,
            definition.range.endColumn + 1
          )
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding symbol definition:', error);
      return null;
    }
  }

  private searchOutlineForDefinition(outline: OutlineItem[], symbolName: string): OutlineItem | null {
    for (const item of outline) {
      // Check if this item matches
      if (item.name === symbolName) {
        return item;
      }
      
      // Search children recursively
      if (item.children) {
        const found = this.searchOutlineForDefinition(item.children, symbolName);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private async findAllReferences(
    context: NavigationContext,
    includeDeclaration: boolean
  ): Promise<monaco.languages.Location[]> {
    if (!this.parserService?.isReady()) {
      return [];
    }

    try {
      const references: monaco.languages.Location[] = [];
      const symbolName = context.wordAtPosition;
      
      // Use simple text-based search for references
      // In a more advanced implementation, this would use AST analysis
      const content = context.model.getValue();
      const lines = content.split('\n');
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if (!line) continue;
        
        const regex = new RegExp(`\\b${this.escapeRegex(symbolName)}\\b`, 'g');
        let match;
        
        while ((match = regex.exec(line)) !== null) {
          const startColumn = match.index + 1;
          const endColumn = startColumn + symbolName.length;
          
          // Skip if this is the declaration and includeDeclaration is false
          if (!includeDeclaration) {
            const outline = this.parserService.getDocumentOutline();
            const definition = this.searchOutlineForDefinition(outline, symbolName);
            if (definition && definition.range.startLine === lineIndex) {
              continue;
            }
          }
          
          references.push({
            uri: context.model.uri,
            range: new monaco.Range(
              lineIndex + 1,
              startColumn,
              lineIndex + 1,
              endColumn
            )
          });
        }
      }

      return references;
    } catch (error) {
      console.error('Error finding references:', error);
      return [];
    }
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Symbol search functionality
  async searchSymbols(query: string): Promise<SymbolLocation[]> {
    if (!this.parserService?.isReady()) {
      return [];
    }

    const startTime = performance.now();
    
    try {
      const outline = this.parserService.getDocumentOutline();
      const symbols = this.extractSymbolsFromOutline(outline);
      
      // Filter symbols based on query
      const filteredSymbols = symbols.filter(symbol => 
        symbol.name.toLowerCase().includes(query.toLowerCase())
      );

      const searchTime = performance.now() - startTime;
      this.lastNavigationStats = {
        lastOperation: 'symbol-search',
        symbolsFound: filteredSymbols.length,
        searchTime: Math.round(searchTime * 100) / 100
      };

      console.log(`🔍 Symbol search: "${query}" -> ${filteredSymbols.length} found (${searchTime.toFixed(2)}ms)`);

      return filteredSymbols;
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  private extractSymbolsFromOutline(outline: OutlineItem[]): SymbolLocation[] {
    const symbols: SymbolLocation[] = [];
    
    const processItem = (item: OutlineItem) => {
      symbols.push({
        name: item.name,
        type: item.type,
        range: item.range,
        kind: 'definition'
      });
      
      if (item.children) {
        item.children.forEach(processItem);
      }
    };
    
    outline.forEach(processItem);
    return symbols;
  }

  // Quick navigation commands
  async jumpToLine(model: monaco.editor.ITextModel, lineNumber: number): Promise<monaco.Position | null> {
    const lineCount = model.getLineCount();
    if (lineNumber < 1 || lineNumber > lineCount) {
      return null;
    }
    
    return new monaco.Position(lineNumber, 1);
  }

  async jumpToSymbol(model: monaco.editor.ITextModel, symbolName: string): Promise<monaco.Position | null> {
    if (!this.parserService?.isReady()) {
      return null;
    }

    try {
      const outline = this.parserService.getDocumentOutline();
      const symbol = this.searchOutlineForDefinition(outline, symbolName);
      
      if (symbol) {
        return new monaco.Position(
          symbol.range.startLine + 1,
          symbol.range.startColumn + 1
        );
      }
      
      return null;
    } catch (error) {
      console.error('Error jumping to symbol:', error);
      return null;
    }
  }

  getLastNavigationStats(): NavigationStats {
    return this.lastNavigationStats;
  }

  setParserService(parserService: OpenSCADParserService): void {
    this.parserService = parserService;
  }
}
