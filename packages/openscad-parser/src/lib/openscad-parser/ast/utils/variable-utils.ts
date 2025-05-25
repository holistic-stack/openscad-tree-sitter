/**
 * @file Utility functions for working with variables in OpenSCAD AST
 * @module openscad-parser/ast/utils/variable-utils
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Check if a node represents a special OpenSCAD variable ($fn, $fa, $fs, etc.)
 * @param node The node to check
 * @returns True if the node represents a special variable
 */
export function isSpecialVariable(node: TSNode): boolean {
  const text = node.text.trim();
  return text.startsWith('$') && /^\$[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
}

/**
 * Extract variable name from an identifier node
 * @param node The identifier node
 * @returns The variable name or null if invalid
 */
export function extractVariableName(node: TSNode): string | null {
  if (node.type !== 'identifier') {
    return null;
  }
  
  const name = node.text.trim();
  return name.length > 0 ? name : null;
}

/**
 * Check if a variable name is valid according to OpenSCAD rules
 * @param name The variable name to validate
 * @returns True if the name is valid
 */
export function isValidVariableName(name: string): boolean {
  // OpenSCAD variable names must start with letter or underscore,
  // followed by letters, digits, or underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Get the list of built-in OpenSCAD special variables
 * @returns Array of special variable names
 */
export function getSpecialVariables(): string[] {
  return [
    '$fn',    // Number of fragments for circles
    '$fa',    // Minimum angle for fragments
    '$fs',    // Minimum size for fragments
    '$t',     // Animation time variable
    '$vpr',   // Viewport rotation
    '$vpt',   // Viewport translation
    '$vpd',   // Viewport distance
    '$children', // Number of child modules
  ];
}

/**
 * Check if a variable is a built-in special variable
 * @param name The variable name to check
 * @returns True if it's a built-in special variable
 */
export function isBuiltinSpecialVariable(name: string): boolean {
  return getSpecialVariables().includes(name);
}
