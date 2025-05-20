import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';
import { findDescendantOfType } from '../utils/node-utils';
import { extractArguments } from '../extractors/argument-extractor';
import { extractValue } from '../extractors/value-extractor';

/**
 * Generator for control structure nodes (if, for, let, each)
 */
export class ControlStructureGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    // Control structures are not typically instantiated as functions in OpenSCAD
    // This method is required by BaseGenerator but not used for control structures
    return null;
  }

  /**
   * Process an if statement node
   */
  public processIfStatement(node: TSNode): ast.IfNode | null {
    console.log(`[ControlStructureGenerator.processIfStatement] Processing if statement: ${node.text.substring(0, 50)}`);

    // Extract the condition
    const conditionNode = node.childForFieldName('expression');
    if (!conditionNode) {
      console.warn('[ControlStructureGenerator.processIfStatement] No condition found in if statement');
      return null;
    }

    // Process the condition as an expression
    const condition = this.processExpression(conditionNode);
    if (!condition) {
      console.warn('[ControlStructureGenerator.processIfStatement] Failed to process condition expression');
      return null;
    }

    // Extract the then branch (consequence)
    const thenBranchNode = node.childForFieldName('consequence');
    if (!thenBranchNode) {
      console.warn('[ControlStructureGenerator.processIfStatement] No then branch found in if statement');
      return null;
    }

    // Process the then branch
    const thenBranch: ast.ASTNode[] = [];
    this.processBodyNode(thenBranchNode, thenBranch);

    // Extract the else branch (alternative) if it exists
    const elseBranchNode = node.childForFieldName('alternative');
    const elseBranch: ast.ASTNode[] = [];

    if (elseBranchNode) {
      // Check if this is an else-if statement
      if (elseBranchNode.type === 'if_statement') {
        // Process the else-if as a nested if statement
        const elseIfNode = this.processIfStatement(elseBranchNode);
        if (elseIfNode) {
          elseBranch.push(elseIfNode);
        }
      } else {
        // Process the else branch
        this.processBodyNode(elseBranchNode, elseBranch);
      }
    }

    return {
      type: 'if',
      condition,
      thenBranch,
      elseBranch: elseBranch.length > 0 ? elseBranch : undefined,
      location: getLocation(node)
    };
  }

  /**
   * Process a for loop node
   */
  public processForLoop(node: TSNode): ast.ForLoopNode | null {
    console.log(`[ControlStructureGenerator.processForLoop] Processing for loop: ${node.text.substring(0, 50)}`);

    // Extract the for header (variable and range)
    const forHeaderNode = node.childForFieldName('for_header');
    if (!forHeaderNode) {
      console.warn('[ControlStructureGenerator.processForLoop] No for header found in for loop');
      return null;
    }

    // Check if this is a for loop with multiple variables (comma-separated)
    const forHeaderText = forHeaderNode.text;
    const variables: ast.ForLoopVariable[] = [];

    // If the for header contains commas, it might have multiple variables
    if (forHeaderText.includes(',')) {
      // Split the for header by commas
      const parts = forHeaderText.split(',');

      for (const part of parts) {
        // Extract variable and range from each part
        const match = part.trim().match(/^\s*([a-zA-Z0-9_$]+)\s*=\s*(.+)$/);
        if (match) {
          const variableName = match[1];
          const rangeText = match[2].trim();

          // Process the range
          let range: ast.ExpressionNode | ast.Vector2D | ast.Vector3D;
          let step: number | undefined;

          // Check if this is a range expression [start:step:end] or [start:end]
          if (rangeText.match(/\[\s*\d+\s*:\s*\d+\s*\]/)) {
            // [start:end] format
            const rangeMatch = rangeText.match(/\[\s*(\d+)\s*:\s*(\d+)\s*\]/);
            if (rangeMatch) {
              const start = parseInt(rangeMatch[1]);
              const end = parseInt(rangeMatch[2]);
              range = [start, end] as ast.Vector2D;
            } else {
              console.warn(`[ControlStructureGenerator.processForLoop] Failed to parse range: ${rangeText}`);
              continue;
            }
          } else if (rangeText.match(/\[\s*\d+\s*:\s*\d+\s*:\s*\d+\s*\]/)) {
            // [start:step:end] format
            const rangeMatch = rangeText.match(/\[\s*(\d+)\s*:\s*(\d+)\s*:\s*(\d+)\s*\]/);
            if (rangeMatch) {
              const start = parseInt(rangeMatch[1]);
              const stepValue = parseInt(rangeMatch[2]);
              const end = parseInt(rangeMatch[3]);
              step = stepValue;
              range = [start, step, end] as ast.Vector3D;
            } else {
              console.warn(`[ControlStructureGenerator.processForLoop] Failed to parse range with step: ${rangeText}`);
              continue;
            }
          } else {
            // Process as a general expression (like an array or variable)
            range = {
              type: 'expression',
              expressionType: 'variable',
              name: rangeText,
              location: getLocation(node)
            };
          }

          // Add the variable to the list
          variables.push({
            variable: variableName,
            range,
            step
          });
        }
      }
    } else {
      // Single variable case
      // Extract the variable name
      const variableNode = forHeaderNode.childForFieldName('iterator');
      if (!variableNode) {
        console.warn('[ControlStructureGenerator.processForLoop] No variable found in for loop header');
        return null;
      }
      const variable = variableNode.text;

      // Extract the range
      const rangeNode = forHeaderNode.childForFieldName('range');
      if (!rangeNode) {
        console.warn('[ControlStructureGenerator.processForLoop] No range found in for loop header');
        return null;
      }

      // Check if this is a range expression [start:step:end] or [start:end]
      let range: ast.ExpressionNode | ast.Vector2D | ast.Vector3D;
      let step: number | undefined;

      if (rangeNode.type === 'range_expression') {
        const startNode = rangeNode.childForFieldName('start');
        const endNode = rangeNode.childForFieldName('end');
        const stepNode = rangeNode.childForFieldName('step');

        if (!startNode || !endNode) {
          console.warn('[ControlStructureGenerator.processForLoop] Invalid range expression in for loop');
          return null;
        }

        const start = extractValue(startNode);
        const end = extractValue(endNode);

        if (typeof start !== 'number' || typeof end !== 'number') {
          console.warn('[ControlStructureGenerator.processForLoop] Range expression start/end are not numbers');
          return null;
        }

        if (stepNode) {
          const stepValue = extractValue(stepNode);
          if (typeof stepValue === 'number') {
            step = stepValue;
            range = [start, step, end] as ast.Vector3D;
          } else {
            console.warn('[ControlStructureGenerator.processForLoop] Range expression step is not a number');
            range = [start, end] as ast.Vector2D;
          }
        } else {
          range = [start, end] as ast.Vector2D;
        }
      } else {
        // Process as a general expression (like an array or variable)
        const rangeExpr = this.processExpression(rangeNode);
        if (!rangeExpr) {
          console.warn('[ControlStructureGenerator.processForLoop] Failed to process range expression');
          return null;
        }
        range = rangeExpr;
      }

      // Add the variable to the list
      variables.push({
        variable,
        range,
        step
      });
    }

    // If no variables were found, return null
    if (variables.length === 0) {
      console.warn('[ControlStructureGenerator.processForLoop] No variables found in for loop');
      return null;
    }

    // Extract the body
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      console.warn('[ControlStructureGenerator.processForLoop] No body found in for loop');
      return null;
    }

    // Process the body
    const body: ast.ASTNode[] = [];
    this.processBodyNode(bodyNode, body);

    return {
      type: 'for_loop',
      variables,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Process a let expression node
   */
  public processLetExpression(node: TSNode): ast.LetNode | null {
    console.log(`[ControlStructureGenerator.processLetExpression] Processing let expression: ${node.text.substring(0, 50)}`);

    // Extract the assignments
    const assignmentsNode = node.childForFieldName('assignments');
    if (!assignmentsNode) {
      console.warn('[ControlStructureGenerator.processLetExpression] No assignments found in let expression');
      return null;
    }

    // Process the assignments
    const assignments: { [key: string]: ast.ParameterValue } = {};

    for (let i = 0; i < assignmentsNode.namedChildCount; i++) {
      const assignmentNode = assignmentsNode.namedChild(i);
      if (assignmentNode && assignmentNode.type === 'let_assignment') {
        const nameNode = assignmentNode.childForFieldName('name');
        const valueNode = assignmentNode.childForFieldName('value');

        if (nameNode && valueNode) {
          const name = nameNode.text;
          const value = extractValue(valueNode);

          if (value !== undefined) {
            assignments[name] = value;
          }
        }
      }
    }

    // Extract the body
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      console.warn('[ControlStructureGenerator.processLetExpression] No body found in let expression');
      return null;
    }

    // Process the body
    const body: ast.ASTNode[] = [];

    // If the body is an expression, we need to convert it to an AST node
    if (bodyNode.type === 'expression') {
      // Check if the body is another let expression (nested let)
      if (bodyNode.firstChild && bodyNode.firstChild.type === 'let_expression') {
        const nestedLetNode = this.processLetExpression(bodyNode.firstChild);
        if (nestedLetNode) {
          body.push(nestedLetNode);
        }
      } else {
        const exprNode = this.processExpression(bodyNode);
        if (exprNode) {
          body.push(exprNode);
        }
      }
    } else {
      // Process the body as a normal body
      this.processBodyNode(bodyNode, body);

      // Check for nested let expressions in the body
      for (let i = 0; i < body.length; i++) {
        const childNode = body[i];
        if (childNode.type === 'let') {
          // This is a nested let expression
          console.log('[ControlStructureGenerator.processLetExpression] Found nested let expression in body');
        }
      }
    }

    return {
      type: 'let',
      assignments,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Process an each statement node
   */
  public processEachStatement(node: TSNode): ast.EachNode | null {
    console.log(`[ControlStructureGenerator.processEachStatement] Processing each statement: ${node.text.substring(0, 50)}`);

    // Extract the expression
    const expressionNode = node.childForFieldName('expression');
    if (!expressionNode) {
      console.warn('[ControlStructureGenerator.processEachStatement] No expression found in each statement');
      return null;
    }

    // Process the expression
    let expression: ast.ExpressionNode | null = null;

    // Check if the expression is an array literal
    if (expressionNode.type === 'array_literal') {
      // Process the array literal
      const arrayItems: ast.ExpressionNode[] = [];

      for (let i = 0; i < expressionNode.namedChildCount; i++) {
        const itemNode = expressionNode.namedChild(i);
        if (itemNode) {
          const itemExpr = this.processExpression(itemNode);
          if (itemExpr) {
            arrayItems.push(itemExpr);
          }
        }
      }

      // Create an expression node for the array
      expression = {
        type: 'expression',
        expressionType: 'array',
        items: arrayItems,
        location: getLocation(expressionNode)
      };
    } else {
      // Process as a regular expression
      expression = this.processExpression(expressionNode);
    }

    if (!expression) {
      console.warn('[ControlStructureGenerator.processEachStatement] Failed to process expression in each statement');
      return null;
    }

    return {
      type: 'each',
      expression,
      location: getLocation(node)
    };
  }

  /**
   * Process a body node (block or statement)
   */
  private processBodyNode(node: TSNode, children: ast.ASTNode[]): void {
    if (node.type === 'block') {
      // Process all statements in the block
      for (let i = 0; i < node.namedChildCount; i++) {
        const statementNode = node.namedChild(i);
        if (statementNode && statementNode.type === 'statement') {
          this.processNode(statementNode, children);
        }
      }
    } else if (node.type === 'statement') {
      // Process a single statement
      this.processNode(node, children);
    } else {
      console.warn(`[ControlStructureGenerator.processBodyNode] Unexpected body node type: ${node.type}`);
    }
  }

  /**
   * Process an expression node
   */
  private processExpression(node: TSNode): ast.ExpressionNode | null {
    if (!node) return null;

    // For simplicity, create a basic variable expression
    // In a real implementation, this would delegate to the ExpressionGenerator
    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node)
    };
  }
}
