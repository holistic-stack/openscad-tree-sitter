/**
 * @file types.ts
 * @description TypeScript type definitions for Tree-sitter components
 */

// Tree-sitter Parser types
export interface Parser {
  parse(input: string | (() => string), oldTree?: Tree): Tree;
  getLanguage(): Language;
  setLanguage(language: Language): void;
  getLogger(): Logger;
  setLogger(logger: Logger): void;
}

// Tree-sitter Tree types
export interface Tree {
  rootNode: SyntaxNode;
  copy(): Tree;
  edit(edit: Edit): void;
  walk(): TreeCursor;
  getLanguage(): Language;
  getChangedRanges(oldTree: Tree): Range[];
  delete(): void;
}

// Tree-sitter SyntaxNode types
export interface SyntaxNode {
  type: string;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  text: string;
  parent: SyntaxNode | null;
  children: SyntaxNode[];
  namedChildren: SyntaxNode[];
  childCount: number;
  namedChildCount: number;
  firstChild: SyntaxNode | null;
  firstNamedChild: SyntaxNode | null;
  lastChild: SyntaxNode | null;
  lastNamedChild: SyntaxNode | null;
  nextSibling: SyntaxNode | null;
  nextNamedSibling: SyntaxNode | null;
  previousSibling: SyntaxNode | null;
  previousNamedSibling: SyntaxNode | null;
  hasChanges(): boolean;
  hasError(): boolean;
  isMissing(): boolean;
  toString(): string;
  child(index: number): SyntaxNode | null;
  namedChild(index: number): SyntaxNode | null;
  childForFieldName(fieldName: string): SyntaxNode | null;
  childrenForFieldName(fieldName: string): SyntaxNode[];
  descendantsOfType(types: string | string[], startPosition?: Point, endPosition?: Point): SyntaxNode[];
  descendantForIndex(index: number): SyntaxNode | null;
  descendantForPosition(position: Point): SyntaxNode | null;
  namedDescendantForIndex(index: number): SyntaxNode | null;
  namedDescendantForPosition(position: Point): SyntaxNode | null;
  walk(): TreeCursor;
}

// Tree-sitter TreeCursor types
export interface TreeCursor {
  nodeType: string;
  nodeText: string;
  nodeIsNamed: boolean;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  currentNode(): SyntaxNode;
  currentFieldName(): string | null;
  gotoFirstChild(): boolean;
  gotoParent(): boolean;
  gotoNextSibling(): boolean;
  gotoPreviousSibling(): boolean;
  delete(): void;
}

// Tree-sitter Language types
export interface Language {
  version: number;
  fieldCount: number;
  nodeTypeCount: number;
  fieldNameForId(fieldId: number): string | null;
  fieldIdForName(fieldName: string): number | null;
  nodeTypeForId(typeId: number): string | null;
  nodeTypeIdForName(typeName: string): number | null;
  query(source: string): Query;
}

// Tree-sitter Query types
export interface Query {
  captureCount: number;
  patternCount: number;
  stringCount: number;
  captureNameForId(id: number): string;
  matches(node: SyntaxNode, startPosition?: Point, endPosition?: Point): QueryMatch[];
  captures(node: SyntaxNode, startPosition?: Point, endPosition?: Point): QueryCapture[];
  predicatesForPattern(patternIndex: number): QueryPredicate[];
  delete(): void;
}

export interface QueryMatch {
  pattern: number;
  captures: QueryCapture[];
}

export interface QueryCapture {
  name: string;
  node: SyntaxNode;
}

export interface QueryPredicate {
  operator: string;
  operands: { type: string; name: string }[];
}

// Tree-sitter Edit types
export interface Edit {
  startIndex: number;
  oldEndIndex: number;
  newEndIndex: number;
  startPosition: Point;
  oldEndPosition: Point;
  newEndPosition: Point;
}

// Tree-sitter Logger types
export interface Logger {
  (message: string): void;
}

// Tree-sitter Range types
export interface Range {
  startIndex: number;
  endIndex: number;
  startPosition: Point;
  endPosition: Point;
}

// Tree-sitter Point types
export interface Point {
  row: number;
  column: number;
}

// Test Adapter Pattern types
export interface TestAdapter<T> {
  parseCode(code: string): { tree: Tree; data: T };
  mockTestParse(code: string): boolean;
  mockHasErrors(node: SyntaxNode): boolean;
}

// List Comprehension Adapter types
export interface ListComprehensionResult {
  tree: Tree;
  listComps: SyntaxNode[];
  ifNodes?: SyntaxNode[];
}

// Object Literal Adapter types
export interface ObjectLiteralResult {
  tree: Tree;
  objects: SyntaxNode[];
}

// Range Expression Adapter types
export interface RangeExpressionResult {
  tree: Tree;
  ranges: SyntaxNode[];
}

// Module Instantiation Adapter types
export interface ModuleInstantiationResult {
  tree: Tree;
  modifiers: SyntaxNode[];
}

// Special Variable Adapter types
export interface SpecialVariableResult {
  tree: Tree;
  specialVars: SyntaxNode[];
}

// Nested Comment Adapter types
export interface NestedCommentResult {
  tree: Tree;
  comments: SyntaxNode[];
}

// Member Expression Adapter types
export interface MemberExpressionResult {
  tree: Tree;
  memberExpressions: SyntaxNode[];
}

// If-Else Chain Adapter types
export interface IfElseChainResult {
  tree: Tree;
  ifStatements: SyntaxNode[];
  elseIfCount: number;
} 