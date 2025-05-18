import { TreeSitterNode, SyntaxTree, TreeCursor } from '../../types/cst-types';
import { ASTNode } from '../../types/ast-types';
import { 
  createNodeAdapter, 
  NodeAdapterMap, 
  NodeAdapter,
  NodeAdapterWithRecursion, 
  NodeAdapterSimple 
} from './adapter-factory/adapter-factory';
import { createCursorAdapter } from './cursor-adapter/cursor-adapter-factory';

// No need to import node adapters as we're using cursor-based adapters only

// Import the cursor-based adapters
import { blockStatementCursorAdapter } from './node-adapters/block-statement-adapter';
import { binaryExpressionCursorAdapter } from './node-adapters/binary-expression-adapter';

// Import OpenSCAD-specific adapters
// 2D primitives
import { circleCursorAdapter } from './node-adapters/circle-adapter';
import { squareCursorAdapter } from './node-adapters/square-adapter';
import { polygonCursorAdapter } from './node-adapters/polygon-adapter/polygon-cursor-adapter';

// 3D primitives
import { cubeCursorAdapter } from './node-adapters/cube-adapter';
import { sphereCursorAdapter } from './node-adapters/sphere-adapter';
import { cylinderCursorAdapter } from './node-adapters/cylinder-adapter';

// Transformations
import { translateCursorAdapter } from './node-adapters/translate-adapter';
import { rotateTransformCursorAdapter } from './node-adapters/rotate-adapter';
import { scaleCursorAdapter } from './node-adapters/scale-adapter/scale-cursor-adapter';
import { linearExtrudeCursorAdapter } from './node-adapters/linear-extrude-adapter';

// Operations
import { unionCursorAdapter } from './node-adapters/union-adapter';
import { differenceCursorAdapter } from './node-adapters/difference-adapter';
import { intersectionCursorAdapter } from './node-adapters/intersection-adapter';

// Control flow
import { ifStatementCursorAdapter } from './node-adapters/if-statement-adapter';
import { forLoopCursorAdapter } from './node-adapters/for-loop-adapter/for-loop-cursor-adapter';

// Variables and expressions
import { assignmentCursorAdapter as assignmentAdapter } from './node-adapters/assignment-adapter';

/**
 * Map of AST node types to their adapter functions is not needed as
 * we're using cursor-based adapters exclusively
 */

// We've eliminated the node-based adapters in favor of cursor-based adapters only
// This simplifies the codebase and eliminates duplication

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
  // Core language adapters
  'ModuleDeclaration': moduleDeclarationCursorAdapter,
  'BlockStatement': blockStatementCursorAdapter,
  'block': blockStatementCursorAdapter, // Support for direct block nodes from the parser
  'BinaryExpression': binaryExpressionCursorAdapter,
  'binary_expression': binaryExpressionCursorAdapter, // Support for direct binary expression nodes from the parser
  
  // OpenSCAD-specific adapters
  
  // 2D Primitives
  'circle': circleCursorAdapter, // Circle primitive
  'square': squareCursorAdapter, // Square primitive
  'polygon': polygonCursorAdapter, // Polygon primitive
  
  // 3D Primitives
  'cube': cubeCursorAdapter, // Cube primitive
  'sphere': sphereCursorAdapter, // Sphere primitive
  'cylinder': cylinderCursorAdapter, // Cylinder primitive
  
  // Transformations
  'transform_statement': (cursor: TreeCursor) => {
    const node = cursor.currentNode();
    if (node.childCount > 0) {
      const transformType = node.child(0);
      if (transformType && transformType.type === 'identifier') {
        const transformName = transformType.text;
        switch (transformName) {
          case 'translate':
            return translateCursorAdapter(cursor);
          case 'rotate':
            return rotateTransformCursorAdapter(cursor);
          case 'scale':
            return scaleCursorAdapter(cursor);
          case 'linear_extrude':
            return linearExtrudeCursorAdapter(cursor);
          // Additional transformations can be added here
          default:
            break;
        }
      }
    }
    throw new Error(`Unknown transform type: ${node.text}`);
  },
  
  // Operations
  'operation_statement': (cursor: TreeCursor) => {
    const node = cursor.currentNode();
    if (node.childCount > 0) {
      const operationType = node.child(0);
      if (operationType && operationType.type === 'identifier') {
        switch (operationType.text) {
          case 'union':
            return unionCursorAdapter(cursor);
          case 'difference':
            return differenceCursorAdapter(cursor);
          case 'intersection':
            return intersectionCursorAdapter(cursor);
          // Additional operations can be added here
          default:
            break;
        }
      }
    }
    throw new Error(`Unknown operation type: ${node.text}`);
  },
  
  // Control Flow
  'if_statement': ifStatementCursorAdapter,
  'for_statement': forLoopCursorAdapter,
  
  // Variables and expressions
  'assignment': assignmentAdapter,
  
  // Fallback for unknown node types
  'Unknown': (cursor: TreeCursor): ASTNode => {
    const node = cursor.currentNode();
    return {
      type: 'Unknown',
      position: {
        startLine: cursor.nodeStartPosition.row,
        startColumn: cursor.nodeStartPosition.column,
        endLine: cursor.nodeEndPosition.row,
        endColumn: cursor.nodeEndPosition.column
      }
    };
  }
};

/**
 * Adapts a CST (Concrete Syntax Tree) to an AST (Abstract Syntax Tree)
 *
 * @param node The CST node to adapt, either a TreeSitterNode or a SyntaxTree
 * @returns The resulting AST node
 */
export function adaptCstToAst(node: TreeSitterNode | SyntaxTree): ASTNode {
  // Always use the cursor-based approach for efficiency and consistency
  const adaptTree = createCursorAdapter(cursorAdapterMap);
  
  // If a syntax tree is provided, use it directly
  if ('rootNode' in node && 'walk' in node) {
    return adaptTree(node);
  }
  
  // For nodes without cursor functionality (e.g. in tests),
  // create a lightweight syntax tree wrapper to use the cursor adapter
  const tsNode = node as TreeSitterNode;
  const tempTree = {
    rootNode: tsNode,
    walk: () => ({
      nodeType: tsNode.type,
      nodeIsNamed: tsNode.isNamed,
      nodeIsMissing: tsNode.isMissing || false,
      nodeId: 0,
      nodeStartPosition: tsNode.startPosition,
      nodeEndPosition: tsNode.endPosition,
      nodeStartIndex: 0,
      nodeEndIndex: 0,
      currentNode: () => tsNode,
      currentFieldName: () => null,
      gotoFirstChild: () => false,
      gotoLastChild: () => false,
      gotoNextSibling: () => false,
      gotoPreviousSibling: () => false,
      gotoParent: () => false,
      gotoFirstChildForIndex: () => false,
      gotoFirstChildForPosition: () => false,
      reset: () => {}
    }),
    getChangedRanges: () => [],
    getEditedRange: () => ({
      startPosition: tsNode.startPosition,
      endPosition: tsNode.endPosition,
      startIndex: 0,
      endIndex: 0
    }),
    getLanguage: () => ({})
  } as SyntaxTree;
  
  return adaptTree(tempTree);
}
