/**
 * Visitor for control structures (if, for, let, each)
 * 
 * This visitor handles control structures in OpenSCAD, including:
 * - if statements
 * - for loops
 * - let expressions
 * - each statements
 * 
 * @module lib/openscad-parser/ast/visitors/control-structure-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { getLocation } from '../utils/location-utils';
import { findDescendantOfType } from '../utils/node-utils';
import { extractArguments } from '../extractors/argument-extractor';

/**
 * Visitor for control structures
 */
export class ControlStructureVisitor extends BaseASTVisitor {
  /**
   * Create a new ControlStructureVisitor
   * @param source The source code
   */
  constructor(source: string) {
    super(source);
  }

  /**
   * Visit an if statement node
   * @param node The if statement node to visit
   * @returns The if AST node or null if the node cannot be processed
   */
  visitIfStatement(node: TSNode): ast.IfNode | null {
    console.log(`[ControlStructureVisitor.visitIfStatement] Processing if statement: ${node.text.substring(0, 50)}`);

    // Extract condition
    const conditionNode = node.childForFieldName('condition');
    if (!conditionNode) {
      console.log(`[ControlStructureVisitor.visitIfStatement] No condition found`);
      return null;
    }

    // Create a simple expression node for the condition
    // In a real implementation, this would use an expression visitor
    const condition: ast.ExpressionNode = {
      type: 'expression',
      expressionType: 'literal',
      value: conditionNode.text,
      location: getLocation(conditionNode)
    };

    // Extract then branch
    const thenNode = node.childForFieldName('consequence');
    if (!thenNode) {
      console.log(`[ControlStructureVisitor.visitIfStatement] No then branch found`);
      return null;
    }

    const thenBranch = this.visitBlock(thenNode);

    // Extract else branch if it exists
    const elseNode = node.childForFieldName('alternative');
    let elseBranch: ast.ASTNode[] | undefined = undefined;
    
    if (elseNode) {
      // Check if this is an else-if or a simple else
      const elseIfNode = findDescendantOfType(elseNode, 'if_statement');
      if (elseIfNode) {
        // This is an else-if, so process it as an if statement
        const elseIfResult = this.visitIfStatement(elseIfNode);
        if (elseIfResult) {
          elseBranch = [elseIfResult];
        }
      } else {
        // This is a simple else, so process its block
        elseBranch = this.visitBlock(elseNode);
      }
    }

    return {
      type: 'if',
      condition,
      thenBranch,
      elseBranch,
      location: getLocation(node)
    };
  }

  /**
   * Visit a for statement node
   * @param node The for statement node to visit
   * @returns The for loop AST node or null if the node cannot be processed
   */
  visitForStatement(node: TSNode): ast.ForLoopNode | null {
    console.log(`[ControlStructureVisitor.visitForStatement] Processing for statement: ${node.text.substring(0, 50)}`);

    // Extract variables and ranges
    const argumentsNode = node.childForFieldName('arguments');
    if (!argumentsNode) {
      console.log(`[ControlStructureVisitor.visitForStatement] No arguments found`);
      return null;
    }

    // Extract variables from the arguments
    const variables: ast.ForLoopVariable[] = [];
    
    // In OpenSCAD, for loops can have multiple variables
    // For example: for (i = [0:10], j = [0:5])
    const args = extractArguments(argumentsNode);
    
    for (const arg of args) {
      if (arg.name) {
        // This is a variable with a range
        const variable: ast.ForLoopVariable = {
          variable: arg.name,
          range: {
            type: 'expression',
            expressionType: 'literal',
            value: arg.value,
            location: getLocation(argumentsNode)
          }
        };
        
        variables.push(variable);
      }
    }

    // If no variables were found, try to extract them from the text
    if (variables.length === 0) {
      // Simple parsing for testing purposes
      const forHeaderMatch = node.text.match(/for\s*\(\s*([^)]+)\s*\)/);
      if (forHeaderMatch) {
        const variablesText = forHeaderMatch[1];
        const variableParts = variablesText.split(',').map(part => part.trim());
        
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
      }
    }

    // Extract body
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      console.log(`[ControlStructureVisitor.visitForStatement] No body found`);
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
   * Visit a let expression node
   * @param node The let expression node to visit
   * @returns The let AST node or null if the node cannot be processed
   */
  visitLetExpression(node: TSNode): ast.LetNode | null {
    console.log(`[ControlStructureVisitor.visitLetExpression] Processing let expression: ${node.text.substring(0, 50)}`);

    // Extract assignments
    const argumentsNode = node.childForFieldName('arguments');
    if (!argumentsNode) {
      console.log(`[ControlStructureVisitor.visitLetExpression] No arguments found`);
      return null;
    }

    // Extract assignments from the arguments
    const assignments: { [key: string]: ast.ParameterValue } = {};
    
    // In OpenSCAD, let expressions can have multiple assignments
    // For example: let(a = 10, b = 20)
    const args = extractArguments(argumentsNode);
    
    for (const arg of args) {
      if (arg.name) {
        assignments[arg.name] = arg.value;
      }
    }

    // Extract body
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      console.log(`[ControlStructureVisitor.visitLetExpression] No body found`);
      return null;
    }

    const body = this.visitBlock(bodyNode);

    return {
      type: 'let',
      assignments,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Visit an each statement node
   * @param node The each statement node to visit
   * @returns The each AST node or null if the node cannot be processed
   */
  visitEachStatement(node: TSNode): ast.EachNode | null {
    console.log(`[ControlStructureVisitor.visitEachStatement] Processing each statement: ${node.text.substring(0, 50)}`);

    // Extract expression
    const expressionNode = node.childForFieldName('expression');
    if (!expressionNode) {
      console.log(`[ControlStructureVisitor.visitEachStatement] No expression found`);
      return null;
    }

    // Create a simple expression node
    // In a real implementation, this would use an expression visitor
    const expression: ast.ExpressionNode = {
      type: 'expression',
      expressionType: 'literal',
      value: expressionNode.text,
      location: getLocation(expressionNode)
    };

    return {
      type: 'each',
      expression,
      location: getLocation(node)
    };
  }
}
