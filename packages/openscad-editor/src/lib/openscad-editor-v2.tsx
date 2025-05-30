import React, { useEffect, useRef, useState } from 'react';
import Editor, { type Monaco, loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { registerOpenSCADLanguage } from './openscad-language';

const LANGUAGE_ID = 'openscad';
const THEME_ID = 'openscad-dark';

interface OpenscadEditorV2Props {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  theme?: string;
  height?: string | number;
  options?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
}

const OpenscadEditorV2: React.FC<OpenscadEditorV2Props> = ({
  initialCode = '',
  onCodeChange,
  theme = THEME_ID,
  height = '100%',
  options = {},
}) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isLanguageRegistered, setIsLanguageRegistered] = useState(false);

  // Initialize Monaco and register OpenSCAD language
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        // Initialize Monaco
        const monacoInstance = await loader.init();
        monacoRef.current = monacoInstance;

        // Register OpenSCAD language and theme
        registerOpenSCADLanguage(monacoInstance);
        
        setIsLanguageRegistered(true);
        console.log('OpenSCAD language registered successfully');
      } catch (error) {
        console.error('Failed to initialize Monaco or register OpenSCAD language:', error);
      }
    };

    initializeEditor();
  }, []);

  const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Set the theme after mounting
    if (isLanguageRegistered) {
      monaco.editor.setTheme(theme);
    }

    console.log('Editor mounted with OpenSCAD language support');
  };

  const handleEditorChange = (value: string | undefined) => {
    const code = value || '';
    if (onCodeChange) {
      onCodeChange(code);
    }
  };

  // Default editor options optimized for OpenSCAD
  const defaultOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: true,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'always',
    matchBrackets: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    ...options,
  };

  if (!isLanguageRegistered) {
    return (
      <div style={{ 
        height: typeof height === 'number' ? `${height}px` : height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc',
        background: '#1e1e1e',
        color: '#d4d4d4'
      }}>
        Loading OpenSCAD Editor...
      </div>
    );
  }

  return (
    <Editor
      height={height}
      language={LANGUAGE_ID}
      theme={theme}
      value={initialCode}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={defaultOptions}
    />
  );
};

export default OpenscadEditorV2;
