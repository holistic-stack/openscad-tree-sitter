import { TreeSitterNode, SyntaxTree, ASTNode } from '../../types';
import { 
  createNodeAdapter, 
  NodeAdapterMap, 
  NodeAdapter,
  NodeAdapterWithRecursion, 
  NodeAdapterSimple 
} from './adapter-factory/adapter-factory';
import { createCursorAdapter } from './cursor-adapter/cursor-adapter-factory';
import { TreeCursor } from '../../types';

// Import the existing node adapters
import { 
  adaptProgram, 
  adaptCallExpression, 
  adaptIdentifier, 
  adaptLiteral, 
  adaptAssignment 
} from './node-adapters';

// Import the cursor-based adapters
import { blockStatementCursorAdapter } from './node-adapters/block-statement-adapter';
import { binaryExpressionCursorAdapter } from './node-adapters/binary-expression-adapter';

/**
 * Map of AST node types to their adapter functions
 */
const adapterMap: NodeAdapterMap = {
  'Program': adaptProgram,
  'CallExpression': adaptCallExpression,
  'IdentifierExpression': adaptIdentifier,
  'LiteralExpression': adaptLiteral,
  'AssignmentStatement': adaptAssignment,
};

// Create cursor-based versions of the existing adapters
// These adapters wrap the node-based adapters to work with the cursor API
// while maintaining the same adaptation logic
const createCursorBasedAdapter = (nodeAdapter: NodeAdapter) => {
  return (cursor: TreeCursor) => {
    // Get the current node from the cursor
    const node = cursor.currentNode();
    
    // Create a node adapter function that can be called recursively
    const adaptNode = createNodeAdapter(adapterMap);
    
    // Apply the original node adapter with the node and recursive adapter
    if (nodeAdapter.length === 2) {
      return (nodeAdapter as NodeAdapterWithRecursion)(node, adaptNode);
    } else {
      return (nodeAdapter as NodeAdapterSimple)(node);
    }
  };
};

// Create cursor-based versions of each adapter
const programCursorAdapter = createCursorBasedAdapter(adaptProgram);
const callExpressionCursorAdapter = createCursorBasedAdapter(adaptCallExpression);
const identifierCursorAdapter = createCursorBasedAdapter(adaptIdentifier);
const literalCursorAdapter = createCursorBasedAdapter(adaptLiteral);
const assignmentCursorAdapter = createCursorBasedAdapter(adaptAssignment);

// Add a basic module declaration adapter for testing
const moduleDeclarationCursorAdapter = (cursor: TreeCursor) => {
  const node = cursor.currentNode();
  
  // Extract the module name from the first child (identifier)
  let name = 'unnamed_module';
  const nameNode = node.namedChild?.(0);
  if (nameNode && nameNode.type === 'identifier') {
    name = nameNode.text;
  }
  
  // Create a basic block statement for the module body
  const blockStatement = {
    type: 'BlockStatement',
    position: {
      startLine: cursor.nodeStartPosition.row,
      startColumn: cursor.nodeStartPosition.column,
      endLine: cursor.nodeEndPosition.row,
      endColumn: cursor.nodeEndPosition.column
    },
    statements: []
  };
  
  return {
    type: 'ModuleDeclaration',
    name,
    parameters: [],
    body: blockStatement,
    position: {
      startLine: cursor.nodeStartPosition.row,
      startColumn: cursor.nodeStartPosition.column,
      endLine: cursor.nodeEndPosition.row,
      endColumn: cursor.nodeEndPosition.column
    }
  };
};

// Create a map of cursor-based adapters for each node type
const cursorAdapterMap = {
  'Program': programCursorAdapter,
  'ModuleDeclaration': moduleDeclarationCursorAdapter,
  'BlockStatement': blockStatementCursorAdapter,
  'block': blockStatementCursorAdapter, // Support for direct block nodes from the parser
  'BinaryExpression': binaryExpressionCursorAdapter,
  'binary_expression': binaryExpressionCursorAdapter, // Support for direct binary expression nodes from the parser
  'CallExpression': callExpressionCursorAdapter,
  'IdentifierExpression': identifierCursorAdapter,
  'LiteralExpression': literalCursorAdapter,
  'AssignmentStatement': assignmentCursorAdapter,
};

/**
 * Adapt a Tree-sitter CST to an OpenSCAD AST
 * This improved implementation uses tree-sitter cursors for more efficient
 * traversal and better memory management
 * 
 * @param node The Tree-sitter CST node or syntax tree
 * @returns The OpenSCAD AST node
 */
export function adaptCstToAst(node: TreeSitterNode | SyntaxTree): ASTNode {
  // If a syntax tree is provided, use cursor-based approach for efficiency
  if ('rootNode' in node && 'walk' in node) {
    const adaptTree = createCursorAdapter(cursorAdapterMap);
    return adaptTree(node);
  }
  
  // Fallback to original implementation for backward compatibility
  // but create a temporary syntax tree to use cursor approach
  const tempTree = {
    rootNode: node,
    walk: () => {
      // Create a basic cursor that just points to the node
      return {
        nodeType: node.type,
        nodeIsNamed: node.isNamed,
        nodeIsMissing: node.isMissing || false,
        nodeId: node.id || 0,
        nodeStartPosition: node.startPosition,
        nodeEndPosition: node.endPosition,
        nodeStartIndex: node.startIndex || 0,
        nodeEndIndex: node.endIndex || 0,
        currentNode: () => node,
        currentFieldName: () => null,
        gotoFirstChild: () => false,
        gotoLastChild: () => false,
        gotoNextSibling: () => false,
        gotoPreviousSibling: () => false,
        gotoParent: () => false,
        gotoFirstChildForIndex: () => false,
        gotoFirstChildForPosition: () => false,
        reset: () => {}
      };
    },
    getChangedRanges: () => [],
    getEditedRange: () => ({ 
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      startIndex: node.startIndex || 0,
      endIndex: node.endIndex || 0
    }),
    getLanguage: () => ({})
  } as SyntaxTree;
  
  const adaptTree = createCursorAdapter(cursorAdapterMap);
  return adaptTree(tempTree);
}
