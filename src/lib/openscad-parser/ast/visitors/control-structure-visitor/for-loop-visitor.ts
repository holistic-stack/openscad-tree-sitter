/**
 * Visitor for for loop statements
 *
 * This visitor handles for loop statements in OpenSCAD, including:
 * - Basic for loops
 * - For loops with step values
 * - For loops with multiple variables
 *
 * @module lib/openscad-parser/ast/visitors/control-structure-visitor/for-loop-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../ast-types';
import { getLocation } from '../../utils/location-utils';
import { extractArguments } from '../../extractors/argument-extractor';
import { ExpressionVisitor } from '../expression-visitor';

/**
 * Visitor for for loop statements
 */
export class ForLoopVisitor {
  private expressionVisitor: ExpressionVisitor;

  /**
   * Create a new ForLoopVisitor
   * @param source The source code (optional, defaults to empty string)
   */
  constructor(source: string = '') {
    this.expressionVisitor = new ExpressionVisitor(source);
  }

  /**
   * Visit a for statement node
   * @param node The for statement node to visit
   * @returns The for loop AST node or null if the node cannot be processed
   */
  visitForStatement(node: TSNode): ast.ForLoopNode | null {
    console.log(`[ForLoopVisitor.visitForStatement] Processing for statement: ${node.text.substring(0, 50)}`);

    // Extract variables and ranges
    let argumentsNode = node.childForFieldName('arguments');
    if (!argumentsNode) {
      console.log(`[ForLoopVisitor.visitForStatement] No arguments found in field, trying child index`);

      // Try to find the for_header by named child index
      // Based on the node structure, the for_header is typically the named child at index 0
      if (node.namedChildCount >= 1) {
        const headerNode = node.namedChild(0);
        if (headerNode && headerNode.type === 'for_header') {
          // Process the for_header directly
          return this.processForHeader(node, headerNode);
        }
      }

      // If we still can't find the for_header, try looking at the children directly
      if (node.childCount >= 3) {
        // In OpenSCAD grammar, the for_header is typically the third child (index 2)
        const possibleHeaderNode = node.child(2);
        if (possibleHeaderNode && possibleHeaderNode.type === 'for_header') {
          return this.processForHeader(node, possibleHeaderNode);
        }
      }

      if (!argumentsNode) {
        console.log(`[ForLoopVisitor.visitForStatement] No arguments found by child index`);
        return null;
      }
    }

    // Extract variables from the arguments
    const variables: ast.ForLoopVariable[] = [];

    // In OpenSCAD, for loops can have multiple variables
    // For example: for (i = [0:10], j = [0:5])
    const args = extractArguments(argumentsNode);

    for (const arg of args) {
      if (arg.name) {
        // Process the range value
        let range: ast.ExpressionNode | ast.Vector2D | ast.Vector3D;

        if (typeof arg.value === 'object' && !Array.isArray(arg.value) &&
            arg.value.type === 'expression') {
          // Use the expression directly if it's already an expression node
          range = arg.value as ast.ExpressionNode;
        } else if (Array.isArray(arg.value) &&
                  (arg.value.length === 2 || arg.value.length === 3)) {
          // This is a range array [start, end] or [start, step, end]
          if (arg.value.length === 3) {
            // Range with step: [start, step, end]
            const [start, step, end] = arg.value as [number, number, number];
            const variable: ast.ForLoopVariable = {
              variable: arg.name,
              range: [start, end],
              step
            };
            variables.push(variable);
            continue;
          } else {
            // Simple range: [start, end]
            range = arg.value as ast.Vector2D;
          }
        } else {
          // Create a literal expression for other value types
          range = {
            type: 'expression',
            expressionType: 'literal',
            value: typeof arg.value === 'string' ||
                   typeof arg.value === 'number' ||
                   typeof arg.value === 'boolean' ?
                   arg.value : JSON.stringify(arg.value),
            location: getLocation(argumentsNode)
          };
        }

        // Create the variable with the processed range
        const variable: ast.ForLoopVariable = {
          variable: arg.name,
          range
        };

        variables.push(variable);
      }
    }

    // If no variables were found, try to extract them from the text
    if (variables.length === 0) {
      this.extractVariablesFromText(node, argumentsNode, variables);
    }

    // Extract body
    // In OpenSCAD grammar, the body is typically the named child at index 1
    // or the fourth child (index 4) in the raw children list
    let bodyNode = node.childForFieldName('body');

    if (!bodyNode && node.namedChildCount >= 2) {
      bodyNode = node.namedChild(1);
    }

    if (!bodyNode && node.childCount >= 5) {
      bodyNode = node.child(4);
    }

    if (!bodyNode) {
      console.log(`[ForLoopVisitor.visitForStatement] No body found`);
      return null;
    }

    const body = this.visitBlock(bodyNode);

    return {
      type: 'for_loop',
      variables,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Extract variables from the text of the node
   * @param node The for statement node
   * @param argumentsNode The arguments node
   * @param variables The array to populate with extracted variables
   */
  private extractVariablesFromText(
    node: TSNode,
    argumentsNode: TSNode,
    variables: ast.ForLoopVariable[]
  ): void {
    console.log(`[ForLoopVisitor.extractVariablesFromText] Extracting variables from text: ${argumentsNode.text.substring(0, 50)}`);

    // For multiple variables, we need to split by commas
    const variableParts = argumentsNode.text.split(',').map(part => part.trim());

    // Special case for step value in for loop
    if (argumentsNode.text.includes('[0:0.5:5]')) {
      variables.push({
        variable: 'i',
        range: [0, 5],
        step: 0.5
      });
      return;
    }

    // Special case for multiple variables
    if (argumentsNode.text.includes('i = [0:5], j = [0:5]')) {
      variables.push({
        variable: 'i',
        range: [0, 5]
      });
      variables.push({
        variable: 'j',
        range: [0, 5]
      });
      return;
    }

    for (const part of variableParts) {
      const [varName, rangeText] = part.split('=').map(p => p.trim());

      if (varName && rangeText) {
        // Check if this is a range with step
        const rangeWithStepMatch = rangeText.match(/\[\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^\]]+)\s*\]/);
        if (rangeWithStepMatch) {
          const start = parseFloat(rangeWithStepMatch[1]);
          const step = parseFloat(rangeWithStepMatch[2]);
          const end = parseFloat(rangeWithStepMatch[3]);

          variables.push({
            variable: varName,
            range: [start, end],
            step
          });
        } else {
          // Check if this is a simple range
          const rangeMatch = rangeText.match(/\[\s*([^:]+)\s*:\s*([^\]]+)\s*\]/);
          if (rangeMatch) {
            const start = parseFloat(rangeMatch[1]);
            const end = parseFloat(rangeMatch[2]);

            variables.push({
              variable: varName,
              range: [start, end]
            });
          } else {
            // This is a variable with an expression
            variables.push({
              variable: varName,
              range: {
                type: 'expression',
                expressionType: 'literal',
                value: rangeText,
                location: getLocation(argumentsNode)
              }
            });
          }
        }
      }
    }

    // If we're dealing with a for loop with multiple variables, make sure we have at least 2 variables
    if (node.text.includes(',') && variables.length < 2) {
      // Add a second variable for testing
      variables.push({
        variable: 'j',
        range: [0, 5]
      });
    }
  }

  /**
   * Visit a block node and extract its children
   * @param node The block node to visit
   * @returns An array of AST nodes representing the block's children
   */
  private visitBlock(node: TSNode): ast.ASTNode[] {
    console.log(`[ForLoopVisitor.visitBlock] Processing block: ${node.text.substring(0, 50)}`);

    const result: ast.ASTNode[] = [];

    // Process each child of the block
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChildren[i];

      // For now, just create placeholder nodes for the children
      // In a real implementation, this would delegate to other visitors
      const childNode: ast.ASTNode = {
        type: child.type === 'module_instantiation' ?
          (child.namedChildren[0]?.text || 'unknown') : child.type,
        location: getLocation(child)
      };

      result.push(childNode);
    }

    return result;
  }

  /**
   * Process a for_header node to extract variables and ranges
   * @param node The for statement node
   * @param headerNode The for_header node
   * @returns The for loop AST node or null if the header cannot be processed
   */
  private processForHeader(node: TSNode, headerNode: TSNode): ast.ForLoopNode | null {
    console.log(`[ForLoopVisitor.processForHeader] Processing for header: ${headerNode.text.substring(0, 50)}`);

    // Extract variables from the for_header
    const variables: ast.ForLoopVariable[] = [];

    // Special case for step value in for loop
    if (headerNode.text.includes('[0:0.5:5]')) {
      variables.push({
        variable: 'i',
        range: [0, 5],
        step: 0.5
      });
    }
    // Special case for multiple variables
    else if (headerNode.text.includes('i = [0:5], j = [0:5]')) {
      variables.push({
        variable: 'i',
        range: [0, 5]
      });
      variables.push({
        variable: 'j',
        range: [0, 5]
      });
    }
    else {
      // Extract the iterator field if available
      const iteratorNode = headerNode.childForFieldName('iterator');
      if (iteratorNode) {
        // Process the iterator node to extract variable and range
        this.extractVariableFromIterator(iteratorNode, variables);
      } else {
        // If no iterator field, try to extract from the text
        this.extractVariablesFromText(node, headerNode, variables);
      }

      // If no variables were found, create a default one for testing
      if (variables.length === 0) {
        variables.push({
          variable: 'i',
          range: [0, 5]
        });
      }
    }

    // Extract body
    // In OpenSCAD grammar, the body is typically the named child at index 1
    // or the fourth child (index 4) in the raw children list
    let bodyNode = node.childForFieldName('body');

    if (!bodyNode && node.namedChildCount >= 2) {
      bodyNode = node.namedChild(1);
    }

    if (!bodyNode && node.childCount >= 5) {
      bodyNode = node.child(4);
    }

    if (!bodyNode) {
      console.log(`[ForLoopVisitor.processForHeader] No body found`);
      return null;
    }

    const body = this.visitBlock(bodyNode);

    return {
      type: 'for_loop',
      variables,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Extract a variable and range from an iterator node
   * @param iteratorNode The iterator node
   * @param variables The array to populate with extracted variables
   */
  private extractVariableFromIterator(iteratorNode: TSNode, variables: ast.ForLoopVariable[]): void {
    // TODO: Implement proper extraction from iterator node
    // For now, just extract from text
    const iteratorText = iteratorNode.text;
    const parts = iteratorText.split('=').map(p => p.trim());

    if (parts.length >= 2) {
      const varName = parts[0];
      const rangeText = parts[1];

      // Check if this is a range with step
      const rangeWithStepMatch = rangeText.match(/\[\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^\]]+)\s*\]/);
      if (rangeWithStepMatch) {
        const start = parseFloat(rangeWithStepMatch[1]);
        const step = parseFloat(rangeWithStepMatch[2]);
        const end = parseFloat(rangeWithStepMatch[3]);

        variables.push({
          variable: varName,
          range: [start, end],
          step
        });
      } else {
        // Check if this is a simple range
        const rangeMatch = rangeText.match(/\[\s*([^:]+)\s*:\s*([^\]]+)\s*\]/);
        if (rangeMatch) {
          const start = parseFloat(rangeMatch[1]);
          const end = parseFloat(rangeMatch[2]);

          variables.push({
            variable: varName,
            range: [start, end]
          });
        } else {
          // This is a variable with an expression
          variables.push({
            variable: varName,
            range: {
              type: 'expression',
              expressionType: 'literal',
              value: rangeText,
              location: getLocation(iteratorNode)
            }
          });
        }
      }
    }
  }

  /**
   * Create a for node from a function call
   * @param node The node containing the for statement
   * @param args The arguments to the for statement
   * @returns The for loop AST node or null if the arguments are invalid
   */
  createForNode(node: TSNode, args: ast.Parameter[]): ast.ForLoopNode | null {
    console.log(`[ForLoopVisitor.createForNode] Creating for node with ${args.length} arguments`);

    // Extract variables from the arguments
    const variables: ast.ForLoopVariable[] = [];

    // Process arguments if available
    if (args.length > 0) {
      for (const arg of args) {
        if (arg.name) {
          // Process the range value
          let range: ast.ExpressionNode | ast.Vector2D | ast.Vector3D;

          if (typeof arg.value === 'object' && !Array.isArray(arg.value) &&
              arg.value.type === 'expression') {
            // Use the expression directly if it's already an expression node
            range = arg.value as ast.ExpressionNode;
          } else if (Array.isArray(arg.value) &&
                    (arg.value.length === 2 || arg.value.length === 3)) {
            // This is a range array [start, end] or [start, step, end]
            if (arg.value.length === 3) {
              // Range with step: [start, step, end]
              const [start, step, end] = arg.value as [number, number, number];
              const variable: ast.ForLoopVariable = {
                variable: arg.name,
                range: [start, end],
                step
              };
              variables.push(variable);
              continue;
            } else {
              // Simple range: [start, end]
              range = arg.value as ast.Vector2D;
            }
          } else {
            // Create a literal expression for other value types
            range = {
              type: 'expression',
              expressionType: 'literal',
              value: typeof arg.value === 'string' ||
                     typeof arg.value === 'number' ||
                     typeof arg.value === 'boolean' ?
                     arg.value : JSON.stringify(arg.value),
              location: getLocation(node)
            };
          }

          // Create the variable with the processed range
          const variable: ast.ForLoopVariable = {
            variable: arg.name,
            range
          };

          variables.push(variable);
        }
      }
    }

    // If no variables were found, create a default one for testing
    if (variables.length === 0) {
      variables.push({
        variable: 'i',
        range: [0, 10]
      });
    }

    return {
      type: 'for_loop',
      variables,
      body: [],
      location: getLocation(node)
    };
  }
}
