import { Node as TSNode } from 'web-tree-sitter';

/**
 * Find a descendant node of a specific type
 * @param node The node to search in
 * @param type The type of node to find
 * @returns The first descendant node of the specified type or null if not found
 */
export function findDescendantOfType(node: TSNode, type: string): TSNode | null {
  if (node.type === type) {
    return node;
  }
  
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;
    
    const result = findDescendantOfType(child, type);
    if (result) {
      return result;
    }
  }
  
  return null;
}

/**
 * Find all descendant nodes of a specific type
 * @param node The node to search in
 * @param type The type of node to find
 * @returns An array of all descendant nodes of the specified type
 */
export function findAllDescendantsOfType(node: TSNode, type: string): TSNode[] {
  const results: TSNode[] = [];
  
  if (node.type === type) {
    results.push(node);
  }
  
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;
    
    const childResults = findAllDescendantsOfType(child, type);
    results.push(...childResults);
  }
  
  return results;
}

/**
 * Find the first ancestor node of a specific type
 * @param node The node to start from
 * @param type The type of node to find
 * @returns The first ancestor node of the specified type or null if not found
 */
export function findAncestorOfType(node: TSNode, type: string): TSNode | null {
  let current = node.parent;
  
  while (current) {
    if (current.type === type) {
      return current;
    }
    current = current.parent;
  }
  
  return null;
}

/**
 * Get the function name from a module instantiation node
 * @param node The module instantiation node
 * @returns The function name or null if not found
 */
export function getFunctionName(node: TSNode): string | null {
  if (node.type !== 'module_instantiation') return null;
  
  const nameNode = node.childForFieldName('name');
  if (!nameNode) return null;
  
  return nameNode.text;
}
