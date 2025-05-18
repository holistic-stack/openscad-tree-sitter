/**
 * Tree-sitter CST node interface
 * Based on the web-tree-sitter API
 */
export interface TreeSitterNode {
  id: number;
  tree: any;
  type: string;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  text: string;
  isNamed: boolean;
  hasError: boolean;
  hasChanges: boolean;
  isMissing: boolean;
  parent: TreeSitterNode | null;
  children: TreeSitterNode[];
  namedChildren: TreeSitterNode[];
  childCount: number;
  namedChildCount: number;
  firstChild: TreeSitterNode | null;
  lastChild: TreeSitterNode | null;
  firstNamedChild: TreeSitterNode | null;
  lastNamedChild: TreeSitterNode | null;
  nextSibling: TreeSitterNode | null;
  previousSibling: TreeSitterNode | null;
  nextNamedSibling: TreeSitterNode | null;
  previousNamedSibling: TreeSitterNode | null;

  // Helper methods
  child(index: number): TreeSitterNode | null;
  namedChild(index: number): TreeSitterNode | null;
  childForFieldName(fieldName: string): TreeSitterNode | null;
  childrenForFieldName(fieldName: string): TreeSitterNode[];
  descendantsOfType(type: string | string[], startPosition?: Point, endPosition?: Point): TreeSitterNode[];
  toString(): string;
}

/**
 * Position point in a source file
 */
export interface Point {
  row: number;
  column: number;
}

/**
 * Tree-sitter query match
 */
export interface QueryMatch {
  pattern: number;
  captures: QueryCapture[];
  startIndex: number;
  endIndex: number;
}

/**
 * Tree-sitter query capture
 */
export interface QueryCapture {
  name: string;
  node: TreeSitterNode;
}

/**
 * Tree-sitter syntax tree
 */
export interface SyntaxTree {
  rootNode: TreeSitterNode;
  getChangedRanges(previousTree: SyntaxTree): Range[];
  getEditedRange(previousTree: SyntaxTree): Range;
  getLanguage(): any;
  walk(): TreeCursor;
}

/**
 * Tree-sitter tree cursor
 */
export interface TreeCursor {
  nodeType: string;
  nodeIsNamed: boolean;
  nodeIsMissing: boolean;
  nodeId: number;
  nodeStartPosition: Point;
  nodeEndPosition: Point;
  nodeStartIndex: number;
  nodeEndIndex: number;
  currentNode(): TreeSitterNode;
  currentFieldName(): string | null;
  gotoFirstChild(): boolean;
  gotoLastChild(): boolean;
  gotoNextSibling(): boolean;
  gotoPreviousSibling(): boolean;
  gotoParent(): boolean;
  gotoFirstChildForIndex(index: number): boolean;
  gotoFirstChildForPosition(position: Point): boolean;
  reset(node: TreeSitterNode): void;
}

/**
 * Tree-sitter range
 */
export interface Range {
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
}
