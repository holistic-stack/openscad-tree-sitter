export { default as OpenscadEditor } from './lib/openscad-editor'; // Original Tree-sitter version
export { default as OpenscadEditorV2 } from './lib/openscad-editor-v2'; // Working Monarch-based version
export { OpenscadEditorAST } from './lib/openscad-editor-ast'; // AST-enabled version with error detection
export { OpenscadOutline } from './lib/components/openscad-outline'; // Document outline component
export { FormattingConfig } from './lib/formatting/formatting-config'; // Formatting configuration component
export { default } from './lib/openscad-editor-v2'; // Default export is the working version
export * from './lib/openscad-language'; // Language configuration utilities
export * from './lib/formatting'; // Formatting functionality
export type { ParseResult, OutlineItem, HoverInfo, ParseError, DocumentSymbol } from './lib/services/openscad-parser-service'; // AST parser service types
