/**
 * @file Enhanced OpenSCAD Editor with Real-time Error Detection
 * 
 * Advanced OpenSCAD editor component that includes all Phase 4 and Phase 5 features:
 * - Enhanced Code Completion
 * - Advanced Navigation & Search
 * - Enhanced Hover Information
 * - Real-time Error Detection (NEW)
 * - Quick Fix Suggestions (NEW)
 * - Comprehensive Diagnostics (NEW)
 * 
 * @example
 * ```tsx
 * <OpenscadEditorEnhanced
 *   value={code}
 *   onChange={setCode}
 *   enableDiagnostics={true}
 *   enableQuickFixes={true}
 *   onError={(errors) => console.log('Errors detected:', errors)}
 * />
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { type Monaco, loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { registerOpenSCADLanguage } from './openscad-language';
import { OpenSCADParserService, type ParseResult, type OutlineItem } from './services/openscad-parser-service';
import { OpenSCADCompletionProvider } from './completion/completion-provider';
import { OpenSCADNavigationProvider } from './navigation/navigation-provider';
import { registerNavigationCommands, type NavigationCommands } from './navigation/navigation-commands';
import { FormattingService } from './formatting/formatting-service';
import { OpenSCADHoverProvider } from './hover/hover-provider';
import { createDiagnosticsService, type DiagnosticsService, type OpenSCADDiagnostic } from './diagnostics';

const LANGUAGE_ID = 'openscad';
const THEME_ID = 'openscad-dark';

/**
 * Props for the Enhanced OpenSCAD Editor
 */
export interface OpenscadEditorEnhancedProps {
  /** Current code value */
  value?: string;
  /** Callback when code changes */
  onChange?: (value: string | undefined) => void;
  /** Editor height */
  height?: string | number;
  /** Editor width */
  width?: string | number;
  /** Editor theme */
  theme?: string;
  /** Monaco editor options */
  options?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
  /** Enable real-time error detection */
  enableDiagnostics?: boolean;
  /** Enable quick fix suggestions */
  enableQuickFixes?: boolean;
  /** Enable advanced navigation features */
  enableNavigation?: boolean;
  /** Enable hover information */
  enableHover?: boolean;
  /** Enable code completion */
  enableCompletion?: boolean;
  /** Enable code formatting */
  enableFormatting?: boolean;
  /** Callback when errors are detected */
  onError?: (errors: OpenSCADDiagnostic[]) => void;
  /** Callback when parse result changes */
  onParseResult?: (result: ParseResult) => void;
  /** Callback when outline changes */
  onOutlineChange?: (outline: OutlineItem[]) => void;
  /** WASM file path for the parser */
  wasmPath?: string;
}

/**
 * Enhanced OpenSCAD Editor Component
 * 
 * Provides a comprehensive OpenSCAD editing experience with:
 * - Real-time syntax highlighting
 * - Error detection and quick fixes
 * - Code completion and navigation
 * - Hover information and formatting
 * - AST-based features and diagnostics
 */
export const OpenscadEditorEnhanced: React.FC<OpenscadEditorEnhancedProps> = ({
  value = '',
  onChange,
  height = '400px',
  width = '100%',
  theme = THEME_ID,
  options = {},
  enableDiagnostics = true,
  enableQuickFixes = true,
  enableNavigation = true,
  enableHover = true,
  enableCompletion = true,
  enableFormatting = true,
  onError,
  onParseResult,
  onOutlineChange,
  wasmPath = '/tree-sitter-openscad.wasm'
}) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const parserServiceRef = useRef<OpenSCADParserService | null>(null);
  const diagnosticsServiceRef = useRef<DiagnosticsService | null>(null);
  const navigationCommandsRef = useRef<NavigationCommands | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [currentErrors, setCurrentErrors] = useState<OpenSCADDiagnostic[]>([]);

  /**
   * Initialize all editor services
   */
  const initializeServices = useCallback(async (monaco: Monaco) => {
    try {
      console.log('🚀 Initializing Enhanced OpenSCAD Editor services...');

      // Register OpenSCAD language
      registerOpenSCADLanguage(monaco);

      // Initialize parser service
      const parserService = new OpenSCADParserService();
      await parserService.init(wasmPath);
      parserServiceRef.current = parserService;

      // Initialize diagnostics service
      if (enableDiagnostics || enableQuickFixes) {
        const diagnosticsService = createDiagnosticsService(parserService, {
          enableRealTime: enableDiagnostics,
          errorDetection: {
            enableSyntaxErrors: true,
            enableSemanticErrors: true,
            enableWarnings: true,
            enableHints: true
          },
          quickFix: {
            enableSyntaxFixes: enableQuickFixes,
            enableSemanticFixes: enableQuickFixes,
            enableRefactoring: enableQuickFixes
          }
        });

        await diagnosticsService.init();
        diagnosticsService.registerWithMonaco(monaco);
        diagnosticsServiceRef.current = diagnosticsService;
      }

      // Register completion provider
      if (enableCompletion) {
        const completionProvider = new OpenSCADCompletionProvider(parserService);
        monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, completionProvider);
      }

      // Register navigation provider
      if (enableNavigation) {
        const navigationProvider = new OpenSCADNavigationProvider(parserService);
        monaco.languages.registerDefinitionProvider(LANGUAGE_ID, navigationProvider);
        monaco.languages.registerReferenceProvider(LANGUAGE_ID, navigationProvider);
        monaco.languages.registerDocumentSymbolProvider(LANGUAGE_ID, navigationProvider);
      }

      // Register hover provider
      if (enableHover) {
        const hoverProvider = new OpenSCADHoverProvider(parserService);
        monaco.languages.registerHoverProvider(LANGUAGE_ID, hoverProvider);
      }

      // Register formatting provider
      if (enableFormatting) {
        const formattingService = new FormattingService(parserService);
        formattingService.registerProvider(monaco, LANGUAGE_ID);
      }

      console.log('✅ Enhanced OpenSCAD Editor services initialized successfully');
      setIsInitialized(true);
      setInitError(null);
    } catch (error) {
      const errorMessage = `Failed to initialize Enhanced OpenSCAD Editor: ${error instanceof Error ? error.message : String(error)}`;
      console.error('❌', errorMessage);
      setInitError(errorMessage);
    }
  }, [wasmPath, enableDiagnostics, enableQuickFixes, enableNavigation, enableHover, enableCompletion, enableFormatting]);

  /**
   * Handle editor mount
   */
  const handleEditorDidMount = useCallback(async (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Initialize services
    await initializeServices(monaco);

    // Enable real-time diagnostics if requested
    if (enableDiagnostics && diagnosticsServiceRef.current) {
      const model = editor.getModel();
      if (model) {
        diagnosticsServiceRef.current.enableRealTimeDiagnostics(model);
        
        // Set up error monitoring
        const checkErrors = async () => {
          const diagnostics = diagnosticsServiceRef.current?.getDiagnostics(model) || [];
          setCurrentErrors(diagnostics);
          onError?.(diagnostics);
        };

        // Monitor for diagnostic changes
        const disposable = model.onDidChangeContent(() => {
          setTimeout(checkErrors, 500); // Debounce error checking
        });

        // Initial error check
        checkErrors();

        // Cleanup on unmount
        return () => {
          disposable.dispose();
        };
      }
    }

    // Register navigation commands if enabled
    if (enableNavigation && parserServiceRef.current) {
      navigationCommandsRef.current = registerNavigationCommands(editor, parserServiceRef.current);
    }

    // Set up content change monitoring for callbacks
    const model = editor.getModel();
    if (model) {
      const disposable = model.onDidChangeContent(async () => {
        if (parserServiceRef.current) {
          try {
            const code = model.getValue();
            const parseResult = await parserServiceRef.current.parseDocument(code);
            onParseResult?.(parseResult);

            const outline = parserServiceRef.current.getDocumentOutline();
            onOutlineChange?.(outline);
          } catch (error) {
            console.error('Error updating parse result:', error);
          }
        }
      });

      return () => {
        disposable.dispose();
      };
    }
  }, [initializeServices, enableDiagnostics, enableNavigation, onError, onParseResult, onOutlineChange]);

  /**
   * Handle editor unmount
   */
  const handleEditorWillUnmount = useCallback(() => {
    // Dispose services
    if (diagnosticsServiceRef.current) {
      diagnosticsServiceRef.current.dispose();
      diagnosticsServiceRef.current = null;
    }

    if (parserServiceRef.current) {
      parserServiceRef.current.dispose();
      parserServiceRef.current = null;
    }

    // Cleanup references
    editorRef.current = null;
    monacoRef.current = null;
    navigationCommandsRef.current = null;
  }, []);

  /**
   * Get current diagnostics
   */
  const getDiagnostics = useCallback((): OpenSCADDiagnostic[] => {
    return currentErrors;
  }, [currentErrors]);

  /**
   * Trigger manual error detection
   */
  const triggerDiagnostics = useCallback(async (): Promise<void> => {
    if (diagnosticsServiceRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const result = await diagnosticsServiceRef.current.triggerDiagnostics(model);
        if (result.success) {
          setCurrentErrors(result.data);
          onError?.(result.data);
        }
      }
    }
  }, [onError]);

  // Expose methods via ref (if needed)
  React.useImperativeHandle(editorRef, () => ({
    getDiagnostics,
    triggerDiagnostics,
    getEditor: () => editorRef.current,
    getParserService: () => parserServiceRef.current,
    getDiagnosticsService: () => diagnosticsServiceRef.current
  }));

  // Default editor options with enhanced features
  const defaultOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: true },
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    glyphMargin: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showVariables: true
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    ...options
  };

  if (initError) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1e1e1e',
        color: '#ff6b6b',
        padding: '20px',
        fontFamily: 'monospace'
      }}>
        <div>
          <h3>❌ Enhanced OpenSCAD Editor Initialization Error</h3>
          <p>{initError}</p>
          <p>Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width, position: 'relative' }}>
      <Editor
        height="100%"
        width="100%"
        language={LANGUAGE_ID}
        theme={theme}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeUnmount={handleEditorWillUnmount}
        options={defaultOptions}
        loading={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#1e1e1e',
            color: '#ffffff'
          }}>
            🚀 Loading Enhanced OpenSCAD Editor...
          </div>
        }
      />
      
      {/* Status indicator */}
      {isInitialized && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: currentErrors.length > 0 ? '#ff6b6b' : '#51cf66',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          {currentErrors.length > 0 ? `${currentErrors.length} errors` : '✓ No errors'}
        </div>
      )}
    </div>
  );
};

export default OpenscadEditorEnhanced;
