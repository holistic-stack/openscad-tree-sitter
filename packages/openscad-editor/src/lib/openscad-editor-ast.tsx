import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { type Monaco, loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { registerOpenSCADLanguage } from './openscad-language';
import { OpenSCADParserService, type ParseResult, type OutlineItem } from './services/openscad-parser-service';
import { OpenSCADCompletionProvider } from './completion/completion-provider';
import { OpenSCADNavigationProvider } from './navigation/navigation-provider';
import { registerNavigationCommands, type NavigationCommands } from './navigation/navigation-commands';
import { FormattingService } from './formatting/formatting-service';

const LANGUAGE_ID = 'openscad';
const THEME_ID = 'openscad-dark';

export interface OpenscadEditorASTProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onParseResult?: (result: ParseResult) => void;
  onOutlineChange?: (outline: OutlineItem[]) => void;
  onFormattingServiceReady?: (service: FormattingService) => void;
  height?: string;
  width?: string;
  options?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
}

interface DiagnosticInfo {
  parseTime: number;
  nodeCount: number;
  errorCount: number;
  hasErrors: boolean;
}

export const OpenscadEditorAST: React.FC<OpenscadEditorASTProps> = ({
  initialCode = '',
  onCodeChange,
  onParseResult,
  onOutlineChange,
  onFormattingServiceReady,
  height = '400px',
  width = '100%',
  options = {},
}) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const parserServiceRef = useRef<OpenSCADParserService | null>(null);
  const completionProviderRef = useRef<OpenSCADCompletionProvider | null>(null);
  const navigationProviderRef = useRef<OpenSCADNavigationProvider | null>(null);
  const navigationCommandsRef = useRef<NavigationCommands | null>(null);
  const formattingServiceRef = useRef<FormattingService | null>(null);
  const disposablesRef = useRef<monacoEditor.IDisposable[]>([]);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [isParserReady, setIsParserReady] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo>({
    parseTime: 0,
    nodeCount: 0,
    errorCount: 0,
    hasErrors: false
  });

  // Initialize Monaco and register language
  useEffect(() => {
    loader.init().then((monaco) => {
      monacoRef.current = monaco;
      
      // Register language without parser service initially
      const { disposables } = registerOpenSCADLanguage(monaco);
      disposablesRef.current.push(...disposables);
      
      setIsMonacoReady(true);
    });

    return () => {
      // Cleanup disposables
      disposablesRef.current.forEach(disposable => disposable.dispose());
      disposablesRef.current = [];
    };
  }, []);

  // Initialize parser service and related providers
  useEffect(() => {
    const initParser = async () => {
      try {
        const service = new OpenSCADParserService();
        await service.init();
        parserServiceRef.current = service;
        
        // Initialize completion provider with parser service
        const completionProvider = new OpenSCADCompletionProvider(service);
        completionProviderRef.current = completionProvider;
        
        // Initialize navigation provider with parser service
        const navigationProvider = new OpenSCADNavigationProvider(service);
        navigationProviderRef.current = navigationProvider;
        
        // Initialize formatting service if Monaco is ready
        if (monacoRef.current) {
          const { disposables, formattingService } = registerOpenSCADLanguage(
            monacoRef.current,
            service
          );
          
          // Add new disposables
          disposablesRef.current.push(...disposables);
          
          if (formattingService) {
            formattingServiceRef.current = formattingService;
            onFormattingServiceReady?.(formattingService);
            console.log('✅ Formatting service initialized and ready');
          }
        }
        
        setIsParserReady(true);
        console.log('✅ AST Parser Service, Completion Provider, Navigation Provider, and Formatting Service initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize parser service:', error);
      }
    };

    if (isMonacoReady) {
      initParser();
    }

    return () => {
      if (parserServiceRef.current) {
        parserServiceRef.current.dispose();
      }
    };
  }, [isMonacoReady, onFormattingServiceReady]);

  // Debounced parsing function
  const parseCode = useCallback(async (code: string) => {
    if (!parserServiceRef.current?.isReady()) {
      console.log('⏳ Parser not ready, skipping parse');
      return;
    }

    const startTime = performance.now();
    
    try {
      const result = await parserServiceRef.current.parseDocument(code);
      const parseTime = performance.now() - startTime;
      
      // Update diagnostics
      const nodeCount = result.ast ? countNodes(result.ast.rootNode) : 0;
      setDiagnostic({
        parseTime: Math.round(parseTime * 100) / 100,
        nodeCount,
        errorCount: result.errors.length,
        hasErrors: !result.success
      });

      // Update Monaco error markers
      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = result.errors.map(error => ({
            severity: monacoRef.current!.MarkerSeverity.Error,
            startLineNumber: error.location.line + 1,
            startColumn: error.location.column + 1,
            endLineNumber: error.location.line + 1,
            endColumn: error.location.column + 10, // Approximate end
            message: error.message,
            source: 'openscad-parser'
          }));
          
          monacoRef.current.editor.setModelMarkers(model, 'openscad', markers);
        }
      }

      // Get outline
      const outline = parserServiceRef.current.getDocumentOutline();
      
      // Notify callbacks
      onParseResult?.(result);
      onOutlineChange?.(outline);
      
      console.log(`🌳 AST parsed: ${nodeCount} nodes, ${result.errors.length} errors, ${parseTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('❌ Parse error:', error);
      setDiagnostic(prev => ({ ...prev, hasErrors: true, errorCount: 1 }));
    }
  }, [onParseResult, onOutlineChange]);

  // Handle code changes with debouncing
  const handleCodeChange = useCallback((value: string | undefined) => {
    const code = value || '';
    onCodeChange?.(code);

    // Clear existing timeout
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }

    // Debounce parsing (500ms delay)
    parseTimeoutRef.current = setTimeout(() => {
      parseCode(code);
    }, 500);
  }, [onCodeChange, parseCode]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Parse initial code
    const initialValue = editor.getValue();
    if (initialValue && isParserReady) {
      parseCode(initialValue);
    }

    // Add hover provider
    if (parserServiceRef.current) {
      monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover: (model, position) => {
          if (!parserServiceRef.current?.isReady()) return null;
          
          const hoverInfo = parserServiceRef.current.getHoverInfo({
            line: position.lineNumber - 1,
            column: position.column - 1
          });
          
          if (!hoverInfo) return null;
          
          return {
            range: new monaco.Range(
              hoverInfo.range.startLine + 1,
              hoverInfo.range.startColumn + 1,
              hoverInfo.range.endLine + 1,
              hoverInfo.range.endColumn + 1
            ),
            contents: hoverInfo.contents.map(content => ({ value: content }))
          };
        }
      });
    }

    // Register completion provider
    if (completionProviderRef.current) {
      monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, completionProviderRef.current);
      console.log('✅ Completion provider registered');
    }

    // Register navigation providers
    if (navigationProviderRef.current) {
      monaco.languages.registerDefinitionProvider(LANGUAGE_ID, navigationProviderRef.current);
      monaco.languages.registerReferenceProvider(LANGUAGE_ID, navigationProviderRef.current);
      console.log('✅ Navigation providers registered (go-to-definition, find-references)');
    }

    // Register navigation commands and shortcuts
    if (navigationProviderRef.current) {
      const commands = registerNavigationCommands(editor, navigationProviderRef.current);
      navigationCommandsRef.current = commands;
      console.log('✅ Navigation commands registered (Ctrl+G, F12, Shift+F12, Ctrl+T, Ctrl+Shift+O)');
    }

    // Add formatting keyboard shortcuts
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'modification',
      contextMenuOrder: 1.5,
      run: () => {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    });

    editor.addAction({
      id: 'format-selection',
      label: 'Format Selection',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'modification',
      contextMenuOrder: 1.6,
      run: () => {
        editor.getAction('editor.action.formatSelection')?.run();
      }
    });

    console.log('✅ Formatting keyboard shortcuts registered (Shift+Alt+F, Ctrl+K Ctrl+F)');
  }, [isParserReady, parseCode]);

  // Parse when parser becomes ready
  useEffect(() => {
    if (isParserReady && editorRef.current) {
      const currentCode = editorRef.current.getValue();
      if (currentCode) {
        parseCode(currentCode);
      }
    }
  }, [isParserReady, parseCode]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear parse timeout
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }

      // Note: Navigation commands (addAction) are automatically disposed when editor is disposed
      // Note: Language providers are automatically disposed when Monaco is cleaned up

      // Dispose all Monaco disposables
      disposablesRef.current.forEach(disposable => disposable.dispose());
      disposablesRef.current = [];

      // Dispose parser service
      if (parserServiceRef.current) {
        parserServiceRef.current.dispose();
      }

      console.log('✅ OpenSCAD AST Editor cleaned up');
    };
  }, []);

  const editorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    language: LANGUAGE_ID,
    theme: THEME_ID,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    glyphMargin: true,
    folding: true,
    lineDecorationsWidth: 20,
    lineNumbersMinChars: 3,
    ...options,
  };

  const getStatusColor = () => {
    if (!isParserReady) return '#999';
    if (diagnostic.hasErrors) return '#f44336';
    return '#4caf50';
  };

  return (
    <div style={{ height, width, display: 'flex', flexDirection: 'column' }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 12px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        fontSize: '12px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
            ●️ {isParserReady ? (diagnostic.hasErrors ? 'ERRORS' : 'READY') : 'LOADING'}
          </span>
          {isParserReady && (
            <>
              <span>⚡ {diagnostic.parseTime}ms</span>
              <span>🌳 {diagnostic.nodeCount} nodes</span>
              {diagnostic.errorCount > 0 && (
                <span style={{ color: '#f44336' }}>❌ {diagnostic.errorCount} errors</span>
              )}
            </>
          )}
        </div>
        <span style={{ color: '#888' }}>OpenSCAD AST Editor</span>
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage={LANGUAGE_ID}
          defaultValue={initialCode}
          options={editorOptions}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};

// Helper function to count AST nodes
function countNodes(node: any): number {
  let count = 1;
  if (node?.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  } else if (node?.childCount) {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        count += countNodes(child);
      }
    }
  }
  return count;
}

export default OpenscadEditorAST;
