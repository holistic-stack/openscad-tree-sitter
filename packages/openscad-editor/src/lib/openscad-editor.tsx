import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco, loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { Parser as TreeSitterParser, Language as TreeSitterLanguage } from 'web-tree-sitter';
import { OpenSCADTokensProvider } from './OpenSCADTokensProvider';

// Path to the Tree-sitter WASM and highlight query file
// These paths are relative to the public directory of the application using this component.
// Consumers of this library will need to ensure these files are served.
const TREE_SITTER_WASM_PATH = '/tree-sitter-openscad.wasm';
const HIGHLIGHT_QUERY_PATH = '/highlights.scm';

const LANGUAGE_ID = 'openscad';

interface OpenscadEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  theme?: string;
  wasmPath?: string; // Allow overriding wasm path
  highlightQueryPath?: string; // Allow overriding query path
}

const OpenscadEditor: React.FC<OpenscadEditorProps> = ({
  initialCode = '',
  onCodeChange,
  theme = 'vs-dark',
  wasmPath = TREE_SITTER_WASM_PATH,
  highlightQueryPath = HIGHLIGHT_QUERY_PATH,
}) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const tokensProviderRef = useRef<OpenSCADTokensProvider | null>(null);
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [isTreeSitterReady, setIsTreeSitterReady] = useState(false);

  // Initialize Tree-sitter Parser and Monaco
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Tree-sitter Parser
        await TreeSitterParser.init({
          locateFile: (path: string, prefix: string) => {
            // For vite, wasm files are often in /node_modules/web-tree-sitter/ 
            // or need to be explicitly copied to public and served.
            // This path needs to correctly point to where tree-sitter.wasm is served.
            // A common pattern is to copy it to the public folder.
            if (path === 'tree-sitter.wasm') {
              // Assuming tree-sitter.wasm is served from the root or a known path
              // This might need adjustment based on the bundler/dev server setup.
              return '/tree-sitter.wasm'; // Default path for the core tree-sitter wasm
            }
            return prefix + path;
          },
        });
        const parser = new TreeSitterParser();
        // Use TreeSitterLanguage to load the grammar
        const Lang = await TreeSitterLanguage.load(wasmPath);
        parser.setLanguage(Lang);

        // Fetch the highlight query
        const response = await fetch(highlightQueryPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch highlight query: ${response.statusText}`);
        }
        const highlightQueryText = await response.text();

        tokensProviderRef.current = new OpenSCADTokensProvider(parser, Lang, highlightQueryText);
        setIsTreeSitterReady(true);

      } catch (error) {
        console.error('Failed to initialize Tree-sitter or load OpenSCAD grammar:', error);
      }
    };

    init();

    // Monaco setup
    loader.init().then((monacoInstance) => {
      monacoRef.current = monacoInstance;
      setIsMonacoReady(true);
    });

  }, [wasmPath, highlightQueryPath]);

  // Register OpenSCAD language and tokens provider with Monaco once both are ready
  useEffect(() => {
    if (isMonacoReady && isTreeSitterReady && monacoRef.current && tokensProviderRef.current) {
      const monaco = monacoRef.current;
      // Register the language
      monaco.languages.register({ id: LANGUAGE_ID });

      // Register the tokens provider
      const disposable = monaco.languages.setTokensProvider(LANGUAGE_ID, tokensProviderRef.current);
      
      // Initial parse of the document
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          tokensProviderRef.current.updateDocument(model.getValue(), model.getVersionId());
          // Trigger re-tokenization if necessary. Monaco might do this automatically
          // when a new tokens provider is set, or on next render/change.
        }
      }

      return () => {
        disposable.dispose();
        // Potentially dispose of language features if re-registering
      };
    }
  }, [isMonacoReady, isTreeSitterReady]);

  const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    // monacoRef.current = monaco; // Already set by loader.init()

    // If Tree-sitter is already ready, update the document
    if (tokensProviderRef.current) {
        const model = editor.getModel();
        if (model) {
            tokensProviderRef.current.updateDocument(model.getValue(), model.getVersionId());
        }
    }
  };

  const handleEditorChange = (value: string | undefined, event: monacoEditor.editor.IModelContentChangedEvent) => {
    const code = value || '';
    if (onCodeChange) {
      onCodeChange(code);
    }
    if (tokensProviderRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        tokensProviderRef.current.updateDocument(code, model.getVersionId());
        // After updating the tree, Monaco needs to be told to re-tokenize.
        // Forcing a re-render or re-setting the language can sometimes work.
        // A more direct method might be needed if issues persist.
        // One common trick is to slightly change the model content or re-set language
        // monacoRef.current?.editor.setModelLanguage(model, LANGUAGE_ID); // This can be heavy
      }
    }
  };

  if (!isMonacoReady) {
    return <div>Loading Editor...</div>;
  }
  if (!isTreeSitterReady && isMonacoReady) {
    // Monaco is ready, but tree-sitter isn't. Show editor but mention highlighting might be delayed.
    // Or show a specific loading state for syntax features.
    // For now, we'll let the editor render, and highlighting will kick in when tree-sitter is ready.
  }

  return (
    <Editor
      height="100%"
      language={LANGUAGE_ID} // Set to a placeholder initially, or wait for registration
      theme={theme}
      value={initialCode}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        // Add any Monaco editor options here
        glyphMargin: true,
      }}
    />
  );
};

export default OpenscadEditor;
