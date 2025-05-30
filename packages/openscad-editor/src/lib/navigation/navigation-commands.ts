/**
 * OpenSCAD Navigation Commands
 * 
 * Defines keyboard shortcuts and commands for navigation features.
 */

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { OpenSCADNavigationProvider } from './navigation-provider';

export interface NavigationCommands {
  goToLine: () => void;
  goToSymbol: () => void;
  goToDefinition: () => void;
  findReferences: () => void;
  searchSymbols: () => void;
}

export function registerNavigationCommands(
  editor: monaco.editor.IStandaloneCodeEditor,
  navigationProvider: OpenSCADNavigationProvider
): NavigationCommands {
  
  // Go to Line (Ctrl+G)
  const goToLineAction = editor.addAction({
    id: 'openscad.goToLine',
    label: 'Go to Line...',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 1,
    run: async () => {
      const lineNumber = await showGoToLineDialog();
      if (lineNumber) {
        const position = await navigationProvider.jumpToLine(editor.getModel()!, lineNumber);
        if (position) {
          editor.setPosition(position);
          editor.revealLine(position.lineNumber, monaco.editor.ScrollType.Smooth);
        }
      }
    }
  });

  // Go to Symbol (Ctrl+Shift+O)
  const goToSymbolAction = editor.addAction({
    id: 'openscad.goToSymbol',
    label: 'Go to Symbol...',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO],
    contextMenuGroupId: '1_modification', 
    contextMenuOrder: 2,
    run: async () => {
      const symbolName = await showGoToSymbolDialog(navigationProvider);
      if (symbolName) {
        const position = await navigationProvider.jumpToSymbol(editor.getModel()!, symbolName);
        if (position) {
          editor.setPosition(position);
          editor.revealLine(position.lineNumber, monaco.editor.ScrollType.Smooth);
        }
      }
    }
  });

  // Go to Definition (F12)
  const goToDefinitionAction = editor.addAction({
    id: 'openscad.goToDefinition',
    label: 'Go to Definition',
    keybindings: [monaco.KeyCode.F12],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 3,
    run: async () => {
      const position = editor.getPosition();
      const model = editor.getModel();
      if (position && model) {
        const definition = await navigationProvider.provideDefinition(model, position);
        if (definition && 'range' in definition) {
          editor.setPosition({
            lineNumber: definition.range.startLineNumber,
            column: definition.range.startColumn
          });
          editor.revealLine(definition.range.startLineNumber, monaco.editor.ScrollType.Smooth);
        }
      }
    }
  });

  // Find All References (Shift+F12)
  const findReferencesAction = editor.addAction({
    id: 'openscad.findReferences',
    label: 'Find All References',
    keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.F12],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 4,
    run: async () => {
      const position = editor.getPosition();
      const model = editor.getModel();
      if (position && model) {
        const references = await navigationProvider.provideReferences(
          model, 
          position, 
          { includeDeclaration: true }
        );
        if (references && references.length > 0) {
          showReferencesPanel(references);
        }
      }
    }
  });

  // Search Symbols (Ctrl+T)
  const searchSymbolsAction = editor.addAction({
    id: 'openscad.searchSymbols',
    label: 'Search Symbols...',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 5,
    run: async () => {
      const query = await showSymbolSearchDialog();
      if (query) {
        const symbols = await navigationProvider.searchSymbols(query);
        if (symbols.length > 0) {
          showSymbolSearchResults(symbols, editor);
        }
      }
    }
  });

  return {
    goToLine: () => editor.trigger('keyboard', 'editor.action.gotoLine', null),
    goToSymbol: () => editor.trigger('keyboard', 'editor.action.quickOutline', null),
    goToDefinition: () => editor.trigger('keyboard', 'editor.action.revealDefinition', null),
    findReferences: () => editor.trigger('keyboard', 'editor.action.goToReferences', null),
    searchSymbols: () => editor.trigger('keyboard', 'workbench.action.showAllSymbols', null)
  };
}

// Dialog implementations (simplified for demo)
async function showGoToLineDialog(): Promise<number | null> {
  const input = prompt('Go to line number:');
  const lineNumber = input ? parseInt(input, 10) : null;
  return lineNumber && !isNaN(lineNumber) && lineNumber > 0 ? lineNumber : null;
}

async function showGoToSymbolDialog(navigationProvider: OpenSCADNavigationProvider): Promise<string | null> {
  // In a real implementation, this would show a searchable list of symbols
  const symbols = await navigationProvider.searchSymbols('');
  if (symbols.length === 0) {
    alert('No symbols found in the document');
    return null;
  }
  
  const symbolNames = symbols.map(s => `${s.name} (${s.type})`).join('\n');
  const input = prompt(`Available symbols:\n${symbolNames}\n\nEnter symbol name:`);
  return input || null;
}

async function showSymbolSearchDialog(): Promise<string | null> {
  const query = prompt('Search symbols (enter partial name):');
  return query || null;
}

function showReferencesPanel(references: monaco.languages.Location[]): void {
  // In a real implementation, this would show a proper references panel
  const referenceList = references.map((ref, index) => 
    `${index + 1}. Line ${ref.range.startLineNumber}, Column ${ref.range.startColumn}`
  ).join('\n');
  
  alert(`Found ${references.length} references:\n\n${referenceList}`);
}

function showSymbolSearchResults(
  symbols: Array<{ name: string; type: string; range: any }>, 
  editor: monaco.editor.IStandaloneCodeEditor
): void {
  // In a real implementation, this would show a proper results panel
  const symbolList = symbols.map((symbol, index) => 
    `${index + 1}. ${symbol.name} (${symbol.type}) - Line ${symbol.range.startLine + 1}`
  ).join('\n');
  
  const selection = prompt(`Found ${symbols.length} symbols:\n\n${symbolList}\n\nEnter number to jump to:`);
  const index = selection ? parseInt(selection, 10) - 1 : -1;
  
  if (index >= 0 && index < symbols.length) {
    const symbol = symbols[index];
    if (symbol) {
      const position = new monaco.Position(
        symbol.range.startLine + 1,
        symbol.range.startColumn + 1
      );
      editor.setPosition(position);
      editor.revealLine(position.lineNumber, monaco.editor.ScrollType.Smooth);
    }
  }
}
