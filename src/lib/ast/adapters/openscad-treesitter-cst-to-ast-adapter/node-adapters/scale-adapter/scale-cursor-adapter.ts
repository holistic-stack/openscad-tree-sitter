/**
 * ScaleTransform cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter scale node to an AST ScaleTransform node
 * using cursor-based traversal for better performance and memory usage.
 * 
 * Following Test-Driven Development principles, this implementation ensures:
 * - Proper handling of both vector and scalar scale factors
 * - Accurate extraction of child nodes
 * - Consistent position information
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, ASTPosition, CallExpression, IdentifierExpression } from '../../../../types/ast-types';
import { ScaleTransform } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter scale node to an AST ScaleTransform node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a scale transformation
 * @returns The AST ScaleTransform node
 */
export function scaleCursorAdapter(cursor: TreeCursor): ScaleTransform {
  const node = cursor.currentNode();
  const position = extractPositionFromCursor(cursor);
  
  // Default empty children array
  let children: ASTNode[] = [];
  
  // Initialize scale factors
  let scaleFactors = {
    type: 'VectorLiteral',
    values: [1, 1, 1] // Default scale factors
  };
  
  // Process the scale transformation node
  if (node.childCount >= 3) {
    const argsNode = node.child(1);
    
    if (argsNode && argsNode.type === 'arguments' && argsNode.childCount > 0) {
      const scaleArg = argsNode.child(0);
      
      if (scaleArg) {
        // Handle vector scale factor
        if (scaleArg.type === 'vector_literal') {
          const values: number[] = [];
          
          // Extract the numbers from the vector literal
          for (let i = 0; i < scaleArg.childCount; i++) {
            const valueNode = scaleArg.child(i);
            if (valueNode && valueNode.type === 'number_literal') {
              // Parse the number value from the text
              values.push(parseFloat(valueNode.text));
            }
          }
          
          // Ensure we have exactly 3 values for the 3D vector
          if (values.length === 3) {
            scaleFactors.values = values;
          } else if (values.length === 2) {
            // If 2D scale, assume z=1
            scaleFactors.values = [...values, 1];
          } else if (values.length === 1) {
            // If scalar in vector form, use same value for all axes
            scaleFactors.values = [values[0], values[0], values[0]];
          }
        }
        // Handle scalar scale factor
        else if (scaleArg.type === 'number_literal') {
          const value = parseFloat(scaleArg.text);
          scaleFactors.values = [value, value, value]; // Apply same scale to all axes
        }
      }
    }
    
    // Extract body node (child objects to be scaled)
    const bodyNode = node.child(2);
    
    if (bodyNode && bodyNode.type === 'block') {
      // Process each child in the block
      for (let i = 0; i < bodyNode.childCount; i++) {
        const child = bodyNode.child(i);
        if (child && child.isNamed) {
          // Create a simple call expression for each child in the scale transformation
          if (child.type === 'call_expression') {
            const callExprPosition: ASTPosition = {
              startLine: child.startPosition.row,
              startColumn: child.startPosition.column,
              endLine: child.endPosition.row,
              endColumn: child.endPosition.column
            };
            
            // Create an identifier for the callee
            const identifierNode = child.child(0);
            const callee: IdentifierExpression = {
              type: 'IdentifierExpression',
              name: identifierNode ? identifierNode.text : 'unknown',
              position: {
                startLine: identifierNode ? identifierNode.startPosition.row : child.startPosition.row,
                startColumn: identifierNode ? identifierNode.startPosition.column : child.startPosition.column,
                endLine: identifierNode ? identifierNode.endPosition.row : child.startPosition.row,
                endColumn: identifierNode ? identifierNode.endPosition.column : child.startPosition.column + 1
              }
            };
            
            // Create a call expression
            const callExpr: CallExpression = {
              type: 'CallExpression',
              callee,
              arguments: [],
              position: callExprPosition
            };
            
            children.push(callExpr);
          } else {
            // For other types, create a basic node with position info
            children.push({
              type: 'Unknown',
              position: {
                startLine: child.startPosition.row,
                startColumn: child.startPosition.column,
                endLine: child.endPosition.row,
                endColumn: child.endPosition.column
              }
            });
          }
        }
      }
    }
  }
  
  // Construct and return the ScaleTransform node
  return {
    type: 'ScaleTransform',
    scaleFactors,
    children,
    position
  };
}
