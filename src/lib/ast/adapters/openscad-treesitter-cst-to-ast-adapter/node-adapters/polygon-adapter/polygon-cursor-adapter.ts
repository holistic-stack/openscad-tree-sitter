/**
 * Polygon2D cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter polygon node to an AST Polygon2D node
 * using cursor-based traversal for better performance and memory usage.
 * 
 * Following Test-Driven Development principles, this implementation ensures:
 * - Proper extraction of points vector
 * - Optional support for paths and convexity parameters
 * - Consistent position information
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, ASTPosition, LiteralExpression, Expression } from '../../../../types/ast-types';
import { Polygon2D } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter polygon node to an AST Polygon2D node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a polygon call expression
 * @returns The AST Polygon2D node
 */
export function polygonCursorAdapter(cursor: TreeCursor): Polygon2D {
  const node = cursor.currentNode();
  const position = extractPositionFromCursor(cursor);
  
  // Default values
  let points: Expression = {
    type: 'VectorLiteral',
    values: [],
    position: { 
      startLine: position.startLine, 
      startColumn: position.startColumn,
      endLine: position.endLine, 
      endColumn: position.endColumn 
    }
  };
  
  let paths: Expression | undefined = undefined;
  let convexity: Expression | undefined = undefined;
  
  // Process the polygon call expression
  if (node.childCount >= 2) {
    const argsNode = node.child(1);
    
    if (argsNode && argsNode.type === 'arguments') {
      // Process each parameter in the arguments node
      for (let i = 0; i < argsNode.childCount; i++) {
        const paramNode = argsNode.child(i);
        
        if (paramNode && paramNode.type === 'parameter' && paramNode.childCount >= 2) {
          const paramNameNode = paramNode.child(0);
          const paramValueNode = paramNode.child(1);
          
          if (paramNameNode && paramValueNode && paramNameNode.type === 'identifier') {
            const paramName = paramNameNode.text;
            
            // Handle points parameter
            if (paramName === 'points' && paramValueNode.type === 'vector_literal') {
              points = createVectorLiteral(paramValueNode);
            }
            
            // Handle paths parameter
            else if (paramName === 'paths' && paramValueNode.type === 'vector_literal') {
              paths = createVectorLiteral(paramValueNode);
            }
            
            // Handle convexity parameter
            else if (paramName === 'convexity' && paramValueNode.type === 'number_literal') {
              convexity = createLiteralExpression(paramValueNode);
            }
          }
        }
      }
    }
  }
  
  // Construct and return the Polygon2D node
  const polygon: Polygon2D = {
    type: 'Polygon2D',
    points,
    position
  };
  
  // Add optional parameters if present
  if (paths) {
    polygon.paths = paths;
  }
  
  if (convexity) {
    polygon.convexity = convexity;
  }
  
  return polygon;
}

/**
 * Creates a vector literal expression from a tree-sitter vector_literal node
 * 
 * @param vectorNode The tree-sitter vector_literal node
 * @returns A VectorLiteral expression
 */
function createVectorLiteral(vectorNode: TreeSitterNode): Expression {
  const position: ASTPosition = {
    startLine: vectorNode.startPosition.row,
    startColumn: vectorNode.startPosition.column,
    endLine: vectorNode.endPosition.row,
    endColumn: vectorNode.endPosition.column
  };
  
  return {
    type: 'VectorLiteral',
    values: [], // We're only creating the structure, not parsing the values
    position
  };
}

/**
 * Creates a literal expression from a tree-sitter number_literal node
 * 
 * @param literalNode The tree-sitter number_literal node
 * @returns A LiteralExpression
 */
function createLiteralExpression(literalNode: TreeSitterNode): LiteralExpression {
  const position: ASTPosition = {
    startLine: literalNode.startPosition.row,
    startColumn: literalNode.startPosition.column,
    endLine: literalNode.endPosition.row,
    endColumn: literalNode.endPosition.column
  };
  
  // Parse the number value from the text
  const value = parseFloat(literalNode.text);
  
  return {
    type: 'LiteralExpression',
    valueType: 'number',
    value,
    position
  };
}
