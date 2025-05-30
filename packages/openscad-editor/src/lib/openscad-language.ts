import * as monaco from 'monaco-editor';
import { OpenSCADParserService } from './services/openscad-parser-service';
import { FormattingService, registerFormattingProvider } from './formatting/formatting-service';

export interface OpenSCADLanguageConfig {
  comments?: {
    lineComment?: string;
    blockComment?: [string, string];
  };
  brackets?: [string, string][];
  autoClosingPairs?: { open: string; close: string }[];
  surroundingPairs?: { open: string; close: string }[];
}

export interface OpenSCADTokensDefinition {
  defaultToken: string;
  tokenPostfix: string;
  keywords: string[];
  builtinFunctions: string[];
  builtinModules: string[];
  builtinConstants: string[];
  operators: string[];
  symbols: RegExp;
  escapes: RegExp;
  tokenizer: {
    [key: string]: monaco.languages.IMonarchLanguageRule[];
  };
}

/**
 * Language configuration for OpenSCAD
 */
export const openscadLanguageConfig: OpenSCADLanguageConfig = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '/*', close: '*/' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' }
  ]
};

/**
 * Tokens definition for OpenSCAD syntax highlighting
 */
export const openscadTokensDefinition: OpenSCADTokensDefinition = {
  defaultToken: '',
  tokenPostfix: '.openscad',

  keywords: [
    'module', 'function', 'if', 'else', 'for', 'while', 'let', 'assert',
    'echo', 'each', 'true', 'false', 'undef', 'include', 'use'
  ],

  builtinFunctions: [
    'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'cross', 'exp',
    'floor', 'len', 'ln', 'log', 'lookup', 'max', 'min', 'norm', 'pow',
    'rands', 'round', 'sign', 'sin', 'sqrt', 'tan', 'str', 'chr', 'ord',
    'concat', 'search', 'version', 'version_num', 'parent_module'
  ],

  builtinModules: [
    'cube', 'sphere', 'cylinder', 'polyhedron', 'square', 'circle', 'polygon',
    'text', 'linear_extrude', 'rotate_extrude', 'scale', 'resize', 'rotate',
    'translate', 'mirror', 'multmatrix', 'color', 'offset', 'hull', 'minkowski',
    'union', 'difference', 'intersection', 'render', 'surface', 'projection'
  ],

  builtinConstants: [
    '$fa', '$fs', '$fn', '$t', '$vpt', '$vpr', '$vpd', '$vpf',
    '$children', '$preview', '$OPENSCAD_VERSION'
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],

  // Regular expression for symbol recognition
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Regular expression for escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for syntax highlighting
  tokenizer: {
    root: [
      // Identifiers and keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtinFunctions': 'predefined',
          '@builtinModules': 'type',
          '@builtinConstants': 'constant',
          '@default': 'identifier'
        }
      }],
      [/[A-Z][\w\$]*/, 'type.identifier'], // To show class names nicely

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // Characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid']
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'], // Nested comment
      ["\\*/", 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  }
};

/**
 * Theme definition for OpenSCAD syntax highlighting
 */
export const openscadTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
    { token: 'predefined', foreground: 'dcdcaa' },
    { token: 'type', foreground: '4ec9b0', fontStyle: 'bold' },
    { token: 'constant', foreground: '9cdcfe' },
    { token: 'identifier', foreground: 'd4d4d4' },
    { token: 'type.identifier', foreground: '4ec9b0' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'number.float', foreground: 'b5cea8' },
    { token: 'number.hex', foreground: 'b5cea8' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'string.quote', foreground: 'ce9178' },
    { token: 'string.escape', foreground: 'd7ba7d' },
    { token: 'string.invalid', foreground: 'f44747' },
    { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
    { token: 'operator', foreground: 'd4d4d4' },
    { token: 'delimiter', foreground: 'd4d4d4' },
    { token: 'white', foreground: 'd4d4d4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editorCursor.foreground': '#aeafad',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#3a3d41',
  }
};

/**
 * Register OpenSCAD language with Monaco Editor
 */
export function registerOpenSCADLanguage(
  monaco: typeof import('monaco-editor'),
  parserService?: OpenSCADParserService
): { disposables: monaco.IDisposable[]; formattingService?: FormattingService } {
  const LANGUAGE_ID = 'openscad';
  const disposables: monaco.IDisposable[] = [];

  // Register the language
  monaco.languages.register({ id: LANGUAGE_ID });

  // Set the language configuration
  monaco.languages.setLanguageConfiguration(LANGUAGE_ID, openscadLanguageConfig);

  // Set the tokens provider using Monarch tokenizer
  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, openscadTokensDefinition);

  // Define and set the theme
  monaco.editor.defineTheme('openscad-dark', openscadTheme);

  // Register formatting provider if parser service is available
  let formattingService: FormattingService | undefined;
  if (parserService) {
    formattingService = new FormattingService(parserService);
    const formattingDisposables = registerFormattingProvider(monaco, LANGUAGE_ID, formattingService);
    disposables.push(...formattingDisposables);
  }

  const result: { disposables: monaco.IDisposable[]; formattingService?: FormattingService } = {
    disposables
  };
  
  if (formattingService) {
    result.formattingService = formattingService;
  }
  
  return result;
}