import { TSNode } from './location-utils';

/**
 * Find a descendant node of a specific type
 */
export function findDescendantOfType(node: TSNode, type: string): TSNode | null {
  // Check if this node is of the desired type
  if (node.type === type) {
    return node;
  }

  // Recursively check all children
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      const result = findDescendantOfType(child, type);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

/**
 * Find a module_instantiation node in a statement node
 */
export function findModuleInstantiationInStatement(statementNode: TSNode): TSNode | null {
  // Check if this is an expression_statement
  const expressionStatement = statementNode.childForFieldName('expression_statement');
  if (expressionStatement) {
    // Check if there's an expression
    const expression = expressionStatement.childForFieldName('expression');
    if (expression) {
      // Check if there's a module_instantiation in the expression
      return findDescendantOfType(expression, 'module_instantiation');
    }
  }

  // If not found through the expression_statement path, try direct search
  return findDescendantOfType(statementNode, 'module_instantiation');
}

/**
 * Find a cube module_instantiation node in a statement node
 */
export function findCubeModuleInstantiation(statementNode: TSNode): TSNode | null {
  // Check if this is an expression_statement
  if (statementNode.childCount > 0) {
    const expressionStatement = statementNode.child(0);
    if (expressionStatement && expressionStatement.type === 'expression_statement') {
      // Check if there's an expression
      if (expressionStatement.childCount > 0) {
        const expression = expressionStatement.child(0);
        if (expression && expression.type === 'expression') {
          // Check if there's a module_instantiation in the expression
          for (let i = 0; i < expression.childCount; i++) {
            const child = expression.child(i);
            if (child && child.type === 'conditional_expression') {
              // Look for module_instantiation in the conditional_expression
              for (let j = 0; j < child.childCount; j++) {
                const grandchild = child.child(j);
                if (grandchild && grandchild.type === 'accessor_expression') {
                  // Check if this is a cube module_instantiation
                  if (grandchild.text.startsWith('cube')) {
                    // Find the parent module_instantiation node
                    let current: TSNode | null = grandchild;
                    while (current && current.type !== 'module_instantiation') {
                      current = current.parent;
                    }
                    return current;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // If not found through the expression_statement path, try direct search
  return findDescendantOfType(statementNode, 'module_instantiation');
}

/**
 * Find a block node that's a child of the given node
 */
export function findBlockNode(node: TSNode): TSNode | null {
  // First check direct children
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child?.type === 'block') {
      return child;
    }
  }

  // Then check for block after the module instantiation
  let nextSibling = node.nextSibling;
  while (nextSibling) {
    if (nextSibling.type === 'block') {
      return nextSibling;
    }
    // Only check the immediate next sibling
    break;
  }

  return null;
}
