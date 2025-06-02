# OpenSCAD Tree-sitter Grammar: Strategic Development Roadmap

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Draft for Implementation  

## 📋 Executive Summary

### Current State Assessment

The OpenSCAD tree-sitter grammar has achieved **exceptional maturity** with:
- ✅ **Perfect 100% test coverage** (103/103 tests passing)
- ✅ **Production-ready architecture** with optimal 8-conflict structure
- ✅ **Complete language support** including advanced constructs like nested list comprehensions
- ✅ **Comprehensive documentation** with extensive TypeScript examples
- ✅ **Advanced query files** for syntax highlighting, scope analysis, and symbol navigation

### Strategic Objectives

**Primary Goal**: Transform the OpenSCAD tree-sitter grammar from a high-quality parser into the **definitive ecosystem foundation** for OpenSCAD development tooling.

**Key Strategic Pillars**:
1. **Ecosystem Integration**: Seamless integration with major editors, IDEs, and build tools
2. **Developer Experience**: Advanced tooling for code analysis, refactoring, and quality assurance
3. **Community Adoption**: Comprehensive documentation and examples to drive widespread adoption
4. **Performance Excellence**: Industry-leading parsing performance and memory efficiency
5. **Extensibility**: Robust foundation for future OpenSCAD language evolution

### Success Vision

By completion of this roadmap, the OpenSCAD tree-sitter grammar will be:
- The **standard parser** used by all major OpenSCAD development tools
- **Integrated into 5+ major editors** (VS Code, Neovim, Emacs, Sublime Text, Atom)
- **Supporting 10+ development tools** (linters, formatters, analyzers, build systems)
- **Achieving 95%+ developer satisfaction** in community surveys
- **Maintaining <10ms parse time** for 1000-line OpenSCAD files

## 🎯 Detailed Task Breakdown

### Priority 1 (P1): Core Query Enhancement and Advanced Integration
*Timeline: Weeks 1-4 | Critical Path Items*

#### Task 1.1: Advanced Query File Development
**Effort**: 32 hours | **Dependencies**: Current query files | **Risk**: Medium

##### 1.1.a: Create `textobjects.scm` for Structural Navigation
**Effort**: 8 hours | **Acceptance Criteria**: Support for vim-like text object selection

**Technical Specification**:
```scheme
;; ============================================================================
;; OpenSCAD Tree-sitter Text Objects for Structural Navigation
;; ============================================================================
;; Enables advanced text selection patterns for editors like Neovim/Vim

;; Function text objects - enables "select inner/around function"
(function_definition) @function.outer
(function_definition 
  body: (_) @function.inner)

;; Module text objects - enables "select inner/around module"  
(module_definition) @class.outer
(module_definition 
  body: (_) @class.inner)

;; Block text objects - enables "select inner/around block"
(block) @block.outer
(block 
  "{" @_start "}" @_end
  (#make-range! "block.inner" @_start @_end))

;; Parameter text objects - enables parameter selection
(parameter_list) @parameter.outer
(parameter_list 
  "(" @_start ")" @_end
  (#make-range! "parameter.inner" @_start @_end))

;; Argument text objects - enables argument selection
(argument_list) @call.outer
(argument_list
  "(" @_start ")" @_end
  (#make-range! "call.inner" @_start @_end))

;; Comment text objects
(comment) @comment.outer
(comment) @comment.inner

;; Vector/array text objects
(vector_expression) @array.outer
(vector_expression
  "[" @_start "]" @_end
  (#make-range! "array.inner" @_start @_end))

;; Conditional text objects
(conditional_expression) @conditional.outer
(conditional_expression
  condition: (_) @conditional.condition
  consequence: (_) @conditional.consequence  
  alternative: (_) @conditional.alternative)
```

**Integration Requirements**:
- Must work with Neovim's `nvim-treesitter-textobjects` plugin
- Support for `vim-textobj-user` compatibility
- Integration with VS Code's bracket pair colorization

##### 1.1.b: Create `context.scm` for Contextual Information
**Effort**: 10 hours | **Acceptance Criteria**: Contextual analysis for smart IDE features

**Technical Specification**:
```scheme
;; ============================================================================
;; OpenSCAD Context Analysis for Smart IDE Features
;; ============================================================================
;; Provides contextual information for parameter hints, completion, validation

;; Function/module definition context
(module_definition
  name: (identifier) @context.definition.name
  parameters: (parameter_list) @context.definition.parameters
  body: (block) @context.definition.body) @context.definition.module

(function_definition
  name: (identifier) @context.definition.name
  parameters: (parameter_list) @context.definition.parameters
  body: (_) @context.definition.body) @context.definition.function

;; Call context for argument validation and completion
(module_instantiation
  name: (identifier) @context.call.name
  arguments: (argument_list) @context.call.arguments
  body: (block)? @context.call.body) @context.call.module

(call_expression
  function: (identifier) @context.call.name
  arguments: (argument_list) @context.call.arguments) @context.call.function

;; Nested context tracking for scope analysis
(module_definition
  body: (block
    (module_instantiation) @context.nested.call
    (module_definition) @context.nested.definition)) @context.container

;; Parameter context for intelligent completion
(parameter_declaration
  (identifier) @context.parameter.name
  default_value: (_)? @context.parameter.default) @context.parameter

;; Variable context for scope analysis
(assignment_statement
  name: (identifier) @context.variable.name
  value: (_) @context.variable.value) @context.variable.assignment

;; Control flow context
(if_statement
  condition: (_) @context.control.condition
  consequence: (_) @context.control.consequence
  alternative: (_)? @context.control.alternative) @context.control.if

(for_statement
  iterator: (identifier) @context.control.iterator
  range: (_) @context.control.range
  body: (_) @context.control.body) @context.control.for

;; Expression context for type inference
(binary_expression
  left: (_) @context.expression.left
  operator: (_) @context.expression.operator
  right: (_) @context.expression.right) @context.expression.binary

;; Import context for dependency tracking
(call_expression
  function: (identifier) @context.import.type
  arguments: (argument_list
    (arguments
      (argument
        value: (string) @context.import.path)))
  (#match? @context.import.type "^(include|use|import)$")) @context.import
```

**Integration Requirements**:
- LSP server integration for contextual completion
- Parameter hint generation for function/module calls
- Scope-aware variable completion
- Import path resolution and validation

##### 1.1.c: Create `refactoring.scm` for Code Transformations
**Effort**: 10 hours | **Acceptance Criteria**: Support for automated refactoring operations

**Technical Specification**:
```scheme
;; ============================================================================
;; OpenSCAD Refactoring Patterns for Code Transformations
;; ============================================================================
;; Identifies refactoring opportunities and transformation targets

;; Extract module candidates - repeated code patterns
(module_instantiation
  name: (identifier) @refactor.extract_module.target
  arguments: (argument_list) @refactor.extract_module.args
  body: (block
    (_) @refactor.extract_module.body)) @refactor.extract_module.candidate

;; Inline module candidates - simple modules used once
(module_definition
  name: (identifier) @refactor.inline.target
  parameters: (parameter_list) @refactor.inline.params
  body: (block
    (_) @refactor.inline.body)) @refactor.inline.candidate

;; Parameter extraction opportunities - hardcoded values
(module_instantiation
  arguments: (argument_list
    (arguments
      (argument
        value: (number) @refactor.extract_parameter.value)))) @refactor.extract_parameter.candidate

;; Variable extraction - complex expressions
(assignment_statement
  value: (binary_expression
    left: (_) @refactor.extract_variable.left
    right: (_) @refactor.extract_variable.right)) @refactor.extract_variable.candidate

;; Function extraction - repeated calculations
(binary_expression
  left: (call_expression) @refactor.extract_function.left
  right: (call_expression) @refactor.extract_function.right) @refactor.extract_function.candidate

;; Rename opportunities - identifier consistency
(identifier) @refactor.rename.target

;; Dead code elimination - unused definitions
(module_definition
  name: (identifier) @refactor.dead_code.module) @refactor.dead_code.candidate

(function_definition
  name: (identifier) @refactor.dead_code.function) @refactor.dead_code.candidate

;; Code duplication detection
(module_instantiation) @refactor.duplication.instance

;; Simplification opportunities
(conditional_expression
  condition: (boolean) @refactor.simplify.condition) @refactor.simplify.conditional
```

##### 1.1.d: Create `semantic-tokens.scm` for LSP Semantic Highlighting
**Effort**: 4 hours | **Acceptance Criteria**: LSP-compliant semantic token classification

**Technical Specification**:
```scheme
;; ============================================================================
;; LSP Semantic Token Classification
;; ============================================================================
;; Follows Language Server Protocol semantic token specification

;; Type classifications
(module_definition name: (identifier) @type.class)
(function_definition name: (identifier) @type.function)

;; Variable classifications
(parameter_declaration (identifier) @variable.parameter)
(assignment_statement name: (identifier) @variable.declaration)
(special_variable) @variable.readonly
(identifier) @variable.reference

;; Function classifications
(call_expression function: (identifier) @function.call)
(module_instantiation name: (identifier) @function.call)

;; Built-in classifications with modifiers
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(cube|sphere|cylinder|polyhedron)$"))

;; Keyword classifications
"module" @keyword.declaration
"function" @keyword.declaration
"if" @keyword.conditional
"else" @keyword.conditional
"for" @keyword.loop

;; Operator classifications
(binary_expression operator: (_) @operator)
(unary_expression operator: (_) @operator)

;; Comment classifications
(comment) @comment.documentation

;; String and number classifications
(string) @string.literal
(number) @number.literal
```

#### Task 1.2: LSP Implementation Guide Development
**Effort**: 24 hours | **Dependencies**: Query files, TypeScript examples | **Risk**: High

##### 1.2.a: Complete LSP Server Implementation Tutorial
**Effort**: 16 hours | **Acceptance Criteria**: Production-ready LSP server example

**Technical Specification**:
```typescript
// ============================================================================
// Complete OpenSCAD Language Server Implementation
// ============================================================================

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  Hover,
  DefinitionParams,
  Definition,
  DocumentSymbolParams,
  DocumentSymbol,
  SymbolKind,
  CodeActionParams,
  CodeAction,
  CodeActionKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import Parser from 'tree-sitter';
import OpenSCAD from '@openscad/tree-sitter-openscad';

class OpenSCADLanguageServer {
  private connection = createConnection(ProposedFeatures.all);
  private documents = new TextDocuments(TextDocument);
  private parser: Parser;
  private hasConfigurationCapability = false;
  private hasWorkspaceFolderCapability = false;
  private hasDiagnosticRelatedInformationCapability = false;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(OpenSCAD);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Initialize connection
    this.connection.onInitialize(this.onInitialize.bind(this));
    this.connection.onInitialized(this.onInitialized.bind(this));

    // Document events
    this.documents.onDidChangeContent(this.onDocumentChange.bind(this));
    this.documents.onDidClose(this.onDocumentClose.bind(this));

    // Language features
    this.connection.onCompletion(this.onCompletion.bind(this));
    this.connection.onCompletionResolve(this.onCompletionResolve.bind(this));
    this.connection.onHover(this.onHover.bind(this));
    this.connection.onDefinition(this.onDefinition.bind(this));
    this.connection.onDocumentSymbol(this.onDocumentSymbol.bind(this));
    this.connection.onCodeAction(this.onCodeAction.bind(this));

    // Configuration
    this.connection.onDidChangeConfiguration(this.onConfigurationChange.bind(this));

    // Listen on the connection
    this.documents.listen(this.connection);
    this.connection.listen();
  }

  private onInitialize(params: InitializeParams): InitializeResult {
    const capabilities = params.capabilities;

    this.hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    this.hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    this.hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ['.', '(', '[']
        },
        hoverProvider: true,
        definitionProvider: true,
        documentSymbolProvider: true,
        codeActionProvider: {
          codeActionKinds: [
            CodeActionKind.QuickFix,
            CodeActionKind.Refactor,
            CodeActionKind.RefactorExtract,
            CodeActionKind.RefactorInline
          ]
        }
      }
    };
  }

  // Implementation continues with detailed methods...
}
```

---

## 🔍 **FOCUSED IMPLEMENTATION GUIDE: Web Tree-sitter TypeScript Integration**

### 1. Advanced Query Files for Web Tree-sitter

#### 1.1 Enhanced `textobjects.scm` with Web Tree-sitter Integration

**Web Tree-sitter TypeScript Implementation**:
```typescript
// ============================================================================
// Web Tree-sitter Text Objects Implementation for OpenSCAD
// ============================================================================

import Parser, { SyntaxNode, Tree } from 'web-tree-sitter';

interface TextObject {
  type: 'function' | 'module' | 'block' | 'parameter' | 'comment';
  scope: 'inner' | 'outer';
  startPosition: Parser.Point;
  endPosition: Parser.Point;
  text: string;
}

class OpenSCADTextObjects {
  private parser: Parser;
  private language: any;
  private textObjectQuery: Parser.Query;

  constructor(parser: Parser, language: any) {
    this.parser = parser;
    this.language = language;

    // Load text object query from textobjects.scm
    const queryString = `
      ;; Function text objects
      (function_definition) @function.outer
      (function_definition body: (_) @function.inner)

      ;; Module text objects
      (module_definition) @class.outer
      (module_definition body: (_) @class.inner)

      ;; Block text objects
      (block) @block.outer
      (block "{" @_start "}" @_end
        (#make-range! "block.inner" @_start @_end))

      ;; Parameter text objects
      (parameter_list) @parameter.outer
      (parameter_list "(" @_start ")" @_end
        (#make-range! "parameter.inner" @_start @_end))

      ;; Comment text objects
      (comment) @comment.outer
      (comment) @comment.inner
    `;

    this.textObjectQuery = this.language.query(queryString);
  }

  /**
   * Find text object at cursor position
   * @param tree - Parsed tree
   * @param position - Cursor position
   * @param objectType - Type of text object to find
   * @param scope - Inner or outer scope
   * @returns Text object information or null
   */
  findTextObjectAt(
    tree: Tree,
    position: Parser.Point,
    objectType: string,
    scope: 'inner' | 'outer'
  ): TextObject | null {
    const node = tree.rootNode.descendantForPosition(position);
    const captures = this.textObjectQuery.captures(tree.rootNode);

    for (const capture of captures) {
      if (capture.name === `${objectType}.${scope}`) {
        const captureNode = capture.node;

        // Check if position is within this text object
        if (this.isPositionInNode(position, captureNode)) {
          return {
            type: objectType as any,
            scope,
            startPosition: captureNode.startPosition,
            endPosition: captureNode.endPosition,
            text: captureNode.text
          };
        }
      }
    }

    return null;
  }

  /**
   * Get all text objects of a specific type in the document
   * @param tree - Parsed tree
   * @param objectType - Type of text object
   * @returns Array of text objects
   */
  getAllTextObjects(tree: Tree, objectType: string): TextObject[] {
    const captures = this.textObjectQuery.captures(tree.rootNode);
    const textObjects: TextObject[] = [];

    for (const capture of captures) {
      if (capture.name.startsWith(objectType)) {
        const [type, scope] = capture.name.split('.');
        textObjects.push({
          type: type as any,
          scope: scope as 'inner' | 'outer',
          startPosition: capture.node.startPosition,
          endPosition: capture.node.endPosition,
          text: capture.node.text
        });
      }
    }

    return textObjects;
  }

  private isPositionInNode(position: Parser.Point, node: SyntaxNode): boolean {
    const start = node.startPosition;
    const end = node.endPosition;

    if (position.row < start.row || position.row > end.row) {
      return false;
    }

    if (position.row === start.row && position.column < start.column) {
      return false;
    }

    if (position.row === end.row && position.column > end.column) {
      return false;
    }

    return true;
  }
}

// Usage example for web applications
async function initializeTextObjects() {
  await Parser.init();
  const parser = new Parser();
  const OpenSCAD = await Parser.Language.load('/tree-sitter-openscad.wasm');
  parser.setLanguage(OpenSCAD);

  const textObjects = new OpenSCADTextObjects(parser, OpenSCAD);

  const code = `
    module gear(teeth = 20, thickness = 5) {
      difference() {
        cylinder(r = teeth * 0.5, h = thickness);
        cylinder(r = 2, h = thickness + 2, center = true);
      }
    }
  `;

  const tree = parser.parse(code);
  const cursorPosition = { row: 2, column: 8 };

  // Find function at cursor
  const functionObject = textObjects.findTextObjectAt(
    tree,
    cursorPosition,
    'function',
    'outer'
  );

  console.log('Function text object:', functionObject);
}
```

### 2. LSP Implementation Guide for Web Tree-sitter

#### 2.1 Web Tree-sitter LSP Server Implementation

**Complete Web Tree-sitter LSP Server with TypeScript**:
```typescript
// ============================================================================
// Web Tree-sitter LSP Server Implementation for OpenSCAD
// ============================================================================

import Parser, { SyntaxNode, Tree, Query } from 'web-tree-sitter';

interface LSPServerConfig {
  wasmPath: string;
  enableDiagnostics: boolean;
  enableCompletion: boolean;
  enableHover: boolean;
  enableDefinition: boolean;
}

class WebTreeSitterLSPServer {
  private parser: Parser | null = null;
  private language: any = null;
  private documents = new Map<string, { content: string; tree: Tree }>();
  private queries = new Map<string, Query>();
  private config: LSPServerConfig;

  constructor(config: LSPServerConfig) {
    this.config = config;
  }

  /**
   * Initialize the LSP server with web tree-sitter
   */
  async initialize(): Promise<void> {
    try {
      // Initialize web tree-sitter
      await Parser.init();

      this.parser = new Parser();
      this.language = await Parser.Language.load(this.config.wasmPath);
      this.parser.setLanguage(this.language);

      // Load and compile queries
      await this.loadQueries();

      console.log('OpenSCAD LSP Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LSP server:', error);
      throw error;
    }
  }

  /**
   * Load and compile tree-sitter queries
   */
  private async loadQueries(): Promise<void> {
    if (!this.language) throw new Error('Language not loaded');

    // Highlights query
    const highlightsQuery = `
      (module_definition name: (identifier) @function.definition)
      (function_definition name: (identifier) @function.definition)
      (call_expression function: (identifier) @function.call)
      (module_instantiation name: (identifier) @function.call)
      (identifier) @variable
      (comment) @comment
      (string) @string
      (number) @number
    `;

    // Context query for completion and hover
    const contextQuery = `
      (module_definition
        name: (identifier) @context.module.name
        parameters: (parameter_list) @context.module.parameters) @context.module

      (function_definition
        name: (identifier) @context.function.name
        parameters: (parameter_list) @context.function.parameters) @context.function

      (assignment_statement
        name: (identifier) @context.variable.name
        value: (_) @context.variable.value) @context.variable
    `;

    // Diagnostics query for error detection
    const diagnosticsQuery = `
      (ERROR) @error
      (module_instantiation
        name: (identifier) @call.name
        arguments: (argument_list) @call.arguments) @call
    `;

    try {
      this.queries.set('highlights', this.language.query(highlightsQuery));
      this.queries.set('context', this.language.query(contextQuery));
      this.queries.set('diagnostics', this.language.query(diagnosticsQuery));
    } catch (error) {
      console.error('Failed to compile queries:', error);
      throw error;
    }
  }

  /**
   * Parse document and update internal state
   */
  parseDocument(uri: string, content: string): void {
    if (!this.parser) throw new Error('Parser not initialized');

    try {
      const tree = this.parser.parse(content);
      this.documents.set(uri, { content, tree });

      // Trigger diagnostics if enabled
      if (this.config.enableDiagnostics) {
        this.generateDiagnostics(uri);
      }
    } catch (error) {
      console.error(`Failed to parse document ${uri}:`, error);
    }
  }

  /**
   * Generate diagnostics for a document
   */
  private generateDiagnostics(uri: string): Diagnostic[] {
    const document = this.documents.get(uri);
    if (!document) return [];

    const diagnostics: Diagnostic[] = [];
    const diagnosticsQuery = this.queries.get('diagnostics');

    if (diagnosticsQuery) {
      const captures = diagnosticsQuery.captures(document.tree.rootNode);

      for (const capture of captures) {
        if (capture.name === 'error') {
          diagnostics.push({
            range: {
              start: capture.node.startPosition,
              end: capture.node.endPosition
            },
            severity: DiagnosticSeverity.Error,
            message: 'Syntax error',
            source: 'openscad-lsp'
          });
        }
      }
    }

    return diagnostics;
  }

  /**
   * Provide completion items at position
   */
  getCompletionItems(uri: string, position: Parser.Point): CompletionItem[] {
    if (!this.config.enableCompletion) return [];

    const document = this.documents.get(uri);
    if (!document) return [];

    const completions: CompletionItem[] = [];

    // Add built-in OpenSCAD functions
    completions.push(...this.getBuiltinCompletions());

    // Add user-defined symbols from context
    const contextQuery = this.queries.get('context');
    if (contextQuery) {
      const captures = contextQuery.captures(document.tree.rootNode);

      for (const capture of captures) {
        if (capture.name.includes('name')) {
          completions.push({
            label: capture.node.text,
            kind: this.getCompletionKind(capture.name),
            detail: this.getSymbolDetail(capture),
            documentation: this.getSymbolDocumentation(capture)
          });
        }
      }
    }

    return completions;
  }

  /**
   * Provide hover information at position
   */
  getHoverInfo(uri: string, position: Parser.Point): HoverInfo | null {
    if (!this.config.enableHover) return null;

    const document = this.documents.get(uri);
    if (!document) return null;

    const node = document.tree.rootNode.descendantForPosition(position);

    if (node.type === 'identifier') {
      const symbolInfo = this.findSymbolDefinition(document.tree, node.text);

      if (symbolInfo) {
        return {
          contents: this.formatHoverContent(symbolInfo),
          range: {
            start: node.startPosition,
            end: node.endPosition
          }
        };
      }
    }

    return null;
  }

  /**
   * Find definition of symbol
   */
  findDefinition(uri: string, position: Parser.Point): DefinitionLocation | null {
    if (!this.config.enableDefinition) return null;

    const document = this.documents.get(uri);
    if (!document) return null;

    const node = document.tree.rootNode.descendantForPosition(position);

    if (node.type === 'identifier') {
      const definition = this.findSymbolDefinition(document.tree, node.text);

      if (definition) {
        return {
          uri,
          range: {
            start: definition.node.startPosition,
            end: definition.node.endPosition
          }
        };
      }
    }

    return null;
  }

  private getBuiltinCompletions(): CompletionItem[] {
    return [
      {
        label: 'cube',
        kind: CompletionItemKind.Function,
        detail: 'cube(size, center = false)',
        documentation: 'Creates a cube with the specified size'
      },
      {
        label: 'sphere',
        kind: CompletionItemKind.Function,
        detail: 'sphere(r) or sphere(d)',
        documentation: 'Creates a sphere with the specified radius or diameter'
      },
      {
        label: 'cylinder',
        kind: CompletionItemKind.Function,
        detail: 'cylinder(h, r, center = false)',
        documentation: 'Creates a cylinder with specified height and radius'
      },
      {
        label: 'translate',
        kind: CompletionItemKind.Function,
        detail: 'translate([x, y, z])',
        documentation: 'Translates (moves) child objects along the specified vector'
      },
      {
        label: 'rotate',
        kind: CompletionItemKind.Function,
        detail: 'rotate([x, y, z]) or rotate(a, [x, y, z])',
        documentation: 'Rotates child objects around the specified axis'
      }
    ];
  }

  private getCompletionKind(captureName: string): CompletionItemKind {
    if (captureName.includes('module')) return CompletionItemKind.Class;
    if (captureName.includes('function')) return CompletionItemKind.Function;
    if (captureName.includes('variable')) return CompletionItemKind.Variable;
    return CompletionItemKind.Text;
  }

  private getSymbolDetail(capture: any): string {
    return `User-defined ${capture.name.split('.')[1]}`;
  }

  private getSymbolDocumentation(capture: any): string {
    return `OpenSCAD ${capture.name.split('.')[1]} definition`;
  }

  private findSymbolDefinition(tree: Tree, symbolName: string): any {
    const contextQuery = this.queries.get('context');
    if (!contextQuery) return null;

    const captures = contextQuery.captures(tree.rootNode);

    for (const capture of captures) {
      if (capture.name.includes('name') && capture.node.text === symbolName) {
        return {
          node: capture.node,
          type: capture.name.split('.')[1]
        };
      }
    }

    return null;
  }

  private formatHoverContent(symbolInfo: any): string {
    return `**${symbolInfo.type}**: ${symbolInfo.node.text}\n\nDefined at line ${symbolInfo.node.startPosition.row + 1}`;
  }
}

// Type definitions for LSP compatibility
interface Diagnostic {
  range: {
    start: Parser.Point;
    end: Parser.Point;
  };
  severity: DiagnosticSeverity;
  message: string;
  source: string;
}

enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4
}

interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
}

enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10
}

interface HoverInfo {
  contents: string;
  range: {
    start: Parser.Point;
    end: Parser.Point;
  };
}

interface DefinitionLocation {
  uri: string;
  range: {
    start: Parser.Point;
    end: Parser.Point;
  };
}

// Usage example
async function initializeLSPServer() {
  const config: LSPServerConfig = {
    wasmPath: '/tree-sitter-openscad.wasm',
    enableDiagnostics: true,
    enableCompletion: true,
    enableHover: true,
    enableDefinition: true
  };

  const lspServer = new WebTreeSitterLSPServer(config);

  try {
    await lspServer.initialize();

    // Parse a document
    const openscadCode = `
      module gear(teeth = 20, thickness = 5) {
        difference() {
          cylinder(r = teeth * 0.5, h = thickness);
          cylinder(r = 2, h = thickness + 2, center = true);
        }
      }

      gear(15, 3);
    `;

    lspServer.parseDocument('file:///example.scad', openscadCode);

    // Get completions
    const completions = lspServer.getCompletionItems(
      'file:///example.scad',
      { row: 7, column: 2 }
    );

    console.log('Available completions:', completions);

    // Get hover info
    const hoverInfo = lspServer.getHoverInfo(
      'file:///example.scad',
      { row: 1, column: 12 }
    );

    console.log('Hover information:', hoverInfo);

  } catch (error) {
    console.error('LSP Server initialization failed:', error);
  }
}
```

### 3. Testing Framework Integration for Web Tree-sitter

#### 3.1 Jest Integration with Web Tree-sitter

**Jest Test Suite for OpenSCAD Parser**:
```typescript
// ============================================================================
// Jest Testing Framework Integration for OpenSCAD Tree-sitter
// ============================================================================

import Parser, { Tree, SyntaxNode } from 'web-tree-sitter';

// Jest setup for web tree-sitter
beforeAll(async () => {
  await Parser.init();
});

describe('OpenSCAD Parser Tests', () => {
  let parser: Parser;
  let language: any;

  beforeEach(async () => {
    parser = new Parser();
    language = await Parser.Language.load('/tree-sitter-openscad.wasm');
    parser.setLanguage(language);
  });

  afterEach(() => {
    if (parser) {
      parser.delete();
    }
  });

  describe('Basic Parsing', () => {
    test('should parse simple cube statement', () => {
      const code = 'cube(10);';
      const tree = parser.parse(code);

      expect(tree.rootNode.hasError()).toBe(false);
      expect(tree.rootNode.type).toBe('source_file');

      const cubeCall = tree.rootNode.child(0);
      expect(cubeCall?.type).toBe('module_instantiation');
      expect(cubeCall?.childForFieldName('name')?.text).toBe('cube');
    });

    test('should parse module definition', () => {
      const code = `
        module gear(teeth = 20, thickness = 5) {
          cylinder(r = teeth * 0.5, h = thickness);
        }
      `;

      const tree = parser.parse(code);
      expect(tree.rootNode.hasError()).toBe(false);

      const moduleNode = tree.rootNode.descendantsOfType('module_definition')[0];
      expect(moduleNode).toBeDefined();
      expect(moduleNode.childForFieldName('name')?.text).toBe('gear');
    });

    test('should handle syntax errors gracefully', () => {
      const code = 'cube(10;'; // Missing closing parenthesis
      const tree = parser.parse(code);

      expect(tree.rootNode.hasError()).toBe(true);

      const errorNodes = tree.rootNode.descendantsOfType('ERROR');
      expect(errorNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Query Testing', () => {
    test('should find all function calls', () => {
      const code = `
        cube(10);
        sphere(5);
        cylinder(h=20, r=3);
      `;

      const tree = parser.parse(code);
      const query = language.query(`
        (module_instantiation name: (identifier) @function.name) @function.call
      `);

      const captures = query.captures(tree.rootNode);
      const functionNames = captures
        .filter(c => c.name === 'function.name')
        .map(c => c.node.text);

      expect(functionNames).toEqual(['cube', 'sphere', 'cylinder']);
    });

    test('should extract module parameters', () => {
      const code = `
        module gear(teeth = 20, thickness = 5, center = false) {
          // module body
        }
      `;

      const tree = parser.parse(code);
      const query = language.query(`
        (parameter_declaration (identifier) @param.name) @param
      `);

      const captures = query.captures(tree.rootNode);
      const paramNames = captures
        .filter(c => c.name === 'param.name')
        .map(c => c.node.text);

      expect(paramNames).toEqual(['teeth', 'thickness', 'center']);
    });
  });

  describe('Performance Testing', () => {
    test('should parse large files efficiently', () => {
      // Generate a large OpenSCAD file
      const largeCube = Array(1000).fill('cube(10);').join('\n');

      const startTime = performance.now();
      const tree = parser.parse(largeCube);
      const endTime = performance.now();

      expect(tree.rootNode.hasError()).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // Should parse in <100ms
    });

    test('should handle incremental parsing', () => {
      const initialCode = 'cube(10);';
      let tree = parser.parse(initialCode);

      // Simulate editing: change 10 to 20
      const newCode = 'cube(20);';
      const startIndex = initialCode.indexOf('10');
      const oldEndIndex = startIndex + 2;
      const newEndIndex = startIndex + 2;

      const edit = {
        startIndex,
        oldEndIndex,
        newEndIndex,
        startPosition: { row: 0, column: startIndex },
        oldEndPosition: { row: 0, column: oldEndIndex },
        newEndPosition: { row: 0, column: newEndIndex }
      };

      tree.edit(edit);
      const newTree = parser.parse(newCode, tree);

      expect(newTree.rootNode.hasError()).toBe(false);
      expect(newTree.rootNode.descendantsOfType('number')[0].text).toBe('20');
    });
  });

  describe('Error Recovery Testing', () => {
    test('should recover from missing semicolons', () => {
      const code = `
        cube(10)
        sphere(5);
      `;

      const tree = parser.parse(code);

      // Should still parse the sphere even with missing semicolon on cube
      const sphereNodes = tree.rootNode.descendantsOfType('module_instantiation')
        .filter(node => node.childForFieldName('name')?.text === 'sphere');

      expect(sphereNodes.length).toBe(1);
    });

    test('should handle nested error recovery', () => {
      const code = `
        module test() {
          cube(10;
          sphere(5);
        }
      `;

      const tree = parser.parse(code);

      // Should still identify the module structure
      const moduleNodes = tree.rootNode.descendantsOfType('module_definition');
      expect(moduleNodes.length).toBe(1);
      expect(moduleNodes[0].childForFieldName('name')?.text).toBe('test');
    });
  });
});

// Custom Jest matchers for tree-sitter
expect.extend({
  toHaveNodeType(received: SyntaxNode, expected: string) {
    const pass = received.type === expected;
    return {
      message: () =>
        `expected node to have type ${expected}, but got ${received.type}`,
      pass
    };
  },

  toHaveFieldValue(received: SyntaxNode, fieldName: string, expected: string) {
    const fieldNode = received.childForFieldName(fieldName);
    const pass = fieldNode?.text === expected;
    return {
      message: () =>
        `expected field ${fieldName} to have value ${expected}, but got ${fieldNode?.text}`,
      pass
    };
  },

  toBeValidOpenSCAD(received: Tree) {
    const pass = !received.rootNode.hasError();
    return {
      message: () =>
        pass ? 'expected tree to have errors' : 'expected tree to be valid OpenSCAD',
      pass
    };
  }
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNodeType(expected: string): R;
      toHaveFieldValue(fieldName: string, expected: string): R;
      toBeValidOpenSCAD(): R;
    }
  }
}
```

#### 3.2 Vitest Integration with Web Tree-sitter

**Vitest Configuration and Tests**:
```typescript
// ============================================================================
// Vitest Testing Framework Integration for OpenSCAD Tree-sitter
// ============================================================================

import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import Parser, { Tree, SyntaxNode } from 'web-tree-sitter';

// Vitest setup for web tree-sitter
beforeAll(async () => {
  await Parser.init();
});

describe('OpenSCAD Vitest Integration', () => {
  let parser: Parser;
  let language: any;

  beforeEach(async () => {
    parser = new Parser();
    language = await Parser.Language.load('/tree-sitter-openscad.wasm');
    parser.setLanguage(language);
  });

  afterEach(() => {
    parser?.delete();
  });

  test('should parse complex OpenSCAD structures', () => {
    const code = `
      // Parametric gear module
      module gear(teeth = 20, thickness = 5, hole_diameter = 5) {
        difference() {
          union() {
            cylinder(r = teeth * 0.5, h = thickness, center = true);

            for (i = [0:teeth-1]) {
              rotate([0, 0, i * 360 / teeth])
                translate([teeth * 0.5, 0, 0])
                  cube([2, 2, thickness], center = true);
            }
          }

          // Center hole
          cylinder(r = hole_diameter / 2, h = thickness + 1, center = true);
        }
      }

      // Create gear assembly
      translate([0, 0, 0]) gear(15, 3, 2);
      translate([20, 0, 0]) rotate([0, 0, 12]) gear(10, 3, 2);
    `;

    const tree = parser.parse(code);
    expect(tree.rootNode.hasError()).toBe(false);

    // Verify module definition
    const moduleNodes = tree.rootNode.descendantsOfType('module_definition');
    expect(moduleNodes).toHaveLength(1);
    expect(moduleNodes[0].childForFieldName('name')?.text).toBe('gear');

    // Verify for loop
    const forNodes = tree.rootNode.descendantsOfType('for_statement');
    expect(forNodes).toHaveLength(1);

    // Verify function calls
    const callNodes = tree.rootNode.descendantsOfType('module_instantiation');
    const callNames = callNodes.map(node => node.childForFieldName('name')?.text);
    expect(callNames).toContain('gear');
    expect(callNames).toContain('translate');
    expect(callNames).toContain('rotate');
  });

  test('should benchmark parsing performance', () => {
    const iterations = 100;
    const code = `
      module complex_structure() {
        for (x = [0:10]) {
          for (y = [0:10]) {
            translate([x*10, y*10, 0])
              cube([5, 5, 5]);
          }
        }
      }
      complex_structure();
    `;

    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const tree = parser.parse(code);
      const end = performance.now();

      expect(tree.rootNode.hasError()).toBe(false);
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    console.log(`Average parse time: ${avgTime.toFixed(2)}ms`);
    console.log(`Maximum parse time: ${maxTime.toFixed(2)}ms`);

    // Performance assertions
    expect(avgTime).toBeLessThan(10); // Average should be under 10ms
    expect(maxTime).toBeLessThan(50);  // Max should be under 50ms
  });
});

// Vitest snapshot testing for AST structures
test('should match AST snapshot for module definition', () => {
  const code = `
    module simple_box(width = 10, height = 10, depth = 10) {
      cube([width, height, depth]);
    }
  `;

  const tree = parser.parse(code);
  const moduleNode = tree.rootNode.descendantsOfType('module_definition')[0];

  // Create a simplified AST representation for snapshot testing
  const astSnapshot = {
    type: moduleNode.type,
    name: moduleNode.childForFieldName('name')?.text,
    parameterCount: moduleNode.childForFieldName('parameters')?.namedChildCount || 0,
    bodyType: moduleNode.childForFieldName('body')?.type
  };

  expect(astSnapshot).toMatchSnapshot();
});
```

### 4. Code Analysis Tools for Web Tree-sitter

#### 4.1 Complexity Analysis Tool

**TypeScript Implementation for Code Complexity Metrics**:
```typescript
// ============================================================================
// OpenSCAD Code Complexity Analysis using Web Tree-sitter
// ============================================================================

import Parser, { Tree, SyntaxNode } from 'web-tree-sitter';

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  nestingDepth: number;
  moduleCount: number;
  functionCount: number;
  linesOfCode: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
}

interface ModuleComplexity {
  name: string;
  complexity: number;
  nestingDepth: number;
  parameterCount: number;
  linesOfCode: number;
  issues: string[];
}

class OpenSCADComplexityAnalyzer {
  private parser: Parser;
  private language: any;

  constructor(parser: Parser, language: any) {
    this.parser = parser;
    this.language = language;
  }

  /**
   * Analyze complexity metrics for OpenSCAD code
   * @param code - OpenSCAD source code
   * @returns Comprehensive complexity metrics
   */
  analyzeComplexity(code: string): ComplexityMetrics {
    const tree = this.parser.parse(code);

    return {
      cyclomaticComplexity: this.calculateCyclomaticComplexity(tree),
      nestingDepth: this.calculateMaxNestingDepth(tree),
      moduleCount: this.countModules(tree),
      functionCount: this.countFunctions(tree),
      linesOfCode: this.countLinesOfCode(code),
      cognitiveComplexity: this.calculateCognitiveComplexity(tree),
      maintainabilityIndex: this.calculateMaintainabilityIndex(tree, code)
    };
  }

  /**
   * Analyze complexity for individual modules
   * @param code - OpenSCAD source code
   * @returns Array of module complexity analysis
   */
  analyzeModuleComplexity(code: string): ModuleComplexity[] {
    const tree = this.parser.parse(code);
    const moduleNodes = tree.rootNode.descendantsOfType('module_definition');

    return moduleNodes.map(moduleNode => {
      const name = moduleNode.childForFieldName('name')?.text || 'unknown';
      const body = moduleNode.childForFieldName('body');

      return {
        name,
        complexity: this.calculateNodeComplexity(moduleNode),
        nestingDepth: this.calculateNodeNestingDepth(body || moduleNode),
        parameterCount: this.countParameters(moduleNode),
        linesOfCode: this.countNodeLines(moduleNode),
        issues: this.identifyComplexityIssues(moduleNode)
      };
    });
  }

  private calculateCyclomaticComplexity(tree: Tree): number {
    let complexity = 1; // Base complexity

    // Decision points that increase complexity
    const decisionNodes = [
      ...tree.rootNode.descendantsOfType('if_statement'),
      ...tree.rootNode.descendantsOfType('for_statement'),
      ...tree.rootNode.descendantsOfType('conditional_expression'),
      ...tree.rootNode.descendantsOfType('logical_and_operator'),
      ...tree.rootNode.descendantsOfType('logical_or_operator')
    ];

    complexity += decisionNodes.length;

    // Each module/function adds to complexity
    const moduleNodes = tree.rootNode.descendantsOfType('module_definition');
    const functionNodes = tree.rootNode.descendantsOfType('function_definition');

    complexity += moduleNodes.length + functionNodes.length;

    return complexity;
  }

  private calculateMaxNestingDepth(tree: Tree): number {
    let maxDepth = 0;

    const traverse = (node: SyntaxNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);

      // Nodes that increase nesting depth
      const nestingTypes = ['block', 'if_statement', 'for_statement', 'module_definition'];
      const newDepth = nestingTypes.includes(node.type) ? depth + 1 : depth;

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          traverse(child, newDepth);
        }
      }
    };

    traverse(tree.rootNode, 0);
    return maxDepth;
  }

  private calculateCognitiveComplexity(tree: Tree): number {
    let complexity = 0;

    const traverse = (node: SyntaxNode, nestingLevel: number) => {
      // Cognitive complexity weights
      switch (node.type) {
        case 'if_statement':
          complexity += 1 + nestingLevel;
          break;
        case 'for_statement':
          complexity += 1 + nestingLevel;
          break;
        case 'conditional_expression':
          complexity += 1 + nestingLevel;
          break;
        case 'logical_and_operator':
        case 'logical_or_operator':
          complexity += 1;
          break;
      }

      // Increase nesting level for certain constructs
      const nestingTypes = ['if_statement', 'for_statement', 'module_definition'];
      const newNestingLevel = nestingTypes.includes(node.type) ? nestingLevel + 1 : nestingLevel;

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          traverse(child, newNestingLevel);
        }
      }
    };

    traverse(tree.rootNode, 0);
    return complexity;
  }

  private calculateMaintainabilityIndex(tree: Tree, code: string): number {
    const loc = this.countLinesOfCode(code);
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(tree);
    const halsteadVolume = this.calculateHalsteadVolume(tree);

    // Simplified maintainability index calculation
    const maintainabilityIndex = Math.max(0,
      171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(loc)
    );

    return Math.round(maintainabilityIndex);
  }

  private calculateHalsteadVolume(tree: Tree): number {
    const operators = new Set<string>();
    const operands = new Set<string>();

    const traverse = (node: SyntaxNode) => {
      // Collect operators
      if (node.type.includes('operator') || node.type === 'if' || node.type === 'for') {
        operators.add(node.type);
      }

      // Collect operands
      if (node.type === 'identifier' || node.type === 'number' || node.type === 'string') {
        operands.add(node.text);
      }

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          traverse(child);
        }
      }
    };

    traverse(tree.rootNode);

    const n1 = operators.size; // Unique operators
    const n2 = operands.size;  // Unique operands
    const N1 = operators.size; // Total operators (simplified)
    const N2 = operands.size;  // Total operands (simplified)

    const vocabulary = n1 + n2;
    const length = N1 + N2;

    return length * Math.log2(vocabulary || 1);
  }

  private countModules(tree: Tree): number {
    return tree.rootNode.descendantsOfType('module_definition').length;
  }

  private countFunctions(tree: Tree): number {
    return tree.rootNode.descendantsOfType('function_definition').length;
  }

  private countLinesOfCode(code: string): number {
    return code.split('\n').filter(line => line.trim().length > 0).length;
  }

  private calculateNodeComplexity(node: SyntaxNode): number {
    let complexity = 1;

    const decisionNodes = [
      'if_statement', 'for_statement', 'conditional_expression'
    ];

    const traverse = (n: SyntaxNode) => {
      if (decisionNodes.includes(n.type)) {
        complexity++;
      }

      for (let i = 0; i < n.childCount; i++) {
        const child = n.child(i);
        if (child) {
          traverse(child);
        }
      }
    };

    traverse(node);
    return complexity;
  }

  private calculateNodeNestingDepth(node: SyntaxNode): number {
    let maxDepth = 0;

    const traverse = (n: SyntaxNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);

      const nestingTypes = ['block', 'if_statement', 'for_statement'];
      const newDepth = nestingTypes.includes(n.type) ? depth + 1 : depth;

      for (let i = 0; i < n.childCount; i++) {
        const child = n.child(i);
        if (child) {
          traverse(child, newDepth);
        }
      }
    };

    traverse(node, 0);
    return maxDepth;
  }

  private countParameters(moduleNode: SyntaxNode): number {
    const parametersNode = moduleNode.childForFieldName('parameters');
    if (!parametersNode) return 0;

    return parametersNode.descendantsOfType('parameter_declaration').length;
  }

  private countNodeLines(node: SyntaxNode): number {
    const startRow = node.startPosition.row;
    const endRow = node.endPosition.row;
    return endRow - startRow + 1;
  }

  private identifyComplexityIssues(moduleNode: SyntaxNode): string[] {
    const issues: string[] = [];

    const complexity = this.calculateNodeComplexity(moduleNode);
    const nestingDepth = this.calculateNodeNestingDepth(moduleNode);
    const parameterCount = this.countParameters(moduleNode);
    const lineCount = this.countNodeLines(moduleNode);

    if (complexity > 10) {
      issues.push(`High cyclomatic complexity (${complexity}). Consider breaking into smaller modules.`);
    }

    if (nestingDepth > 4) {
      issues.push(`Deep nesting (${nestingDepth} levels). Consider extracting nested logic.`);
    }

    if (parameterCount > 7) {
      issues.push(`Too many parameters (${parameterCount}). Consider using parameter objects.`);
    }

    if (lineCount > 50) {
      issues.push(`Module too long (${lineCount} lines). Consider breaking into smaller modules.`);
    }

    return issues;
  }
}

// Usage example
async function analyzeOpenSCADComplexity() {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load('/tree-sitter-openscad.wasm');
  parser.setLanguage(language);

  const analyzer = new OpenSCADComplexityAnalyzer(parser, language);

  const complexCode = `
    // Complex parametric gear system
    module gear_system(
      gear1_teeth = 20, gear1_thickness = 5,
      gear2_teeth = 30, gear2_thickness = 5,
      distance = 50, center_holes = true
    ) {
      // First gear
      translate([0, 0, 0]) {
        if (center_holes) {
          difference() {
            gear(gear1_teeth, gear1_thickness);
            cylinder(r = 2, h = gear1_thickness + 2, center = true);
          }
        } else {
          gear(gear1_teeth, gear1_thickness);
        }
      }

      // Second gear with complex positioning
      translate([distance, 0, 0]) {
        rotate([0, 0, gear1_teeth > 20 ? 15 : 0]) {
          for (i = [0:2]) {
            rotate([0, 0, i * 120]) {
              if (i == 0 || gear2_teeth > 25) {
                translate([5, 0, 0]) {
                  if (center_holes) {
                    difference() {
                      gear(gear2_teeth, gear2_thickness);
                      cylinder(r = 2, h = gear2_thickness + 2, center = true);
                    }
                  } else {
                    gear(gear2_teeth, gear2_thickness);
                  }
                }
              }
            }
          }
        }
      }
    }

    module gear(teeth, thickness) {
      cylinder(r = teeth * 0.5, h = thickness);
    }

    gear_system(25, 4, 35, 6, 60, true);
  `;

  // Analyze overall complexity
  const metrics = analyzer.analyzeComplexity(complexCode);
  console.log('Overall Complexity Metrics:', metrics);

  // Analyze individual modules
  const moduleComplexity = analyzer.analyzeModuleComplexity(complexCode);
  console.log('Module Complexity Analysis:', moduleComplexity);

  // Generate complexity report
  moduleComplexity.forEach(module => {
    console.log(`\nModule: ${module.name}`);
    console.log(`  Complexity: ${module.complexity}`);
    console.log(`  Nesting Depth: ${module.nestingDepth}`);
    console.log(`  Parameters: ${module.parameterCount}`);
    console.log(`  Lines of Code: ${module.linesOfCode}`);

    if (module.issues.length > 0) {
      console.log('  Issues:');
      module.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  });
}
```

### 5. Risk Assessment and Mitigation for Web Tree-sitter Implementation

#### 5.1 Technical Risk Analysis

**Web Tree-sitter Specific Risks and Mitigation Strategies**:

```typescript
// ============================================================================
// Risk Assessment Framework for Web Tree-sitter OpenSCAD Implementation
// ============================================================================

interface RiskAssessment {
  category: 'technical' | 'performance' | 'compatibility' | 'security' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: string;
  mitigation: string[];
  monitoring: string[];
  contingency: string[];
}

class WebTreeSitterRiskManager {
  private risks: RiskAssessment[] = [
    // WASM Loading and Initialization Risks
    {
      category: 'technical',
      severity: 'high',
      probability: 'medium',
      impact: 'Parser fails to initialize in browser environments, blocking all functionality',
      mitigation: [
        'Implement robust WASM loading with fallback mechanisms',
        'Add comprehensive error handling for Parser.init() failures',
        'Provide graceful degradation when WASM is not supported',
        'Cache WASM files with proper versioning and integrity checks'
      ],
      monitoring: [
        'Track WASM loading success/failure rates',
        'Monitor initialization time across different browsers',
        'Log browser compatibility issues',
        'Track memory usage during WASM loading'
      ],
      contingency: [
        'Fallback to server-side parsing for critical functionality',
        'Provide static analysis as alternative',
        'Implement progressive enhancement approach',
        'Use service worker for WASM caching and reliability'
      ]
    },

    // Memory Management Risks
    {
      category: 'performance',
      severity: 'high',
      probability: 'high',
      impact: 'Memory leaks in long-running applications, browser crashes with large files',
      mitigation: [
        'Implement proper parser.delete() calls in cleanup',
        'Use WeakMap for parser instance tracking',
        'Implement memory usage monitoring and limits',
        'Add automatic garbage collection for unused trees'
      ],
      monitoring: [
        'Track memory usage over time',
        'Monitor parser instance lifecycle',
        'Alert on memory usage spikes',
        'Track browser performance metrics'
      ],
      contingency: [
        'Implement parser pooling with automatic cleanup',
        'Add memory pressure detection and response',
        'Provide manual memory management controls',
        'Implement file size limits with user warnings'
      ]
    },

    // Browser Compatibility Risks
    {
      category: 'compatibility',
      severity: 'medium',
      probability: 'medium',
      impact: 'Functionality breaks in older browsers or specific browser versions',
      mitigation: [
        'Test across all major browsers and versions',
        'Implement feature detection for WASM support',
        'Provide polyfills for missing APIs',
        'Use progressive enhancement strategies'
      ],
      monitoring: [
        'Track browser usage analytics',
        'Monitor error rates by browser version',
        'Test with browser compatibility tools',
        'Collect user agent and error correlation data'
      ],
      contingency: [
        'Maintain compatibility matrix documentation',
        'Provide browser-specific workarounds',
        'Implement server-side fallback for unsupported browsers',
        'Offer downloadable desktop alternatives'
      ]
    },

    // Performance Degradation Risks
    {
      category: 'performance',
      severity: 'medium',
      probability: 'high',
      impact: 'Slow parsing performance affects user experience, especially with large files',
      mitigation: [
        'Implement incremental parsing for real-time editing',
        'Use Web Workers for parsing large files',
        'Add parsing time limits and progress indicators',
        'Optimize query compilation and caching'
      ],
      monitoring: [
        'Track parsing time metrics',
        'Monitor file size vs performance correlation',
        'Measure query execution times',
        'Track user interaction responsiveness'
      ],
      contingency: [
        'Implement file size warnings and limits',
        'Provide simplified parsing modes for large files',
        'Add background parsing with progress updates',
        'Offer server-side parsing for complex files'
      ]
    },

    // Security Risks
    {
      category: 'security',
      severity: 'medium',
      probability: 'low',
      impact: 'Malicious OpenSCAD code could exploit parser vulnerabilities',
      mitigation: [
        'Validate and sanitize all input before parsing',
        'Implement parsing timeouts to prevent DoS',
        'Use Content Security Policy (CSP) headers',
        'Regular security audits of tree-sitter dependencies'
      ],
      monitoring: [
        'Monitor for unusual parsing patterns',
        'Track parsing failures and error types',
        'Log suspicious input patterns',
        'Monitor resource usage spikes'
      ],
      contingency: [
        'Implement input validation and filtering',
        'Add rate limiting for parsing requests',
        'Provide sandboxed parsing environment',
        'Maintain security incident response plan'
      ]
    },

    // Query Compilation Risks
    {
      category: 'technical',
      severity: 'medium',
      probability: 'medium',
      impact: 'Invalid queries cause runtime errors, breaking analysis features',
      mitigation: [
        'Validate all queries before compilation',
        'Implement query testing framework',
        'Use try-catch blocks around query operations',
        'Provide fallback queries for critical features'
      ],
      monitoring: [
        'Track query compilation success rates',
        'Monitor query execution performance',
        'Log query validation errors',
        'Track feature usage and error correlation'
      ],
      contingency: [
        'Implement query validation pipeline',
        'Provide query debugging tools',
        'Maintain query compatibility matrix',
        'Offer manual query override options'
      ]
    },

    // Maintenance and Updates Risks
    {
      category: 'maintenance',
      severity: 'medium',
      probability: 'high',
      impact: 'Breaking changes in tree-sitter updates affect existing functionality',
      mitigation: [
        'Pin tree-sitter versions with careful upgrade testing',
        'Implement comprehensive regression testing',
        'Maintain backward compatibility layers',
        'Document all breaking changes and migration paths'
      ],
      monitoring: [
        'Track tree-sitter version compatibility',
        'Monitor for upstream breaking changes',
        'Test with pre-release versions',
        'Track community feedback and issues'
      ],
      contingency: [
        'Maintain multiple tree-sitter version support',
        'Implement feature flags for new functionality',
        'Provide rollback mechanisms for updates',
        'Maintain LTS version support strategy'
      ]
    }
  ];

  /**
   * Assess overall risk level for web tree-sitter implementation
   */
  assessOverallRisk(): {
    level: 'low' | 'medium' | 'high' | 'critical';
    criticalRisks: RiskAssessment[];
    recommendations: string[];
  } {
    const criticalRisks = this.risks.filter(risk =>
      risk.severity === 'critical' ||
      (risk.severity === 'high' && risk.probability === 'high')
    );

    const highRisks = this.risks.filter(risk =>
      risk.severity === 'high' || risk.probability === 'high'
    );

    let level: 'low' | 'medium' | 'high' | 'critical';
    if (criticalRisks.length > 0) {
      level = 'critical';
    } else if (highRisks.length > 3) {
      level = 'high';
    } else if (highRisks.length > 0) {
      level = 'medium';
    } else {
      level = 'low';
    }

    const recommendations = this.generateRecommendations(criticalRisks, highRisks);

    return {
      level,
      criticalRisks,
      recommendations
    };
  }

  /**
   * Generate implementation recommendations based on risk assessment
   */
  private generateRecommendations(
    criticalRisks: RiskAssessment[],
    highRisks: RiskAssessment[]
  ): string[] {
    const recommendations: string[] = [
      '🔧 **Implementation Phase Approach**:',
      '  - Start with minimal viable implementation',
      '  - Implement comprehensive error handling from day one',
      '  - Use feature flags for gradual rollout',
      '  - Establish monitoring and alerting early',
      '',
      '⚡ **Performance Optimization**:',
      '  - Implement Web Workers for large file parsing',
      '  - Use incremental parsing for real-time editing',
      '  - Add memory management and cleanup procedures',
      '  - Implement parsing time limits and progress indicators',
      '',
      '🛡️ **Risk Mitigation Priorities**:',
      '  - WASM loading reliability (highest priority)',
      '  - Memory leak prevention (critical for long-running apps)',
      '  - Browser compatibility testing (essential for adoption)',
      '  - Performance monitoring and optimization',
      '',
      '📊 **Monitoring and Observability**:',
      '  - Implement comprehensive error tracking',
      '  - Monitor performance metrics continuously',
      '  - Track browser compatibility issues',
      '  - Set up automated alerting for critical failures',
      '',
      '🔄 **Maintenance Strategy**:',
      '  - Establish regular dependency update schedule',
      '  - Implement automated regression testing',
      '  - Maintain backward compatibility layers',
      '  - Document all breaking changes and migration paths'
    ];

    if (criticalRisks.length > 0) {
      recommendations.unshift(
        '🚨 **CRITICAL RISKS IDENTIFIED**:',
        '  - Address critical risks before production deployment',
        '  - Implement all mitigation strategies for critical risks',
        '  - Establish 24/7 monitoring for critical components',
        ''
      );
    }

    return recommendations;
  }

  /**
   * Generate risk mitigation checklist for implementation
   */
  generateMitigationChecklist(): string[] {
    const checklist: string[] = [
      '## 🔍 **Pre-Implementation Checklist**',
      '',
      '### WASM and Initialization',
      '- [ ] Test WASM loading across all target browsers',
      '- [ ] Implement fallback mechanisms for WASM failures',
      '- [ ] Add comprehensive error handling for Parser.init()',
      '- [ ] Set up WASM file caching and versioning',
      '',
      '### Memory Management',
      '- [ ] Implement proper parser.delete() cleanup',
      '- [ ] Set up memory usage monitoring',
      '- [ ] Add automatic garbage collection for unused trees',
      '- [ ] Test memory usage with large files',
      '',
      '### Performance Optimization',
      '- [ ] Implement incremental parsing',
      '- [ ] Set up Web Workers for large file processing',
      '- [ ] Add parsing time limits and progress indicators',
      '- [ ] Optimize query compilation and caching',
      '',
      '### Browser Compatibility',
      '- [ ] Test across all major browsers (Chrome, Firefox, Safari, Edge)',
      '- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)',
      '- [ ] Implement feature detection for WASM support',
      '- [ ] Provide polyfills for missing APIs',
      '',
      '### Security Measures',
      '- [ ] Implement input validation and sanitization',
      '- [ ] Add parsing timeouts to prevent DoS',
      '- [ ] Set up Content Security Policy (CSP)',
      '- [ ] Conduct security audit of dependencies',
      '',
      '### Monitoring and Observability',
      '- [ ] Set up error tracking and reporting',
      '- [ ] Implement performance monitoring',
      '- [ ] Add browser compatibility tracking',
      '- [ ] Set up automated alerting for failures',
      '',
      '## 🚀 **Post-Implementation Monitoring**',
      '',
      '### Daily Monitoring',
      '- [ ] Check error rates and types',
      '- [ ] Monitor parsing performance metrics',
      '- [ ] Review memory usage patterns',
      '- [ ] Track browser compatibility issues',
      '',
      '### Weekly Reviews',
      '- [ ] Analyze performance trends',
      '- [ ] Review user feedback and issues',
      '- [ ] Check for tree-sitter updates',
      '- [ ] Update risk assessment based on new data',
      '',
      '### Monthly Assessments',
      '- [ ] Conduct comprehensive performance review',
      '- [ ] Update browser compatibility matrix',
      '- [ ] Review and update security measures',
      '- [ ] Plan for upcoming tree-sitter updates'
    ];

    return checklist;
  }
}

// Usage example
const riskManager = new WebTreeSitterRiskManager();
const assessment = riskManager.assessOverallRisk();

console.log(`Overall Risk Level: ${assessment.level.toUpperCase()}`);
console.log('\nRecommendations:');
assessment.recommendations.forEach(rec => console.log(rec));

if (assessment.criticalRisks.length > 0) {
  console.log('\n🚨 Critical Risks Requiring Immediate Attention:');
  assessment.criticalRisks.forEach(risk => {
    console.log(`\n${risk.category.toUpperCase()}: ${risk.impact}`);
    console.log('Mitigation strategies:');
    risk.mitigation.forEach(strategy => console.log(`  - ${strategy}`));
  });
}

const checklist = riskManager.generateMitigationChecklist();
console.log('\n' + checklist.join('\n'));
```

#### 5.2 Implementation Risk Matrix

| Risk Category | Probability | Impact | Severity | Priority |
|---------------|-------------|---------|----------|----------|
| **WASM Loading Failures** | Medium | High | 🔴 High | P1 |
| **Memory Leaks** | High | High | 🔴 High | P1 |
| **Browser Compatibility** | Medium | Medium | 🟡 Medium | P2 |
| **Performance Degradation** | High | Medium | 🟡 Medium | P2 |
| **Security Vulnerabilities** | Low | Medium | 🟡 Medium | P3 |
| **Query Compilation Errors** | Medium | Medium | 🟡 Medium | P3 |
| **Maintenance Complexity** | High | Medium | 🟡 Medium | P3 |

#### 5.3 Success Criteria and Monitoring

**Key Performance Indicators (KPIs)**:
- **WASM Loading Success Rate**: >99.5%
- **Memory Usage**: <50MB for typical usage, <200MB for large files
- **Parse Time**: <10ms for 1000-line files, <100ms for 10,000-line files
- **Browser Compatibility**: >95% success rate across target browsers
- **Error Rate**: <0.1% for valid OpenSCAD code
- **User Satisfaction**: >90% positive feedback

**Monitoring Dashboard Metrics**:
- Real-time error tracking and alerting
- Performance metrics with historical trends
- Browser compatibility matrix with usage statistics
- Memory usage patterns and leak detection
- User engagement and feature adoption rates

This comprehensive risk assessment provides a solid foundation for implementing web tree-sitter with the OpenSCAD grammar while minimizing potential issues and ensuring production readiness.

---

### Priority 2 (P2): Advanced Editor Integration and Developer Experience

#### Task 2.1: VS Code Extension Development

##### 2.1.a: Core Extension Architecture

**Implementation Timeline**: 3-4 weeks
**Difficulty**: Medium-High
**Dependencies**: P1 tasks completion

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { OpenSCADLanguageClient } from './languageClient';
import { OpenSCADWebViewProvider } from './webviewProvider';
import { OpenSCADTreeDataProvider } from './treeProvider';

export class OpenSCADExtension {
    private languageClient: OpenSCADLanguageClient;
    private webviewProvider: OpenSCADWebViewProvider;
    private treeProvider: OpenSCADTreeDataProvider;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async activate(): Promise<void> {
        // Initialize language client with web tree-sitter
        this.languageClient = new OpenSCADLanguageClient(this.context);
        await this.languageClient.start();

        // Register webview provider for 3D preview
        this.webviewProvider = new OpenSCADWebViewProvider(this.context);
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                'openscadPreview',
                this.webviewProvider
            )
        );

        // Register tree data provider for outline view
        this.treeProvider = new OpenSCADTreeDataProvider();
        this.context.subscriptions.push(
            vscode.window.createTreeView('openscadOutline', {
                treeDataProvider: this.treeProvider
            })
        );

        // Register commands
        this.registerCommands();

        // Setup event handlers
        this.setupEventHandlers();
    }

    private registerCommands(): void {
        const commands = [
            vscode.commands.registerCommand('openscad.parse', this.parseCurrentFile.bind(this)),
            vscode.commands.registerCommand('openscad.preview', this.showPreview.bind(this)),
            vscode.commands.registerCommand('openscad.format', this.formatDocument.bind(this)),
            vscode.commands.registerCommand('openscad.refactor.extractModule', this.extractModule.bind(this)),
            vscode.commands.registerCommand('openscad.analyze.complexity', this.analyzeComplexity.bind(this))
        ];

        this.context.subscriptions.push(...commands);
    }

    private setupEventHandlers(): void {
        // Document change events
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (event.document.languageId === 'openscad') {
                await this.languageClient.updateDocument(event.document);
                this.treeProvider.refresh(event.document);
            }
        });

        // Active editor change events
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor?.document.languageId === 'openscad') {
                this.webviewProvider.updatePreview(editor.document);
            }
        });
    }

    private async parseCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'openscad') {
            vscode.window.showErrorMessage('No OpenSCAD file is currently open');
            return;
        }

        try {
            const parseResult = await this.languageClient.parseDocument(editor.document);
            vscode.window.showInformationMessage(`Parsed successfully: ${parseResult.nodeCount} nodes`);
        } catch (error) {
            vscode.window.showErrorMessage(`Parse error: ${error.message}`);
        }
    }

    deactivate(): void {
        this.languageClient?.stop();
    }
}
```

##### 2.1.b: Language Client Integration

```typescript
// src/languageClient.ts
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';

export class OpenSCADLanguageClient {
    private parser: Parser;
    private language: Parser.Language;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(private context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('openscad');
        this.context.subscriptions.push(this.diagnosticCollection);
    }

    async start(): Promise<void> {
        // Initialize web tree-sitter
        await Parser.init();
        this.parser = new Parser();
        
        // Load OpenSCAD language
        const wasmPath = vscode.Uri.joinPath(
            this.context.extensionUri,
            'dist',
            'tree-sitter-openscad.wasm'
        );
        
        this.language = await Parser.Language.load(wasmPath.fsPath);
        this.parser.setLanguage(this.language);

        // Register language features
        this.registerLanguageFeatures();
    }

    private registerLanguageFeatures(): void {
        // Completion provider
        this.context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                'openscad',
                new OpenSCADCompletionProvider(this.parser, this.language),
                '.'
            )
        );

        // Hover provider
        this.context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                'openscad',
                new OpenSCADHoverProvider(this.parser, this.language)
            )
        );

        // Definition provider
        this.context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(
                'openscad',
                new OpenSCADDefinitionProvider(this.parser, this.language)
            )
        );

        // Document symbol provider
        this.context.subscriptions.push(
            vscode.languages.registerDocumentSymbolProvider(
                'openscad',
                new OpenSCADSymbolProvider(this.parser, this.language)
            )
        );
    }

    async updateDocument(document: vscode.TextDocument): Promise<void> {
        const tree = this.parser.parse(document.getText());
        const diagnostics = this.generateDiagnostics(tree, document);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    async parseDocument(document: vscode.TextDocument): Promise<{ tree: Parser.Tree; nodeCount: number }> {
        const tree = this.parser.parse(document.getText());
        return {
            tree,
            nodeCount: this.countNodes(tree.rootNode)
        };
    }

    private countNodes(node: Parser.SyntaxNode): number {
        let count = 1;
        for (const child of node.children) {
            count += this.countNodes(child);
        }
        return count;
    }

    stop(): void {
        this.diagnosticCollection.clear();
    }
}
```

#### Task 2.2: Syntax Highlighting and Theme Support

##### 2.2.a: TextMate Grammar Enhancement

**Implementation Timeline**: 2-3 weeks
**Difficulty**: Medium

```json
{
  "name": "OpenSCAD",
  "scopeName": "source.openscad",
  "fileTypes": ["scad"],
  "patterns": [
    {
      "include": "#comments"
    },
    {
      "include": "#strings"
    },
    {
      "include": "#numbers"
    },
    {
      "include": "#keywords"
    },
    {
      "include": "#functions"
    },
    {
      "include": "#modules"
    },
    {
      "include": "#variables"
    },
    {
      "include": "#operators"
    },
    {
      "include": "#punctuation"
    }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.line.double-slash.openscad",
          "match": "//.*$"
        },
        {
          "name": "comment.block.openscad",
          "begin": "/\\*",
          "end": "\\*/"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.double.openscad",
          "begin": "\"",
          "end": "\"",
          "patterns": [
            {
              "name": "constant.character.escape.openscad",
              "match": "\\\\."
            }
          ]
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.openscad",
          "match": "\\b(if|else|for|intersection_for|let|assign)\\b"
        },
        {
          "name": "keyword.other.openscad",
          "match": "\\b(module|function|include|use)\\b"
        },
        {
          "name": "keyword.operator.logical.openscad",
          "match": "\\b(and|or|not)\\b|&&|\\|\\||!"
        }
      ]
    },
    "functions": {
      "patterns": [
        {
          "name": "entity.name.function.builtin.openscad",
          "match": "\\b(abs|acos|asin|atan|atan2|ceil|cos|cross|exp|floor|ln|log|max|min|norm|pow|rands|round|sign|sin|sqrt|tan)\\b"
        },
        {
          "name": "entity.name.function.geometric.openscad",
          "match": "\\b(cube|sphere|cylinder|polyhedron|square|circle|polygon|text)\\b"
        },
        {
          "name": "entity.name.function.transformation.openscad",
          "match": "\\b(translate|rotate|scale|resize|mirror|multmatrix|color|hull|minkowski)\\b"
        },
        {
          "name": "entity.name.function.boolean.openscad",
          "match": "\\b(union|difference|intersection)\\b"
        }
      ]
    },
    "modules": {
      "patterns": [
        {
          "name": "entity.name.function.user-defined.openscad",
          "match": "\\b([a-zA-Z_][a-zA-Z0-9_]*)\\s*(?=\\()"
        }
      ]
    },
    "variables": {
      "patterns": [
        {
          "name": "variable.parameter.openscad",
          "match": "\\b[a-zA-Z_][a-zA-Z0-9_]*\\s*(?==)"
        },
        {
          "name": "variable.other.openscad",
          "match": "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }
      ]
    },
    "numbers": {
      "patterns": [
        {
          "name": "constant.numeric.float.openscad",
          "match": "\\b\\d+\\.\\d*([eE][+-]?\\d+)?\\b"
        },
        {
          "name": "constant.numeric.integer.openscad",
          "match": "\\b\\d+\\b"
        }
      ]
    },
    "operators": {
      "patterns": [
        {
          "name": "keyword.operator.arithmetic.openscad",
          "match": "\\+|\\-|\\*|\\/|%|\\^"
        },
        {
          "name": "keyword.operator.comparison.openscad",
          "match": "==|!=|<|>|<=|>="
        },
        {
          "name": "keyword.operator.assignment.openscad",
          "match": "="
        }
      ]
    },
    "punctuation": {
      "patterns": [
        {
          "name": "punctuation.definition.parameters.begin.openscad",
          "match": "\\("
        },
        {
          "name": "punctuation.definition.parameters.end.openscad",
          "match": "\\)"
        },
        {
          "name": "punctuation.definition.block.begin.openscad",
          "match": "\\{"
        },
        {
          "name": "punctuation.definition.block.end.openscad",
          "match": "\\}"
        },
        {
          "name": "punctuation.separator.comma.openscad",
          "match": ","
        },
        {
          "name": "punctuation.terminator.statement.openscad",
          "match": ";"
        }
      ]
    }
  }
}
```

##### 2.2.b: Semantic Token Provider

```typescript
// src/semanticTokenProvider.ts
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';

export class OpenSCADSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    private parser: Parser;
    private language: Parser.Language;

    constructor(parser: Parser, language: Parser.Language) {
        this.parser = parser;
        this.language = language;
    }

    async provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.SemanticTokens> {
        const tree = this.parser.parse(document.getText());
        const builder = new vscode.SemanticTokensBuilder();

        this.traverse(tree.rootNode, builder, document);

        return builder.build();
    }

    private traverse(node: Parser.SyntaxNode, builder: vscode.SemanticTokensBuilder, document: vscode.TextDocument): void {
        // Map node types to semantic token types
        const tokenTypeMap: Record<string, string> = {
            'module_definition': 'function',
            'function_definition': 'function',
            'function_call': 'function',
            'module_call': 'function',
            'variable_assignment': 'variable',
            'identifier': 'variable',
            'number': 'number',
            'string': 'string',
            'comment': 'comment',
            'boolean_operator': 'operator',
            'arithmetic_operator': 'operator',
            'comparison_operator': 'operator'
        };

        const tokenType = tokenTypeMap[node.type];
        if (tokenType) {
            const startPos = document.positionAt(node.startIndex);
            const length = node.endIndex - node.startIndex;
            builder.push(startPos.line, startPos.character, length, this.getTokenTypeIndex(tokenType));
        }

        for (const child of node.children) {
            this.traverse(child, builder, document);
        }
    }

    private getTokenTypeIndex(tokenType: string): number {
        const legend = [
            'namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter',
            'parameter', 'variable', 'property', 'enumMember', 'event', 'function',
            'method', 'macro', 'keyword', 'modifier', 'comment', 'string', 'number',
            'regexp', 'operator'
        ];
        return legend.indexOf(tokenType) || 0;
    }
}
```

#### Task 2.3: Code Formatting and Linting Integration

##### 2.3.a: OpenSCAD Formatter Implementation

**Implementation Timeline**: 2-3 weeks
**Difficulty**: Medium-High

```typescript
// src/formatter.ts
import Parser from 'web-tree-sitter';

export interface FormattingOptions {
    tabSize: number;
    insertSpaces: boolean;
    trimTrailingWhitespace: boolean;
    insertFinalNewline: boolean;
    maxLineLength: number;
}

export class OpenSCADFormatter {
    private parser: Parser;
    private language: Parser.Language;

    constructor(parser: Parser, language: Parser.Language) {
        this.parser = parser;
        this.language = language;
    }

    formatDocument(text: string, options: FormattingOptions): string {
        const tree = this.parser.parse(text);
        const formatted = this.formatNode(tree.rootNode, 0, options);
        
        if (options.trimTrailingWhitespace) {
            return this.trimTrailingWhitespace(formatted);
        }
        
        return formatted;
    }

    private formatNode(node: Parser.SyntaxNode, indentLevel: number, options: FormattingOptions): string {
        const indent = this.getIndent(indentLevel, options);
        let result = '';

        switch (node.type) {
            case 'source_file':
                return this.formatSourceFile(node, indentLevel, options);
            
            case 'module_definition':
                return this.formatModuleDefinition(node, indentLevel, options);
            
            case 'function_definition':
                return this.formatFunctionDefinition(node, indentLevel, options);
            
            case 'module_call':
                return this.formatModuleCall(node, indentLevel, options);
            
            case 'block_statement':
                return this.formatBlockStatement(node, indentLevel, options);
            
            case 'assignment_statement':
                return this.formatAssignmentStatement(node, indentLevel, options);
            
            case 'expression_statement':
                return this.formatExpressionStatement(node, indentLevel, options);
            
            default:
                // Default formatting for unspecified node types
                return this.formatGenericNode(node, indentLevel, options);
        }
    }

    private formatSourceFile(node: Parser.SyntaxNode, indentLevel: number, options: FormattingOptions): string {
        const parts: string[] = [];
        
        for (const child of node.children) {
            const formatted = this.formatNode(child, indentLevel, options);
            if (formatted.trim()) {
                parts.push(formatted);
            }
        }
        
        let result = parts.join('\n\n');
        
        if (options.insertFinalNewline && !result.endsWith('\n')) {
            result += '\n';
        }
        
        return result;
    }

    private formatModuleDefinition(node: Parser.SyntaxNode, indentLevel: number, options: FormattingOptions): string {
        const indent = this.getIndent(indentLevel, options);
        let result = indent + 'module ';
        
        // Format module name and parameters
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
            result += nameNode.text;
        }
        
        const parametersNode = node.childForFieldName('parameters');
        if (parametersNode) {
            result += this.formatParameters(parametersNode, options);
        }
        
        result += ' ';
        
        // Format module body
        const bodyNode = node.childForFieldName('body');
        if (bodyNode) {
            result += this.formatNode(bodyNode, indentLevel, options);
        }
        
        return result;
    }

    private formatBlockStatement(node: Parser.SyntaxNode, indentLevel: number, options: FormattingOptions): string {
        const indent = this.getIndent(indentLevel, options);
        let result = '{\n';
        
        for (const child of node.children) {
            if (child.type !== '{' && child.type !== '}') {
                const formatted = this.formatNode(child, indentLevel + 1, options);
                if (formatted.trim()) {
                    result += formatted + '\n';
                }
            }
        }
        
        result += indent + '}';
        return result;
    }

    private formatParameters(node: Parser.SyntaxNode, options: FormattingOptions): string {
        if (node.children.length === 0) {
            return '()';
        }
        
        let result = '(';
        const parameters: string[] = [];
        
        for (const child of node.children) {
            if (child.type === 'parameter') {
                parameters.push(child.text.trim());
            }
        }
        
        if (parameters.length > 3 || parameters.join(', ').length > options.maxLineLength - 20) {
            // Multi-line parameter formatting
            result += '\n';
            for (let i = 0; i < parameters.length; i++) {
                result += '    ' + parameters[i];
                if (i < parameters.length - 1) {
                    result += ',';
                }
                result += '\n';
            }
            result += ')';
        } else {
            // Single-line parameter formatting
            result += parameters.join(', ') + ')';
        }
        
        return result;
    }

    private getIndent(level: number, options: FormattingOptions): string {
        const unit = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
        return unit.repeat(level);
    }

    private trimTrailingWhitespace(text: string): string {
        return text.replace(/[ \t]+$/gm, '');
    }
}
```

---

### Priority 3 (P3): Advanced Development Tools and Ecosystem

#### Task 3.1: Build System Integration and Optimization

##### 3.1.a: Webpack/Vite Integration for Web Tree-sitter

**Implementation Timeline**: 2-3 weeks
**Difficulty**: Medium

```typescript
// webpack.config.js
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.wasm$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            "path": require.resolve("path-browserify"),
            "fs": false,
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'OpenSCADParser',
        libraryTarget: 'umd',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'node_modules/tree-sitter-openscad/dist/tree-sitter-openscad.wasm',
                    to: 'tree-sitter-openscad.wasm'
                }
            ]
        })
    ],
    experiments: {
        asyncWebAssembly: true,
    }
};
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'OpenSCADParser',
            fileName: 'openscad-parser',
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['web-tree-sitter'],
            output: {
                globals: {
                    'web-tree-sitter': 'TreeSitter'
                }
            }
        }
    },
    assetsInclude: ['**/*.wasm'],
    worker: {
        format: 'es'
    },
    optimizeDeps: {
        exclude: ['web-tree-sitter']
    }
});
```

##### 3.1.b: Performance Optimization and Bundle Analysis

```typescript
// src/performance/bundleAnalyzer.ts
export interface BundleMetrics {
    totalSize: number;
    wasmSize: number;
    jsSize: number;
    compressionRatio: number;
    loadTime: number;
    parseTime: number;
    memoryUsage: number;
}

export class PerformanceBenchmark {
    private metrics: BundleMetrics[] = [];

    async measureBundlePerformance(): Promise<BundleMetrics> {
        const startTime = performance.now();
        
        // Measure WASM loading
        const wasmStartTime = performance.now();
        const wasmResponse = await fetch('./tree-sitter-openscad.wasm');
        const wasmBuffer = await wasmResponse.arrayBuffer();
        const wasmLoadTime = performance.now() - wasmStartTime;
        
        // Measure JS bundle loading
        const jsStartTime = performance.now();
        const { default: Parser } = await import('web-tree-sitter');
        const jsLoadTime = performance.now() - jsStartTime;
        
        // Measure memory usage
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
        
        // Initialize parser
        await Parser.init();
        const parser = new Parser();
        const language = await Parser.Language.load(wasmBuffer);
        parser.setLanguage(language);
        
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryUsed = finalMemory - initialMemory;
        
        // Measure parse time with sample code
        const sampleCode = 'cube([10, 10, 10]);';
        const parseStartTime = performance.now();
        parser.parse(sampleCode);
        const parseTime = performance.now() - parseStartTime;
        
        const totalTime = performance.now() - startTime;
        
        const metrics: BundleMetrics = {
            totalSize: wasmBuffer.byteLength,
            wasmSize: wasmBuffer.byteLength,
            jsSize: 0, // Would need to be measured differently
            compressionRatio: 1.0, // Would need original size comparison
            loadTime: totalTime,
            parseTime: parseTime,
            memoryUsage: memoryUsed
        };
        
        this.metrics.push(metrics);
        return metrics;
    }

    generateReport(): string {
        const latest = this.metrics[this.metrics.length - 1];
        return `
Performance Report:
==================
Total Bundle Size: ${(latest.totalSize / 1024).toFixed(2)} KB
WASM Size: ${(latest.wasmSize / 1024).toFixed(2)} KB
Load Time: ${latest.loadTime.toFixed(2)} ms
Parse Time: ${latest.parseTime.toFixed(2)} ms
Memory Usage: ${(latest.memoryUsage / 1024).toFixed(2)} KB

Recommendations:
${this.generateRecommendations(latest)}
        `;
    }

    private generateRecommendations(metrics: BundleMetrics): string {
        const recommendations: string[] = [];
        
        if (metrics.loadTime > 100) {
            recommendations.push('- Consider lazy loading WASM file');
        }
        
        if (metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
            recommendations.push('- Memory usage is high, consider parser pooling');
        }
        
        if (metrics.parseTime > 10) {
            recommendations.push('- Parse time is slow for simple code, check grammar efficiency');
        }
        
        return recommendations.join('\n') || '- Performance is optimal';
    }
}
```

#### Task 3.2: Documentation Generation and API Documentation

##### 3.2.a: Automated Documentation Generation

**Implementation Timeline**: 2-3 weeks
**Difficulty**: Medium

```typescript
// src/docs/generator.ts
import Parser from 'web-tree-sitter';

export interface APIDocumentation {
    modules: ModuleDoc[];
    functions: FunctionDoc[];
    variables: VariableDoc[];
    types: TypeDoc[];
}

export interface ModuleDoc {
    name: string;
    description: string;
    parameters: ParameterDoc[];
    examples: ExampleDoc[];
    location: LocationInfo;
}

export interface FunctionDoc {
    name: string;
    description: string;
    parameters: ParameterDoc[];
    returnType: string;
    examples: ExampleDoc[];
    location: LocationInfo;
}

export interface ParameterDoc {
    name: string;
    type: string;
    description: string;
    defaultValue?: string;
    required: boolean;
}

export interface ExampleDoc {
    code: string;
    description: string;
    output?: string;
}

export interface LocationInfo {
    file: string;
    line: number;
    column: number;
}

export class OpenSCADDocGenerator {
    private parser: Parser;
    private language: Parser.Language;

    constructor(parser: Parser, language: Parser.Language) {
        this.parser = parser;
        this.language = language;
    }

    generateDocumentation(sourceFiles: Map<string, string>): APIDocumentation {
        const documentation: APIDocumentation = {
            modules: [],
            functions: [],
            variables: [],
            types: []
        };

        for (const [filename, content] of sourceFiles) {
            const tree = this.parser.parse(content);
            this.extractDocumentation(tree.rootNode, filename, documentation);
        }

        return documentation;
    }

    private extractDocumentation(node: Parser.SyntaxNode, filename: string, docs: APIDocumentation): void {
        switch (node.type) {
            case 'module_definition':
                docs.modules.push(this.extractModuleDoc(node, filename));
                break;
            
            case 'function_definition':
                docs.functions.push(this.extractFunctionDoc(node, filename));
                break;
            
            case 'variable_assignment':
                docs.variables.push(this.extractVariableDoc(node, filename));
                break;
        }

        for (const child of node.children) {
            this.extractDocumentation(child, filename, docs);
        }
    }

    private extractModuleDoc(node: Parser.SyntaxNode, filename: string): ModuleDoc {
        const nameNode = node.childForFieldName('name');
        const parametersNode = node.childForFieldName('parameters');
        
        return {
            name: nameNode?.text || 'unknown',
            description: this.extractComment(node) || '',
            parameters: this.extractParameters(parametersNode),
            examples: this.extractExamples(node),
            location: {
                file: filename,
                line: node.startPosition.row + 1,
                column: node.startPosition.column + 1
            }
        };
    }

    private extractComment(node: Parser.SyntaxNode): string | null {
        // Look for preceding comment
        let current = node.previousSibling;
        while (current && current.type === 'comment') {
            const comment = current.text.trim();
            if (comment.startsWith('//') || comment.startsWith('/*')) {
                return this.cleanComment(comment);
            }
            current = current.previousSibling;
        }
        return null;
    }

    private cleanComment(comment: string): string {
        return comment
            .replace(/^\/\*+\s*/, '')
            .replace(/\s*\*+\/$/, '')
            .replace(/^\/\/\s*/, '')
            .trim();
    }

    generateMarkdown(docs: APIDocumentation): string {
        let markdown = '# OpenSCAD API Documentation\n\n';
        
        // Generate table of contents
        markdown += '## Table of Contents\n\n';
        markdown += '- [Modules](#modules)\n';
        markdown += '- [Functions](#functions)\n';
        markdown += '- [Variables](#variables)\n\n';
        
        // Generate modules section
        if (docs.modules.length > 0) {
            markdown += '## Modules\n\n';
            for (const module of docs.modules) {
                markdown += `### ${module.name}\n\n`;
                if (module.description) {
                    markdown += `${module.description}\n\n`;
                }
                
                if (module.parameters.length > 0) {
                    markdown += '**Parameters:**\n\n';
                    for (const param of module.parameters) {
                        markdown += `- \`${param.name}\` (${param.type})`;
                        if (param.required) {
                            markdown += ' *required*';
                        }
                        if (param.defaultValue) {
                            markdown += ` - default: \`${param.defaultValue}\``;
                        }
                        if (param.description) {
                            markdown += `: ${param.description}`;
                        }
                        markdown += '\n';
                    }
                    markdown += '\n';
                }
                
                if (module.examples.length > 0) {
                    markdown += '**Examples:**\n\n';
                    for (const example of module.examples) {
                        if (example.description) {
                            markdown += `${example.description}\n\n`;
                        }
                        markdown += '```openscad\n';
                        markdown += `${example.code}\n`;
                        markdown += '```\n\n';
                    }
                }
                
                markdown += `*Location: ${module.location.file}:${module.location.line}*\n\n`;
            }
        }
        
        return markdown;
    }

    exportToJSON(docs: APIDocumentation): string {
        return JSON.stringify(docs, null, 2);
    }

    exportToHTML(docs: APIDocumentation): string {
        const markdown = this.generateMarkdown(docs);
        // Would need markdown-to-HTML converter
        return `
<!DOCTYPE html>
<html>
<head>
    <title>OpenSCAD API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .module { border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
        .parameter { background: #f6f8fa; padding: 8px; margin: 4px 0; border-radius: 3px; }
        code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        ${this.markdownToHTML(markdown)}
    </div>
</body>
</html>
        `;
    }

    private markdownToHTML(markdown: string): string {
        // Basic markdown to HTML conversion - would use proper library in production
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```openscad\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
    }
}
```

#### Task 3.3: Testing Infrastructure and Quality Assurance

##### 3.3.a: Comprehensive Test Suite Enhancement

**Implementation Timeline**: 3-4 weeks  
**Difficulty**: Medium-High

```typescript
// test/integration/fullWorkflow.test.ts
import { OpenSCADParser } from '../../src/parser';
import { OpenSCADFormatter } from '../../src/formatter';
import { OpenSCADComplexityAnalyzer } from '../../src/analyzer';

describe('Full Workflow Integration Tests', () => {
    let parser: OpenSCADParser;
    let formatter: OpenSCADFormatter;
    let analyzer: OpenSCADComplexityAnalyzer;

    beforeAll(async () => {
        parser = new OpenSCADParser();
        await parser.init();
        formatter = new OpenSCADFormatter(parser.getParser(), parser.getLanguage());
        analyzer = new OpenSCADComplexityAnalyzer(parser.getParser(), parser.getLanguage());
    });

    describe('Complex OpenSCAD Projects', () => {
        test('should handle large modular project', async () => {
            const projectFiles = await loadTestProject('complex-modular');
            
            for (const [filename, content] of projectFiles) {
                // Parse each file
                const parseResult = await parser.parseDocument(content);
                expect(parseResult.errors).toHaveLength(0);
                
                // Format each file
                const formatted = formatter.formatDocument(content, {
                    tabSize: 4,
                    insertSpaces: true,
                    trimTrailingWhitespace: true,
                    insertFinalNewline: true,
                    maxLineLength: 100
                });
                expect(formatted).toBeDefined();
                
                // Analyze complexity
                const complexity = await analyzer.analyzeComplexity(content);
                expect(complexity.overallScore).toBeLessThan(20); // Maintainable threshold
            }
        });

        test('should maintain performance under load', async () => {
            const largeFile = generateLargeOpenSCADFile(10000); // 10k lines
            
            const startTime = performance.now();
            const parseResult = await parser.parseDocument(largeFile);
            const parseTime = performance.now() - startTime;
            
            expect(parseTime).toBeLessThan(1000); // Less than 1 second
            expect(parseResult.errors).toHaveLength(0);
        });
    });

    describe('Error Recovery and Resilience', () => {
        test('should gracefully handle malformed syntax', async () => {
            const malformedCode = `
                module broken_module(
                    cube([10, 10, 10]); // Missing closing parenthesis
                }
                
                translate([5, 5, 5]) {
                    sphere(r=5
                } // Missing closing parenthesis
            `;
            
            const parseResult = await parser.parseDocument(malformedCode);
            expect(parseResult.tree).toBeDefined();
            expect(parseResult.errors.length).toBeGreaterThan(0);
            
            // Should still be able to extract some meaningful information
            const modules = await parser.extractModules(malformedCode);
            expect(modules.length).toBeGreaterThan(0);
        });
    });
});

function generateLargeOpenSCADFile(lines: number): string {
    const content: string[] = [];
    
    for (let i = 0; i < lines; i++) {
        if (i % 100 === 0) {
            content.push(`module test_module_${i}() {`);
        } else if (i % 100 === 99) {
            content.push(`}`);
        } else {
            content.push(`    cube([${i % 10}, ${(i + 1) % 10}, ${(i + 2) % 10}]);`);
        }
    }
    
    return content.join('\n');
}
```

---

### Priority 4 (P4): Advanced Features and Ecosystem Integration

#### Task 4.1: Advanced Code Analysis and Refactoring Tools

##### 4.1.a: Dependency Analysis and Module Graph Generation

**Implementation Timeline**: 3-4 weeks
**Difficulty**: High

```typescript
// src/analysis/dependencyAnalyzer.ts
export interface DependencyGraph {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    circularDependencies: CircularDependency[];
    unresolvedDependencies: UnresolvedDependency[];
}

export interface DependencyNode {
    id: string;
    type: 'module' | 'function' | 'file';
    name: string;
    filePath: string;
    location: SourceLocation;
    exports: string[];
    complexity: number;
}

export interface DependencyEdge {
    from: string;
    to: string;
    type: 'include' | 'use' | 'call' | 'reference';
    strength: number; // How critical this dependency is
}

export interface CircularDependency {
    cycle: string[];
    severity: 'warning' | 'error';
    suggestions: string[];
}

export class OpenSCADDependencyAnalyzer {
    private parser: Parser;
    private language: Parser.Language;
    private projectFiles: Map<string, string> = new Map();

    constructor(parser: Parser, language: Parser.Language) {
        this.parser = parser;
        this.language = language;
    }

    async analyzeProject(projectPath: string): Promise<DependencyGraph> {
        // Load all OpenSCAD files in project
        await this.loadProjectFiles(projectPath);
        
        const nodes: DependencyNode[] = [];
        const edges: DependencyEdge[] = [];
        
        // Analyze each file
        for (const [filePath, content] of this.projectFiles) {
            const fileNodes = await this.analyzeFile(filePath, content);
            const fileEdges = await this.extractDependencies(filePath, content);
            
            nodes.push(...fileNodes);
            edges.push(...fileEdges);
        }
        
        // Detect circular dependencies
        const circularDependencies = this.detectCircularDependencies(edges);
        
        // Find unresolved dependencies
        const unresolvedDependencies = this.findUnresolvedDependencies(nodes, edges);
        
        return {
            nodes,
            edges,
            circularDependencies,
            unresolvedDependencies
        };
    }

    private detectCircularDependencies(edges: DependencyEdge[]): CircularDependency[] {
        const graph = new Map<string, string[]>();
        
        // Build adjacency list
        for (const edge of edges) {
            if (!graph.has(edge.from)) {
                graph.set(edge.from, []);
            }
            graph.get(edge.from)!.push(edge.to);
        }
        
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const cycles: CircularDependency[] = [];
        
        const dfs = (node: string, path: string[]): void => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, [...path]);
                } else if (recursionStack.has(neighbor)) {
                    // Found cycle
                    const cycleStart = path.indexOf(neighbor);
                    const cycle = path.slice(cycleStart);
                    cycles.push({
                        cycle,
                        severity: this.determineCycleSeverity(cycle),
                        suggestions: this.generateCycleSuggestions(cycle)
                    });
                }
            }
            
            recursionStack.delete(node);
        };
        
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }
        
        return cycles;
    }

    generateVisualization(graph: DependencyGraph): string {
        // Generate DOT format for Graphviz
        let dot = 'digraph DependencyGraph {\n';
        dot += '  rankdir=TB;\n';
        dot += '  node [shape=box, style=rounded];\n\n';
        
        // Add nodes
        for (const node of graph.nodes) {
            const color = this.getNodeColor(node);
            dot += `  "${node.id}" [label="${node.name}", fillcolor="${color}", style=filled];\n`;
        }
        
        dot += '\n';
        
        // Add edges
        for (const edge of graph.edges) {
            const style = this.getEdgeStyle(edge);
            dot += `  "${edge.from}" -> "${edge.to}" [${style}];\n`;
        }
        
        // Highlight circular dependencies
        for (const cycle of graph.circularDependencies) {
            for (let i = 0; i < cycle.cycle.length; i++) {
                const from = cycle.cycle[i];
                const to = cycle.cycle[(i + 1) % cycle.cycle.length];
                dot += `  "${from}" -> "${to}" [color=red, style=bold];\n`;
            }
        }
        
        dot += '}';
        return dot;
    }
}
```

##### 4.1.b: Automated Refactoring Tools

```typescript
// src/refactoring/refactoringEngine.ts
export interface RefactoringOperation {
    type: RefactoringType;
    description: string;
    location: SourceLocation;
    changes: TextChange[];
    validation: ValidationResult;
}

export enum RefactoringType {
    EXTRACT_MODULE = 'extract_module',
    INLINE_MODULE = 'inline_module',
    RENAME_SYMBOL = 'rename_symbol',
    MOVE_MODULE = 'move_module',
    SPLIT_FILE = 'split_file',
    MERGE_FILES = 'merge_files',
    EXTRACT_PARAMETER = 'extract_parameter',
    REMOVE_DEAD_CODE = 'remove_dead_code'
}

export class OpenSCADRefactoringEngine {
    private parser: Parser;
    private language: Parser.Language;

    constructor(parser: Parser, language: Parser.Language) {
        this.parser = parser;
        this.language = language;
    }

    async extractModule(
        code: string,
        selection: SourceRange,
        moduleName: string
    ): Promise<RefactoringOperation> {
        const tree = this.parser.parse(code);
        const selectedNodes = this.findNodesInRange(tree.rootNode, selection);
        
        // Analyze dependencies and parameters
        const dependencies = this.analyzeDependencies(selectedNodes);
        const parameters = this.extractParameters(dependencies);
        
        // Generate new module definition
        const moduleDefinition = this.generateModuleDefinition(
            moduleName,
            parameters,
            selectedNodes
        );
        
        // Generate module call
        const moduleCall = this.generateModuleCall(moduleName, parameters);
        
        const changes: TextChange[] = [
            {
                range: { start: 0, end: 0 },
                newText: moduleDefinition + '\n\n',
                type: 'insert'
            },
            {
                range: selection,
                newText: moduleCall,
                type: 'replace'
            }
        ];
        
        return {
            type: RefactoringType.EXTRACT_MODULE,
            description: `Extract selected code into module '${moduleName}'`,
            location: { line: selection.start.line, column: selection.start.column },
            changes,
            validation: await this.validateRefactoring(code, changes)
        };
    }

    async renameSymbol(
        code: string,
        symbolLocation: SourceLocation,
        newName: string
    ): Promise<RefactoringOperation> {
        const tree = this.parser.parse(code);
        const symbolNode = this.findSymbolAtLocation(tree.rootNode, symbolLocation);
        
        if (!symbolNode) {
            throw new Error('No symbol found at specified location');
        }
        
        // Find all references to this symbol
        const references = this.findAllReferences(tree.rootNode, symbolNode.text);
        
        const changes: TextChange[] = references.map(ref => ({
            range: {
                start: { line: ref.startPosition.row, column: ref.startPosition.column },
                end: { line: ref.endPosition.row, column: ref.endPosition.column }
            },
            newText: newName,
            type: 'replace'
        }));
        
        return {
            type: RefactoringType.RENAME_SYMBOL,
            description: `Rename '${symbolNode.text}' to '${newName}'`,
            location: symbolLocation,
            changes,
            validation: await this.validateRefactoring(code, changes)
        };
    }

    async removeDeadCode(code: string): Promise<RefactoringOperation> {
        const tree = this.parser.parse(code);
        const deadCodeNodes = this.findDeadCode(tree.rootNode);
        
        const changes: TextChange[] = deadCodeNodes.map(node => ({
            range: {
                start: { line: node.startPosition.row, column: node.startPosition.column },
                end: { line: node.endPosition.row, column: node.endPosition.column }
            },
            newText: '',
            type: 'delete'
        }));
        
        return {
            type: RefactoringType.REMOVE_DEAD_CODE,
            description: `Remove ${deadCodeNodes.length} dead code blocks`,
            location: { line: 0, column: 0 },
            changes,
            validation: await this.validateRefactoring(code, changes)
        };
    }

    private async validateRefactoring(
        originalCode: string,
        changes: TextChange[]
    ): Promise<ValidationResult> {
        const modifiedCode = this.applyChanges(originalCode, changes);
        
        try {
            const newTree = this.parser.parse(modifiedCode);
            const errors = this.findSyntaxErrors(newTree);
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings: [],
                suggestions: []
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message],
                warnings: [],
                suggestions: ['Review the refactoring manually']
            };
        }
    }
}
```

#### Task 4.2: Integration with Popular Development Tools

##### 4.2.a: GitHub Actions and CI/CD Integration

**Implementation Timeline**: 2-3 weeks
**Difficulty**: Medium

```yaml
# .github/workflows/openscad-analysis.yml
name: OpenSCAD Code Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install OpenSCAD Tree-sitter
      run: npm install openscad-tree-sitter
    
    - name: Analyze OpenSCAD files
      run: |
        node scripts/analyze-openscad.js
    
    - name: Generate complexity report
      run: |
        node scripts/complexity-report.js > complexity-report.md
    
    - name: Upload complexity report
      uses: actions/upload-artifact@v3
      with:
        name: complexity-report
        path: complexity-report.md
    
    - name: Comment PR with analysis
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const report = fs.readFileSync('complexity-report.md', 'utf8');
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## OpenSCAD Code Analysis Report\n\n${report}`
          });
```

```javascript
// scripts/analyze-openscad.js
const Parser = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function analyzeProject() {
    // Initialize parser
    await Parser.init();
    const parser = new Parser();
    const language = await Parser.Language.load('tree-sitter-openscad.wasm');
    parser.setLanguage(language);
    
    // Find all OpenSCAD files
    const files = glob.sync('**/*.scad', { ignore: 'node_modules/**' });
    
    let totalLines = 0;
    let totalModules = 0;
    let totalFunctions = 0;
    let errors = [];
    
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const tree = parser.parse(content);
        
        // Count metrics
        const metrics = analyzeFile(tree, file);
        totalLines += metrics.lines;
        totalModules += metrics.modules;
        totalFunctions += metrics.functions;
        errors.push(...metrics.errors);
    }
    
    // Output results
    console.log(`Analyzed ${files.length} OpenSCAD files`);
    console.log(`Total lines: ${totalLines}`);
    console.log(`Total modules: ${totalModules}`);
    console.log(`Total functions: ${totalFunctions}`);
    console.log(`Errors found: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(error => {
            console.log(`  ${error.file}:${error.line} - ${error.message}`);
        });
        process.exit(1);
    }
}

function analyzeFile(tree, filename) {
    const metrics = {
        lines: tree.rootNode.endPosition.row + 1,
        modules: 0,
        functions: 0,
        errors: []
    };
    
    function traverse(node) {
        if (node.type === 'module_definition') {
            metrics.modules++;
        } else if (node.type === 'function_definition') {
            metrics.functions++;
        } else if (node.type === 'ERROR') {
            metrics.errors.push({
                file: filename,
                line: node.startPosition.row + 1,
                message: 'Syntax error'
            });
        }
        
        for (const child of node.children) {
            traverse(child);
        }
    }
    
    traverse(tree.rootNode);
    return metrics;
}

analyzeProject().catch(console.error);
```

---

## 📅 Implementation Timeline and Milestones

### Phase 1: Foundation (Weeks 1-6)
- **Week 1-2**: Complete Priority 1 Task 1.1 (Advanced Query Files)
- **Week 3-4**: Complete Priority 1 Task 1.2 (LSP Implementation)  
- **Week 5-6**: Complete testing framework integration and basic performance optimization

**Milestone 1**: Core web tree-sitter integration functional with basic LSP support

### Phase 2: Editor Integration (Weeks 7-12)
- **Week 7-9**: Complete Priority 2 Task 2.1 (VS Code Extension)
- **Week 10-11**: Complete Priority 2 Task 2.2 (Syntax Highlighting)
- **Week 12**: Complete Priority 2 Task 2.3 (Code Formatting)

**Milestone 2**: Full VS Code extension with syntax highlighting and formatting

### Phase 3: Advanced Tools (Weeks 13-18)
- **Week 13-15**: Complete Priority 3 Task 3.1 (Build System Integration)
- **Week 16-17**: Complete Priority 3 Task 3.2 (Documentation Generation)
- **Week 18**: Complete Priority 3 Task 3.3 (Enhanced Testing)

**Milestone 3**: Complete development toolchain with documentation and testing

### Phase 4: Ecosystem Integration (Weeks 19-24)
- **Week 19-22**: Complete Priority 4 Task 4.1 (Advanced Analysis Tools)
- **Week 23-24**: Complete Priority 4 Task 4.2 (CI/CD Integration)

**Milestone 4**: Full ecosystem integration with advanced analysis capabilities

---

## 🎯 Success Criteria and KPIs

### Technical Metrics
- **Parse Performance**: <10ms for 1000-line files, <100ms for 10k-line files
- **Memory Usage**: <50MB typical, <200MB for large files
- **Error Rate**: <0.1% for valid OpenSCAD syntax
- **Browser Compatibility**: >95% success across Chrome, Firefox, Safari, Edge
- **VS Code Extension**: >4.0 rating with >10k downloads in first 6 months

### Quality Metrics  
- **Test Coverage**: >90% code coverage across all packages
- **Documentation Coverage**: >95% of public APIs documented
- **Performance Regression**: <5% performance degradation per release
- **Bug Reports**: <10 critical bugs per month after stable release

### Adoption Metrics
- **Community Engagement**: >100 GitHub stars in first 3 months
- **Developer Adoption**: >50 projects using the parser in first 6 months  
- **Contribution**: >10 external contributors in first year
- **Integration**: Used in >3 major OpenSCAD-related projects

---

## 🔚 Conclusion

This comprehensive strategic development roadmap provides a clear path for evolving the OpenSCAD Tree-sitter Grammar project from its current foundation into a robust, production-ready ecosystem that serves the entire OpenSCAD development community.

The plan emphasizes incremental development, thorough testing, and community-driven enhancement while maintaining high performance and reliability standards. By following this roadmap, the project will establish itself as the definitive parsing solution for OpenSCAD, enabling advanced development tools and improving the overall developer experience in the OpenSCAD ecosystem.

**Key Success Factors:**
1. **Iterative Development**: Short cycles with frequent validation
2. **Performance Focus**: Continuous monitoring and optimization  
3. **Community Engagement**: Regular feedback and contribution opportunities
4. **Quality Assurance**: Comprehensive testing at every stage
5. **Documentation Excellence**: Clear, comprehensive, and up-to-date documentation

The roadmap is designed to be adaptable, allowing for priority adjustments based on community feedback and emerging requirements while maintaining the core vision of creating the most comprehensive and reliable OpenSCAD parsing solution available.
