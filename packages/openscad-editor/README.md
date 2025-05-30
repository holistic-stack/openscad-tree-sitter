# OpenSCAD Monaco Editor Integration

[![npm](https://img.shields.io/npm/v/@openscad/editor.svg)](https://www.npmjs.com/package/@openscad/editor)
[![Build Status](https://github.com/user/openscad-tree-sitter/workflows/CI/badge.svg)](https://github.com/user/openscad-tree-sitter/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Monaco Editor integration for OpenSCAD that provides rich editing experience with syntax highlighting, IntelliSense, error reporting, and real-time parsing capabilities.

## 🎯 Overview

The OpenSCAD Editor package transforms Monaco Editor into a powerful OpenSCAD development environment. It leverages the OpenSCAD parser and Tree-sitter grammar to provide intelligent editing features that enhance productivity and code quality.

### Key Features

- **🎨 Syntax Highlighting**: Rich syntax highlighting with OpenSCAD-specific themes
- **🧠 IntelliSense**: Intelligent code completion for modules, functions, and variables
- **🔍 Error Highlighting**: Real-time syntax and semantic error detection
- **📝 Code Formatting**: Automatic code formatting and indentation
- **🔧 Hover Information**: Contextual information on hover for built-in functions
- **🚀 Real-time Parsing**: Live AST generation and validation
- **⚡ Performance Optimized**: Efficient incremental parsing for large files
- **🎯 Customizable**: Extensible configuration for different use cases

### Editor Features

#### Language Support
- Complete OpenSCAD syntax highlighting
- Bracket matching and auto-closing
- Comment toggling and block comments
- Indentation and formatting rules

#### IntelliSense Features
- Auto-completion for built-in functions and modules
- Parameter hints for function calls
- Variable and module name suggestions
- Snippet support for common patterns

#### Error Reporting
- Real-time syntax error highlighting
- Semantic error detection
- Warning indicators for potential issues
- Quick fixes and suggestions

## 📦 Installation

```bash
# Using npm
npm install @openscad/editor monaco-editor

# Using pnpm
pnpm add @openscad/editor monaco-editor

# Using yarn
yarn add @openscad/editor monaco-editor
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { OpenSCADEditor } from '@openscad/editor';
import * as monaco from 'monaco-editor';

// Create editor instance
const editor = new OpenSCADEditor({
  container: document.getElementById('editor-container'),
  value: `
    module house(width = 10, height = 15) {
      cube([width, width, height]);
      translate([0, 0, height]) {
        rotate([0, 45, 0]) cube([width*1.4, width, 2]);
      }
    }
    
    house(20, 25);
  `,
  theme: 'openscad-dark',
  fontSize: 14,
  minimap: { enabled: true }
});

// Initialize the editor
await editor.init();
```

### React Integration

```tsx
import React, { useRef, useEffect } from 'react';
import { OpenSCADEditor } from '@openscad/editor';

interface OpenSCADEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onError?: (errors: ParseError[]) => void;
}

const OpenSCADEditorComponent: React.FC<OpenSCADEditorProps> = ({
  value,
  onChange,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OpenSCADEditor | null>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      editorRef.current = new OpenSCADEditor({
        container: containerRef.current,
        value,
        theme: 'openscad-light',
        automaticLayout: true
      });

      editorRef.current.init().then(() => {
        // Set up event listeners
        editorRef.current?.onDidChangeModelContent(() => {
          const currentValue = editorRef.current?.getValue() || '';
          onChange?.(currentValue);
        });

        editorRef.current?.onDidChangeErrors((errors) => {
          onError?.(errors);
        });
      });
    }

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default OpenSCADEditorComponent;
```

### Vue Integration

```vue
<template>
  <div ref="editorContainer" class="openscad-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { OpenSCADEditor } from '@openscad/editor';

interface Props {
  modelValue: string;
  theme?: string;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'openscad-light',
  readOnly: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'error': [errors: ParseError[]];
}>();

const editorContainer = ref<HTMLDivElement>();
let editor: OpenSCADEditor | null = null;

onMounted(async () => {
  if (editorContainer.value) {
    editor = new OpenSCADEditor({
      container: editorContainer.value,
      value: props.modelValue,
      theme: props.theme,
      readOnly: props.readOnly,
      automaticLayout: true
    });

    await editor.init();

    editor.onDidChangeModelContent(() => {
      emit('update:modelValue', editor?.getValue() || '');
    });

    editor.onDidChangeErrors((errors) => {
      emit('error', errors);
    });
  }
});

onUnmounted(() => {
  editor?.dispose();
});

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue);
  }
});

watch(() => props.theme, (newTheme) => {
  editor?.setTheme(newTheme);
});
</script>

<style scoped>
.openscad-editor {
  width: 100%;
  height: 400px;
}
</style>
```

## 🎨 Themes and Customization

### Built-in Themes

The editor comes with several built-in themes optimized for OpenSCAD:

```typescript
// Available themes
const themes = [
  'openscad-light',    // Light theme with OpenSCAD colors
  'openscad-dark',     // Dark theme with OpenSCAD colors
  'openscad-high-contrast', // High contrast for accessibility
  'openscad-classic',  // Classic OpenSCAD application colors
  'vs',               // Visual Studio light
  'vs-dark',          // Visual Studio dark
  'hc-black'          // High contrast black
];

// Set theme
editor.setTheme('openscad-dark');
```

### Custom Theme Creation

```typescript
import { defineTheme } from '@openscad/editor';

// Define custom theme
defineTheme('my-openscad-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.openscad', foreground: '#569cd6' },
    { token: 'string.openscad', foreground: '#ce9178' },
    { token: 'number.openscad', foreground: '#b5cea8' },
    { token: 'comment.openscad', foreground: '#6a9955' },
    { token: 'function.builtin.openscad', foreground: '#dcdcaa' },
    { token: 'module.user.openscad', foreground: '#4ec9b0' }
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#3a3d41'
  }
});

// Use custom theme
editor.setTheme('my-openscad-theme');
```

## 🧠 IntelliSense Configuration

### Built-in Completions

The editor provides intelligent completions for:

```typescript
// Built-in 3D primitives
const primitives3D = [
  'cube', 'sphere', 'cylinder', 'polyhedron'
];

// Built-in 2D shapes
const shapes2D = [
  'circle', 'square', 'polygon', 'text'
];

// Transformations
const transformations = [
  'translate', 'rotate', 'scale', 'mirror', 
  'color', 'resize', 'offset', 'multmatrix'
];

// Boolean operations
const booleanOps = [
  'union', 'difference', 'intersection', 
  'minkowski', 'hull', 'render'
];

// Built-in functions
const builtinFunctions = [
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sqrt', 'pow', 'exp', 'ln', 'log', 'abs', 'sign',
  'min', 'max', 'norm', 'cross', 'len', 'concat'
];
```

### Custom Completions

```typescript
import { CompletionProvider } from '@openscad/editor';

// Create custom completion provider
const customCompletions = new CompletionProvider();

// Add custom module completions
customCompletions.addModule({
  name: 'my_custom_module',
  parameters: [
    { name: 'size', type: 'number', default: 10 },
    { name: 'center', type: 'boolean', default: false }
  ],
  description: 'Creates a custom shape with specified size',
  example: 'my_custom_module(size = 20, center = true);'
});

// Add custom function completions
customCompletions.addFunction({
  name: 'my_function',
  parameters: [
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' }
  ],
  returnType: 'number',
  description: 'Calculates custom value from x and y',
  example: 'result = my_function(10, 20);'
});

// Register with editor
editor.setCompletionProvider(customCompletions);
```

### Snippet Support

```typescript
import { SnippetProvider } from '@openscad/editor';

const snippets = new SnippetProvider();

// Add module snippet
snippets.addSnippet({
  name: 'module',
  prefix: 'mod',
  body: [
    'module ${1:module_name}(${2:parameters}) {',
    '\t${3:// module body}',
    '}'
  ],
  description: 'Create a new module'
});

// Add for loop snippet
snippets.addSnippet({
  name: 'for-loop',
  prefix: 'for',
  body: [
    'for (${1:i} = [${2:0}:${3:1}:${4:10}]) {',
    '\t${5:// loop body}',
    '}'
  ],
  description: 'Create a for loop'
});

// Register with editor
editor.setSnippetProvider(snippets);
```

## 🔍 Error Handling and Diagnostics

### Real-time Error Detection

```typescript
import { DiagnosticsProvider } from '@openscad/editor';

// Configure diagnostics
const diagnostics = new DiagnosticsProvider({
  enableSyntaxErrors: true,
  enableSemanticErrors: true,
  enableWarnings: true,
  enableHints: true
});

// Custom error handling
editor.onDidChangeErrors((errors) => {
  errors.forEach(error => {
    console.log(`${error.severity}: ${error.message} at line ${error.line}`);
    
    // Show error in UI
    if (error.severity === 'error') {
      showErrorNotification(error.message);
    }
  });
});

// Custom validation rules
diagnostics.addRule({
  name: 'unused-variable',
  severity: 'warning',
  check: (ast) => {
    // Custom validation logic
    return [];
  }
});

editor.setDiagnosticsProvider(diagnostics);
```

### Error Recovery

```typescript
// Configure error recovery strategy
editor.configure({
  errorRecovery: {
    strategy: 'lenient', // 'strict' | 'lenient' | 'aggressive'
    maxErrors: 100,
    continueOnError: true
  }
});
```

## 📝 Code Formatting

### Automatic Formatting

```typescript
import { FormattingProvider } from '@openscad/editor';

// Configure formatting
const formatter = new FormattingProvider({
  indentSize: 2,
  insertSpaces: true,
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
  bracketSpacing: true,
  maxLineLength: 100
});

// Custom formatting rules
formatter.addRule({
  name: 'module-spacing',
  apply: (text) => {
    // Add spacing around module definitions
    return text.replace(/module\s+(\w+)/g, '\nmodule $1');
  }
});

// Register with editor
editor.setFormattingProvider(formatter);

// Format on save
editor.onDidSave(() => {
  editor.formatDocument();
});

// Format selection
editor.addAction({
  id: 'format-selection',
  label: 'Format Selection',
  keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
  run: () => {
    editor.formatSelection();
  }
});
```

## 🔧 Advanced Configuration

### Editor Options

```typescript
interface OpenSCADEditorOptions {
  // Container element
  container: HTMLElement;
  
  // Initial content
  value?: string;
  
  // Language and theme
  language?: string; // default: 'openscad'
  theme?: string;    // default: 'openscad-light'
  
  // Editor behavior
  readOnly?: boolean;
  automaticLayout?: boolean;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  
  // Font settings
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  
  // Minimap
  minimap?: {
    enabled: boolean;
    side?: 'left' | 'right';
    showSlider?: 'always' | 'mouseover';
  };
  
  // Line numbers
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  
  // Scrolling
  scrollBeyondLastLine?: boolean;
  smoothScrolling?: boolean;
  
  // IntelliSense
  quickSuggestions?: boolean;
  suggestOnTriggerCharacters?: boolean;
  acceptSuggestionOnEnter?: 'on' | 'off' | 'smart';
  
  // Validation
  enableSyntaxValidation?: boolean;
  enableSemanticValidation?: boolean;
  
  // Performance
  maxTokenizationLineLength?: number;
  maxFileSize?: number;
}
```

### Performance Optimization

```typescript
// Configure for large files
editor.configure({
  performance: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    incrementalParsing: true,
    lazyLoading: true,
    debounceTime: 300,
    maxTokenizationLineLength: 20000
  }
});

// Memory management
editor.onDidChangeModel(() => {
  // Clean up previous model resources
  editor.getModel()?.dispose();
});

// Dispose properly
window.addEventListener('beforeunload', () => {
  editor.dispose();
});
```

## 🧪 Testing

### Unit Testing

```typescript
import { OpenSCADEditor } from '@openscad/editor';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('OpenSCAD Editor', () => {
  let container: HTMLDivElement;
  let editor: OpenSCADEditor;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    editor = new OpenSCADEditor({
      container,
      value: 'cube(10);'
    });
  });

  afterEach(() => {
    editor.dispose();
    document.body.removeChild(container);
  });

  it('should initialize with OpenSCAD language', async () => {
    await editor.init();
    
    const model = editor.getModel();
    expect(model?.getLanguageId()).toBe('openscad');
  });

  it('should provide syntax highlighting', async () => {
    await editor.init();
    
    editor.setValue('module test() { cube(10); }');
    
    const tokens = editor.getTokens();
    expect(tokens).toContainEqual(
      expect.objectContaining({ type: 'keyword.openscad' })
    );
  });

  it('should detect syntax errors', async () => {
    await editor.init();
    
    editor.setValue('module invalid( { cube(10); }');
    
    const errors = await editor.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe('error');
  });
});
```

### Integration Testing

```typescript
import { OpenSCADEditor } from '@openscad/editor';
import { EnhancedOpenscadParser } from '@openscad/parser';

describe('Editor Integration', () => {
  it('should integrate with parser for real-time validation', async () => {
    const container = document.createElement('div');
    const editor = new OpenSCADEditor({ container });
    const parser = new EnhancedOpenscadParser();
    
    await Promise.all([
      editor.init(),
      parser.init('./tree-sitter-openscad.wasm')
    ]);

    // Set up real-time parsing
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      const ast = parser.parseAST(code);
      const errors = parser.getErrors();
      
      editor.setErrors(errors);
    });

    // Test with valid code
    editor.setValue('cube(10);');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let errors = editor.getErrors();
    expect(errors).toHaveLength(0);

    // Test with invalid code
    editor.setValue('cube(;');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    errors = editor.getErrors();
    expect(errors.length).toBeGreaterThan(0);

    editor.dispose();
    parser.dispose();
  });
});
```

## 📊 Performance Metrics

### Benchmarks

| File Size | Load Time | Memory Usage | Responsiveness |
|-----------|-----------|--------------|----------------|
| 1KB       | ~50ms     | ~5MB         | Excellent      |
| 10KB      | ~100ms    | ~15MB        | Excellent      |
| 100KB     | ~500ms    | ~50MB        | Good           |
| 1MB       | ~2s       | ~200MB       | Fair           |

### Optimization Tips

1. **Use Incremental Parsing**: Enable for real-time editing
2. **Limit File Size**: Consider splitting large files
3. **Debounce Updates**: Reduce validation frequency
4. **Lazy Loading**: Load features on demand
5. **Memory Management**: Dispose unused models

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](../../docs/how-to-guides.md#contributing-to-the-editor) for details on:

- Setting up the development environment
- Editor development workflow
- Testing requirements
- Pull request process

## 📚 API Reference

Detailed API documentation is available in the [`docs/`](./docs) directory:

- [Editor API](./docs/api/editor.md)
- [Themes](./docs/api/themes.md)
- [IntelliSense](./docs/api/intellisense.md)
- [Diagnostics](./docs/api/diagnostics.md)
- [Formatting](./docs/api/formatting.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🔗 Related Projects

- **[@openscad/parser](../openscad-parser)**: TypeScript parser with AST generation
- **[@openscad/tree-sitter-openscad](../tree-sitter-openscad)**: Tree-sitter grammar
- **[@openscad/demo](../openscad-demo)**: Interactive demo application

---

**Part of the [OpenSCAD Tree-sitter Parser](../../README.md) monorepo**