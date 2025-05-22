/**
 * Debug utilities for working with tree-sitter nodes
 * 
 * @module lib/openscad-parser/ast/utils/debug-utils
 */

import { Node as TSNode } from 'web-tree-sitter';

/**
 * Print the structure of a tree-sitter node for debugging
 * @param node The node to print
 * @param depth The current depth in the tree (for indentation)
 * @param maxDepth The maximum depth to print
 * @param maxChildren The maximum number of children to print at each level
 */
export function printNodeStructure(
  node: TSNode, 
  depth: number = 0, 
  maxDepth: number = 3, 
  maxChildren: number = 5
): void {
  if (!node || depth > maxDepth) {
    return;
  }
  
  const indent = '  '.repeat(depth);
  console.log(`${indent}Node: ${node.type}, Text: "${node.text.substring(0, 30)}${node.text.length > 30 ? '...' : ''}"`);
  
  // Print field names if available
  const fieldNames = node.type === 'ERROR' ? [] : node.childCount > 0 ? node.children.map(child => 
    node.fieldNameForChild(node.children.indexOf(child))
  ).filter(Boolean) : [];
  
  if (fieldNames.length > 0) {
    console.log(`${indent}Fields: ${fieldNames.join(', ')}`);
  }
  
  // Print children
  const childCount = node.childCount;
  if (childCount > 0) {
    console.log(`${indent}Children (${childCount}):`);
    
    const childrenToPrint = Math.min(childCount, maxChildren);
    for (let i = 0; i < childrenToPrint; i++) {
      const child = node.child(i);
      if (child) {
        const fieldName = node.fieldNameForChild(i);
        if (fieldName) {
          console.log(`${indent}  Child ${i} (field: ${fieldName}):`);
        } else {
          console.log(`${indent}  Child ${i}:`);
        }
        printNodeStructure(child, depth + 2, maxDepth, maxChildren);
      }
    }
    
    if (childCount > maxChildren) {
      console.log(`${indent}  ... (${childCount - maxChildren} more children)`);
    }
  }
  
  // Print named children if different from regular children
  const namedChildCount = node.namedChildCount;
  if (namedChildCount > 0 && namedChildCount !== childCount) {
    console.log(`${indent}Named Children (${namedChildCount}):`);
    
    const namedChildrenToPrint = Math.min(namedChildCount, maxChildren);
    for (let i = 0; i < namedChildrenToPrint; i++) {
      const child = node.namedChild(i);
      if (child) {
        console.log(`${indent}  Named Child ${i}:`);
        printNodeStructure(child, depth + 2, maxDepth, maxChildren);
      }
    }
    
    if (namedChildCount > maxChildren) {
      console.log(`${indent}  ... (${namedChildCount - maxChildren} more named children)`);
    }
  }
}
