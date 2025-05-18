import { TreeSitterNode, SyntaxTree, TreeCursor } from '../../../types';

/**
 * Creates a test tree with proper cursor navigation simulation
 * This is a helper for testing cursor-based traversal without requiring
 * an actual tree-sitter parser instance
 * 
 * @returns A test syntax tree with cursor functionality
 */
export function createTestTree(): SyntaxTree {
  // Create a tracker for cursor cleanup
  const cursorDeleteCalled = { value: false };
  
  // Create the test nodes
  const moduleNode = createModuleNode();
  const callNode = createCallNode();
  
  // Create the root node with children
  const rootNode = {
    type: 'program',
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 30 },
    text: 'module test() {} test();',
    isNamed: true,
    childCount: 2,
    namedChildCount: 2,
    children: [moduleNode, callNode],
    namedChildren: [moduleNode, callNode],
    child: (index: number) => (index === 0 ? moduleNode : index === 1 ? callNode : null),
    namedChild: (index: number) => (index === 0 ? moduleNode : index === 1 ? callNode : null),
    firstChild: moduleNode,
    lastChild: callNode,
    firstNamedChild: moduleNode,
    lastNamedChild: callNode,
    toString: () => 'program'
  } as unknown as TreeSitterNode;
  
  // Create a proper cursor implementation
  class TestCursor implements TreeCursor {
    nodeType: string;
    nodeIsNamed: boolean;
    nodeIsMissing: boolean;
    nodeId: number;
    nodeStartPosition: { row: number; column: number };
    nodeEndPosition: { row: number; column: number };
    nodeStartIndex: number;
    nodeEndIndex: number;
    
    // Current node being visited
    private currentNodeVal: TreeSitterNode;
    
    constructor(node: TreeSitterNode) {
      this.nodeType = node.type;
      this.nodeIsNamed = node.isNamed;
      this.nodeIsMissing = false;
      this.nodeId = 1;
      this.nodeStartPosition = node.startPosition;
      this.nodeEndPosition = node.endPosition;
      this.nodeStartIndex = 0;
      this.nodeEndIndex = node.text.length;
      this.currentNodeVal = node;
    }
    
    currentNode(): TreeSitterNode {
      return this.currentNodeVal;
    }
    
    currentFieldName(): string | null {
      return null;
    }
    
    gotoFirstChild(): boolean {
      if (this.currentNodeVal.childCount > 0) {
        const firstChild = this.currentNodeVal.child(0);
        if (firstChild) {
          // Debug log for cursor navigation
          console.log(`Cursor navigating to first child: ${firstChild.type}`);
          
          this.currentNodeVal = firstChild;
          this.nodeType = firstChild.type;
          this.nodeIsNamed = firstChild.isNamed;
          this.nodeStartPosition = firstChild.startPosition;
          this.nodeEndPosition = firstChild.endPosition;
          return true;
        }
      }
      return false;
    }
    
    gotoLastChild(): boolean {
      if (this.currentNodeVal.childCount > 0) {
        const lastChild = this.currentNodeVal.child(this.currentNodeVal.childCount - 1);
        if (lastChild) {
          this.currentNodeVal = lastChild;
          this.nodeType = lastChild.type;
          this.nodeIsNamed = lastChild.isNamed;
          this.nodeStartPosition = lastChild.startPosition;
          this.nodeEndPosition = lastChild.endPosition;
          return true;
        }
      }
      return false;
    }
    
    gotoNextSibling(): boolean {
      if (this.currentNodeVal === moduleNode) {
        // Debug log for cursor navigation
        console.log(`Cursor navigating to next sibling: ${callNode.type}`);
        
        this.currentNodeVal = callNode;
        this.nodeType = callNode.type;
        this.nodeIsNamed = callNode.isNamed;
        this.nodeStartPosition = callNode.startPosition;
        this.nodeEndPosition = callNode.endPosition;
        return true;
      }
      return false;
    }
    
    gotoPreviousSibling(): boolean {
      if (this.currentNodeVal === callNode) {
        this.currentNodeVal = moduleNode;
        this.nodeType = moduleNode.type;
        this.nodeIsNamed = moduleNode.isNamed;
        this.nodeStartPosition = moduleNode.startPosition;
        this.nodeEndPosition = moduleNode.endPosition;
        return true;
      }
      return false;
    }
    
    gotoParent(): boolean {
      if (this.currentNodeVal !== rootNode) {
        this.currentNodeVal = rootNode;
        this.nodeType = rootNode.type;
        this.nodeIsNamed = rootNode.isNamed;
        this.nodeStartPosition = rootNode.startPosition;
        this.nodeEndPosition = rootNode.endPosition;
        return true;
      }
      return false;
    }
    
    gotoFirstChildForIndex(index: number): boolean {
      // Not implemented for testing
      return false;
    }
    
    gotoFirstChildForPosition(position: { row: number; column: number }): boolean {
      // Not implemented for testing
      return false;
    }
    
    reset(node: TreeSitterNode): void {
      this.currentNodeVal = node;
      this.nodeType = node.type;
      this.nodeIsNamed = node.isNamed;
      this.nodeStartPosition = node.startPosition;
      this.nodeEndPosition = node.endPosition;
    }
    
    // Add custom delete method for testing cleanup
    delete(): void {
      cursorDeleteCalled.value = true;
    }
  }
  
  return {
    rootNode,
    walk: () => new TestCursor(rootNode),
    getChangedRanges: () => [],
    getEditedRange: () => ({ 
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 0 },
      startIndex: 0,
      endIndex: 0
    }),
    getLanguage: () => ({}),
    cursorDeleteCalled
  } as SyntaxTree & { cursorDeleteCalled: { value: boolean } };
}

/**
 * Creates a test module node
 */
function createModuleNode(): TreeSitterNode {
  const nameNode = {
    type: 'identifier',
    startPosition: { row: 0, column: 7 },
    endPosition: { row: 0, column: 11 },
    text: 'test',
    isNamed: true,
    childCount: 0,
    namedChildCount: 0,
    children: [],
    namedChildren: [],
    child: () => null,
    namedChild: () => null,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    toString: () => 'identifier'
  } as unknown as TreeSitterNode;
  
  const paramsNode = {
    type: 'parameter_list',
    startPosition: { row: 0, column: 11 },
    endPosition: { row: 0, column: 13 },
    text: '()',
    isNamed: true,
    childCount: 0,
    namedChildCount: 0,
    children: [],
    namedChildren: [],
    child: () => null,
    namedChild: () => null,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    toString: () => 'parameter_list'
  } as unknown as TreeSitterNode;
  
  const blockNode = {
    type: 'block',
    startPosition: { row: 0, column: 14 },
    endPosition: { row: 0, column: 16 },
    text: '{}',
    isNamed: true,
    childCount: 0,
    namedChildCount: 0,
    children: [],
    namedChildren: [],
    child: () => null,
    namedChild: () => null,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    toString: () => 'block'
  } as unknown as TreeSitterNode;
  
  return {
    type: 'module_declaration',
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 16 },
    text: 'module test() {}',
    isNamed: true,
    childCount: 3,
    namedChildCount: 3,
    children: [nameNode, paramsNode, blockNode],
    namedChildren: [nameNode, paramsNode, blockNode],
    child: (index: number) => {
      if (index === 0) return nameNode;
      if (index === 1) return paramsNode;
      if (index === 2) return blockNode;
      return null;
    },
    namedChild: (index: number) => {
      if (index === 0) return nameNode;
      if (index === 1) return paramsNode;
      if (index === 2) return blockNode;
      return null;
    },
    firstChild: nameNode,
    lastChild: blockNode,
    firstNamedChild: nameNode,
    lastNamedChild: blockNode,
    toString: () => 'module_declaration'
  } as unknown as TreeSitterNode;
}

/**
 * Creates a test call node
 */
function createCallNode(): TreeSitterNode {
  const nameNode = {
    type: 'identifier',
    startPosition: { row: 0, column: 17 },
    endPosition: { row: 0, column: 21 },
    text: 'test',
    isNamed: true,
    childCount: 0,
    namedChildCount: 0,
    children: [],
    namedChildren: [],
    child: () => null,
    namedChild: () => null,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    toString: () => 'identifier'
  } as unknown as TreeSitterNode;
  
  const argsNode = {
    type: 'argument_list',
    startPosition: { row: 0, column: 21 },
    endPosition: { row: 0, column: 23 },
    text: '()',
    isNamed: true,
    childCount: 0,
    namedChildCount: 0,
    children: [],
    namedChildren: [],
    child: () => null,
    namedChild: () => null,
    firstChild: null,
    lastChild: null,
    firstNamedChild: null,
    lastNamedChild: null,
    toString: () => 'argument_list'
  } as unknown as TreeSitterNode;
  
  return {
    type: 'call_expression',
    startPosition: { row: 0, column: 17 },
    endPosition: { row: 0, column: 23 },
    text: 'test()',
    isNamed: true,
    childCount: 2,
    namedChildCount: 2,
    children: [nameNode, argsNode],
    namedChildren: [nameNode, argsNode],
    child: (index: number) => {
      if (index === 0) return nameNode;
      if (index === 1) return argsNode;
      return null;
    },
    namedChild: (index: number) => {
      if (index === 0) return nameNode;
      if (index === 1) return argsNode;
      return null;
    },
    firstChild: nameNode,
    lastChild: argsNode,
    firstNamedChild: nameNode,
    lastNamedChild: argsNode,
    toString: () => 'call_expression'
  } as unknown as TreeSitterNode;
}
