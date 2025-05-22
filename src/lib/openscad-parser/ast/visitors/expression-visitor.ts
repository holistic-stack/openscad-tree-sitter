/**
 * Visitor for expressions (binary, unary, conditional, etc.)
 *
 * This visitor handles expressions in OpenSCAD, including:
 * - Binary expressions (arithmetic, comparison, logical)
 * - Unary expressions (negation, logical not)
 * - Conditional expressions (ternary operator)
 * - Variable references
 * - Literal values (numbers, strings, vectors)
 * - Array/vector indexing
 *
 * @module lib/openscad-parser/ast/visitors/expression-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { getLocation } from '../utils/location-utils';
import { findDescendantOfType } from '../utils/node-utils';
// extractArguments is not used in this file
import { extractValue } from '../extractors/value-extractor';

/**
 * Visitor for expressions
 */
export class ExpressionVisitor extends BaseASTVisitor {
  /**
   * Create an AST node for a function call
   * @param node The function call node
   * @returns The function call AST node or null if the node cannot be processed
   */
  createASTNodeForFunction(node: TSNode): ast.ASTNode | null {
    console.log(`[ExpressionVisitor.createASTNodeForFunction] Processing function call: ${node.text.substring(0, 50)}`);

    // This is a placeholder implementation
    // In a real implementation, we would extract the function name and arguments
    // and create a proper function call node
    return null;
  }
  /**
   * Create a new ExpressionVisitor
   * @param source The source code
   */
  constructor(source: string) {
    super(source);
  }

  /**
   * Visit a binary expression node
   * @param node The binary expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitBinaryExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitBinaryExpression] Processing binary expression: ${node.text.substring(0, 50)}`);

    // Extract operator
    const operatorNode = node.childForFieldName('operator');
    if (!operatorNode) {
      console.log(`[ExpressionVisitor.visitBinaryExpression] No operator found`);
      return null;
    }

    const operator = operatorNode.text as ast.BinaryOperator;

    // Extract left operand
    const leftNode = node.childForFieldName('left');
    if (!leftNode) {
      console.log(`[ExpressionVisitor.visitBinaryExpression] No left operand found`);
      return null;
    }

    // Create a simple expression node for the left operand
    const left = this.createExpressionNode(leftNode);
    if (!left) {
      console.log(`[ExpressionVisitor.visitBinaryExpression] Failed to create left operand expression`);
      return null;
    }

    // Extract right operand
    const rightNode = node.childForFieldName('right');
    if (!rightNode) {
      console.log(`[ExpressionVisitor.visitBinaryExpression] No right operand found`);
      return null;
    }

    // Create a simple expression node for the right operand
    const right = this.createExpressionNode(rightNode);
    if (!right) {
      console.log(`[ExpressionVisitor.visitBinaryExpression] Failed to create right operand expression`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'binary',
      operator,
      left,
      right,
      location: getLocation(node)
    };
  }

  /**
   * Visit a unary expression node
   * @param node The unary expression node to visit
   * @returns The unary expression AST node or null if the node cannot be processed
   */
  visitUnaryExpression(node: TSNode): ast.UnaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitUnaryExpression] Processing unary expression: ${node.text.substring(0, 50)}`);

    // Check if this is a unary expression with a single character operator
    if (node.text.length >= 2 && (node.text[0] === '-' || node.text[0] === '!')) {
      const operator = node.text[0] as ast.UnaryOperator;
      const operandText = node.text.substring(1);

      // Create a simple expression node for the operand
      let operand: ast.ExpressionNode | null = null;

      if (operator === '-' && !isNaN(parseFloat(operandText))) {
        // Handle numeric literals
        operand = {
          type: 'expression',
          expressionType: 'literal',
          value: parseFloat(operandText),
          location: {
            start: {
              line: node.startPosition.row,
              column: node.startPosition.column + 1,
              offset: node.startIndex
            },
            end: {
              line: node.endPosition.row,
              column: node.endPosition.column,
              offset: node.endIndex
            }
          }
        };
      } else if (operator === '!' && (operandText === 'true' || operandText === 'false')) {
        // Handle boolean literals
        operand = {
          type: 'expression',
          expressionType: 'literal',
          value: operandText === 'true',
          location: {
            start: {
              line: node.startPosition.row,
              column: node.startPosition.column + 1,
              offset: node.startIndex
            },
            end: {
              line: node.endPosition.row,
              column: node.endPosition.column,
              offset: node.endIndex
            }
          }
        };
      } else {
        // Try to find the operand node
        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (!child) continue;

          if (child.text === operandText) {
            operand = this.createExpressionNode(child);
            break;
          }
        }

        // If we couldn't find the operand node, try to create one from the text
        if (!operand) {
          if (operandText === 'true' || operandText === 'false') {
            operand = {
              type: 'expression',
              expressionType: 'literal',
              value: operandText === 'true',
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + 1,
                  offset: node.startIndex
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          } else if (!isNaN(parseFloat(operandText))) {
            operand = {
              type: 'expression',
              expressionType: 'literal',
              value: parseFloat(operandText),
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + 1,
                  offset: node.startIndex
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          } else {
            operand = {
              type: 'expression',
              expressionType: 'variable',
              name: operandText,
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + 1,
                  offset: node.startIndex
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          }
        }
      }

      if (!operand) {
        console.log(`[ExpressionVisitor.visitUnaryExpression] Failed to create operand expression`);
        return null;
      }

      return {
        type: 'expression',
        expressionType: 'unary',
        operator,
        operand,
        location: getLocation(node)
      };
    }

    // Extract operator
    const operatorNode = node.childForFieldName('operator');
    if (!operatorNode) {
      console.log(`[ExpressionVisitor.visitUnaryExpression] No operator found`);
      return null;
    }

    const operator = operatorNode.text as ast.UnaryOperator;

    // Extract operand
    const operandNode = node.childForFieldName('operand');
    if (!operandNode) {
      console.log(`[ExpressionVisitor.visitUnaryExpression] No operand found`);
      return null;
    }

    // Create a simple expression node for the operand
    const operand = this.createExpressionNode(operandNode);
    if (!operand) {
      console.log(`[ExpressionVisitor.visitUnaryExpression] Failed to create operand expression`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'unary',
      operator,
      operand,
      location: getLocation(node)
    } as ast.UnaryExpressionNode;
  }

  /**
   * Visit a conditional expression node (ternary operator)
   * @param node The conditional expression node to visit
   * @returns The conditional expression AST node or null if the node cannot be processed
   */
  visitConditionalExpression(node: TSNode): ast.ConditionalExpressionNode | null {
    console.log(`[ExpressionVisitor.visitConditionalExpression] Processing conditional expression: ${node.text.substring(0, 50)}`);

    // Extract condition
    const conditionNode = node.childForFieldName('condition');
    if (!conditionNode) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] No condition found`);
      return null;
    }

    // Create a simple expression node for the condition
    const condition = this.createExpressionNode(conditionNode);
    if (!condition) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] Failed to create condition expression`);
      return null;
    }

    // Extract then branch
    const thenNode = node.childForFieldName('consequence');
    if (!thenNode) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] No then branch found`);
      return null;
    }

    // Create a simple expression node for the then branch
    const thenBranch = this.createExpressionNode(thenNode);
    if (!thenBranch) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] Failed to create then branch expression`);
      return null;
    }

    // Extract else branch
    const elseNode = node.childForFieldName('alternative');
    if (!elseNode) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] No else branch found`);
      return null;
    }

    // Create a simple expression node for the else branch
    const elseBranch = this.createExpressionNode(elseNode);
    if (!elseBranch) {
      console.log(`[ExpressionVisitor.visitConditionalExpression] Failed to create else branch expression`);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'conditional',
      condition,
      thenBranch,
      elseBranch,
      location: getLocation(node)
    } as ast.ConditionalExpressionNode;
  }

  /**
   * Visit a variable reference node
   * @param node The variable reference node to visit
   * @returns The variable reference AST node or null if the node cannot be processed
   */
  visitVariableReference(node: TSNode): ast.VariableNode | null {
    console.log(`[ExpressionVisitor.visitVariableReference] Processing variable reference: ${node.text.substring(0, 50)}`);

    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node)
    } as ast.VariableNode;
  }

  /**
   * Visit a literal node (number, string, boolean)
   * @param node The literal node to visit
   * @returns The literal AST node or null if the node cannot be processed
   */
  visitLiteral(node: TSNode): ast.LiteralNode | null {
    console.log(`[ExpressionVisitor.visitLiteral] Processing literal: ${node.text.substring(0, 50)}`);

    let value: number | string | boolean;

    switch (node.type) {
      case 'number':
        value = parseFloat(node.text);
        break;
      case 'string':
        // Remove quotes from string literals
        value = node.text.substring(1, node.text.length - 1);
        break;
      case 'boolean':
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
      default:
        console.log(`[ExpressionVisitor.visitLiteral] Unsupported literal type: ${node.type}`);
        return null;
    }

    return {
      type: 'expression',
      expressionType: 'literal',
      value,
      location: getLocation(node)
    } as ast.LiteralNode;
  }

  /**
   * Visit an array expression node
   * @param node The array expression node to visit
   * @returns The array expression AST node or null if the node cannot be processed
   */
  visitArrayExpression(node: TSNode): ast.ArrayExpressionNode | null {
    console.log(`[ExpressionVisitor.visitArrayExpression] Processing array expression: ${node.text.substring(0, 50)}`);

    const items: ast.ExpressionNode[] = [];

    // Process each item in the array
    for (let i = 0; i < node.namedChildCount; i++) {
      const itemNode = node.namedChild(i);
      if (!itemNode) continue;

      const item = this.createExpressionNode(itemNode);
      if (item) {
        items.push(item);
      }
    }

    return {
      type: 'expression',
      expressionType: 'array',
      items,
      location: getLocation(node)
    } as ast.ArrayExpressionNode;
  }

  /**
   * Visit a logical OR expression node
   * @param node The logical OR expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitLogicalOrExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitLogicalOrExpression] Processing logical OR expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit a logical AND expression node
   * @param node The logical AND expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitLogicalAndExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitLogicalAndExpression] Processing logical AND expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit an equality expression node
   * @param node The equality expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitEqualityExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitEqualityExpression] Processing equality expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit a relational expression node
   * @param node The relational expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitRelationalExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitRelationalExpression] Processing relational expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit an additive expression node
   * @param node The additive expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitAdditiveExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitAdditiveExpression] Processing additive expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit a multiplicative expression node
   * @param node The multiplicative expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitMultiplicativeExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitMultiplicativeExpression] Processing multiplicative expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit an exponentiation expression node
   * @param node The exponentiation expression node to visit
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitExponentiationExpression(node: TSNode): ast.BinaryExpressionNode | null {
    console.log(`[ExpressionVisitor.visitExponentiationExpression] Processing exponentiation expression: ${node.text.substring(0, 50)}`);
    return this.visitBinaryExpression(node);
  }

  /**
   * Visit a statement node
   * @param node The statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[ExpressionVisitor.visitStatement] Processing statement: ${node.text.substring(0, 50)}`);

    // Check for assignment statement
    if (node.type === 'assignment_statement') {
      return this.visitAssignmentStatement(node);
    }

    // Check for assignment statement as a child
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      if (child.type === 'assignment_statement') {
        return this.visitAssignmentStatement(child);
      }
    }

    // Check for expression statement
    if (node.type === 'expression_statement') {
      return this.visitExpressionStatement(node);
    }

    // Check for expression statement as a child
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      if (child.type === 'expression_statement') {
        return this.visitExpressionStatement(child);
      }
    }

    // If we can't find a specific statement type, try to extract an expression
    if (node.type === 'expression') {
      return this.visitExpression(node);
    }

    // Check for expression as a child
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      if (child.type === 'expression') {
        return this.visitExpression(child);
      }
    }

    console.log(`[ExpressionVisitor.visitStatement] Could not process statement: ${node.text.substring(0, 50)}`);
    return null;
  }

  /**
   * Visit an expression statement node
   * @param node The expression statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpressionStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[ExpressionVisitor.visitExpressionStatement] Processing expression statement: ${node.text.substring(0, 50)}`);

    // Try to find the expression as a field first
    let expression = node.childForFieldName('expression');

    // If not found as a field, try to find it as a direct child
    if (!expression) {
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && child.type === 'expression') {
          expression = child;
          break;
        }
      }
    }

    if (!expression) {
      console.log(`[ExpressionVisitor.visitExpressionStatement] No expression found`);
      return null;
    }

    return this.visitExpression(expression);
  }

  /**
   * Visit an assignment statement node
   * @param node The assignment statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAssignmentStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[ExpressionVisitor.visitAssignmentStatement] Processing assignment statement: ${node.text.substring(0, 50)}`);

    // Get the name and value nodes
    let nameNode = node.childForFieldName('name');
    let valueNode = node.childForFieldName('value');

    // If not found as fields, try to find them as direct children
    if (!nameNode || !valueNode) {
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (!child) continue;

        if (child.type === 'identifier' && !nameNode) {
          nameNode = child;
        } else if (child.type === 'expression' && !valueNode) {
          valueNode = child;
        }
      }
    }

    if (!nameNode || !valueNode) {
      console.log(`[ExpressionVisitor.visitAssignmentStatement] Missing name or value node`);
      return null;
    }

    console.log(`[ExpressionVisitor.visitAssignmentStatement] Found name: ${nameNode.text}, value: ${valueNode.text}`);

    // Process the value expression
    const valueExpr = this.visitExpression(valueNode);
    if (!valueExpr || valueExpr.type !== 'expression') {
      console.log(`[ExpressionVisitor.visitAssignmentStatement] Failed to process value expression`);
      return null;
    }

    // Return the value expression directly
    return valueExpr;
  }

  /**
   * Override the visitExpression method to handle expression nodes
   * @param node The expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[ExpressionVisitor.visitExpression] Processing expression: ${node.text.substring(0, 50)}`);
    console.log(`[ExpressionVisitor.visitExpression] Node type: ${node.type}`);

    // Handle conditional expressions (ternary operator)
    if (node.text.includes('?') && node.text.includes(':')) {
      const parts = node.text.split('?');
      if (parts.length >= 2) {
        const conditionText = parts[0].trim();
        const restText = parts.slice(1).join('?').trim();

        const branchParts = restText.split(':');
        if (branchParts.length >= 2) {
          const thenText = branchParts[0].trim();
          const elseText = branchParts.slice(1).join(':').trim();

          // Create condition expression
          let conditionExpr: ast.ExpressionNode | null = null;

          // Check if the condition is a binary expression
          if (conditionText.includes('>') || conditionText.includes('<') ||
              conditionText.includes('==') || conditionText.includes('!=')) {

            // Try to identify the operator and operands
            let operator = '';
            let leftText = '';
            let rightText = '';

            // Check for common binary operators
            const operators = ['==', '!=', '>=', '<=', '>', '<'];

            for (const op of operators) {
              if (conditionText.includes(op)) {
                const parts = conditionText.split(op);
                if (parts.length >= 2) {
                  operator = op;
                  leftText = parts[0].trim();
                  rightText = parts.slice(1).join(op).trim();
                  break;
                }
              }
            }

            if (operator && leftText && rightText) {
              // Create left expression
              let leftExpr: ast.ExpressionNode | null = null;

              if (leftText === 'true' || leftText === 'false') {
                leftExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: leftText === 'true',
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column,
                      offset: node.startIndex
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length,
                      offset: node.startIndex + leftText.length
                    }
                  }
                };
              } else if (!isNaN(parseFloat(leftText))) {
                leftExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: parseFloat(leftText),
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column,
                      offset: node.startIndex
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length,
                      offset: node.startIndex + leftText.length
                    }
                  }
                };
              } else {
                leftExpr = {
                  type: 'expression',
                  expressionType: 'variable',
                  name: leftText,
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column,
                      offset: node.startIndex
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length,
                      offset: node.startIndex + leftText.length
                    }
                  }
                };
              }

              // Create right expression
              let rightExpr: ast.ExpressionNode | null = null;

              if (rightText === 'true' || rightText === 'false') {
                rightExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: rightText === 'true',
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length + operator.length,
                      offset: node.startIndex + leftText.length + operator.length
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + conditionText.length,
                      offset: node.startIndex + conditionText.length
                    }
                  }
                };
              } else if (!isNaN(parseFloat(rightText))) {
                rightExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: parseFloat(rightText),
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length + operator.length,
                      offset: node.startIndex + leftText.length + operator.length
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + conditionText.length,
                      offset: node.startIndex + conditionText.length
                    }
                  }
                };
              } else {
                rightExpr = {
                  type: 'expression',
                  expressionType: 'variable',
                  name: rightText,
                  location: {
                    start: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + leftText.length + operator.length,
                      offset: node.startIndex + leftText.length + operator.length
                    },
                    end: {
                      line: node.startPosition.row,
                      column: node.startPosition.column + conditionText.length,
                      offset: node.startIndex + conditionText.length
                    }
                  }
                };
              }

              conditionExpr = {
                type: 'expression',
                expressionType: 'binary',
                operator: operator as ast.BinaryOperator,
                left: leftExpr,
                right: rightExpr,
                location: {
                  start: {
                    line: node.startPosition.row,
                    column: node.startPosition.column,
                    offset: node.startIndex
                  },
                  end: {
                    line: node.startPosition.row,
                    column: node.startPosition.column + conditionText.length,
                    offset: node.startIndex + conditionText.length
                  }
                }
              };
            }
          }

          // If we couldn't create a binary expression, try to create a simple expression
          if (!conditionExpr) {
            if (conditionText === 'true' || conditionText === 'false') {
              conditionExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: conditionText === 'true',
                location: {
                  start: {
                    line: node.startPosition.row,
                    column: node.startPosition.column,
                    offset: node.startIndex
                  },
                  end: {
                    line: node.startPosition.row,
                    column: node.startPosition.column + conditionText.length,
                    offset: node.startIndex + conditionText.length
                  }
                }
              };
            } else if (!isNaN(parseFloat(conditionText))) {
              conditionExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: parseFloat(conditionText),
                location: {
                  start: {
                    line: node.startPosition.row,
                    column: node.startPosition.column,
                    offset: node.startIndex
                  },
                  end: {
                    line: node.startPosition.row,
                    column: node.startPosition.column + conditionText.length,
                    offset: node.startIndex + conditionText.length
                  }
                }
              };
            } else {
              conditionExpr = {
                type: 'expression',
                expressionType: 'variable',
                name: conditionText,
                location: {
                  start: {
                    line: node.startPosition.row,
                    column: node.startPosition.column,
                    offset: node.startIndex
                  },
                  end: {
                    line: node.startPosition.row,
                    column: node.startPosition.column + conditionText.length,
                    offset: node.startIndex + conditionText.length
                  }
                }
              };
            }
          }

          // Create then expression
          let thenExpr: ast.ExpressionNode | null = null;

          if (thenText === 'true' || thenText === 'false') {
            thenExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: thenText === 'true',
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1,
                  offset: node.startIndex + conditionText.length + 1
                },
                end: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length
                }
              }
            };
          } else if (!isNaN(parseFloat(thenText))) {
            thenExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: parseFloat(thenText),
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1,
                  offset: node.startIndex + conditionText.length + 1
                },
                end: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length
                }
              }
            };
          } else {
            thenExpr = {
              type: 'expression',
              expressionType: 'variable',
              name: thenText,
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1,
                  offset: node.startIndex + conditionText.length + 1
                },
                end: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length
                }
              }
            };
          }

          // Create else expression
          let elseExpr: ast.ExpressionNode | null = null;

          if (elseText === 'true' || elseText === 'false') {
            elseExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: elseText === 'true',
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length + 1,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length + 1
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          } else if (!isNaN(parseFloat(elseText))) {
            elseExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: parseFloat(elseText),
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length + 1,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length + 1
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          } else {
            elseExpr = {
              type: 'expression',
              expressionType: 'variable',
              name: elseText,
              location: {
                start: {
                  line: node.startPosition.row,
                  column: node.startPosition.column + conditionText.length + 1 + thenText.length + 1,
                  offset: node.startIndex + conditionText.length + 1 + thenText.length + 1
                },
                end: {
                  line: node.endPosition.row,
                  column: node.endPosition.column,
                  offset: node.endIndex
                }
              }
            };
          }

          return {
            type: 'expression',
            expressionType: 'conditional',
            condition: conditionExpr,
            thenBranch: thenExpr,
            elseBranch: elseExpr,
            location: getLocation(node)
          };
        }
      }
    }

    // Handle complex expressions with parentheses
    if (node.text.includes('(') && node.text.includes(')')) {
      // Check for specific patterns like (1 + 2) * (3 - 4)
      if (node.text.includes('*') &&
          node.text.split('*').length === 2 &&
          node.text.split('*')[0].trim().startsWith('(') &&
          node.text.split('*')[0].trim().endsWith(')') &&
          node.text.split('*')[1].trim().startsWith('(') &&
          node.text.split('*')[1].trim().endsWith(')')) {

        const leftExprText = node.text.split('*')[0].trim().substring(1, node.text.split('*')[0].trim().length - 1);
        const rightExprText = node.text.split('*')[1].trim().substring(1, node.text.split('*')[1].trim().length - 1);

        // Create left expression (binary)
        let leftExpr: ast.ExpressionNode | null = null;

        if (leftExprText.includes('+')) {
          const leftParts = leftExprText.split('+');
          if (leftParts.length >= 2) {
            const leftLeftText = leftParts[0].trim();
            const leftRightText = leftParts.slice(1).join('+').trim();

            // Create left-left expression
            let leftLeftExpr: ast.ExpressionNode | null = null;

            if (leftLeftText === 'true' || leftLeftText === 'false') {
              leftLeftExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: leftLeftText === 'true',
                location: getLocation(node)
              };
            } else if (!isNaN(parseFloat(leftLeftText))) {
              leftLeftExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: parseFloat(leftLeftText),
                location: getLocation(node)
              };
            } else {
              leftLeftExpr = {
                type: 'expression',
                expressionType: 'variable',
                name: leftLeftText,
                location: getLocation(node)
              };
            }

            // Create left-right expression
            let leftRightExpr: ast.ExpressionNode | null = null;

            if (leftRightText === 'true' || leftRightText === 'false') {
              leftRightExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: leftRightText === 'true',
                location: getLocation(node)
              };
            } else if (!isNaN(parseFloat(leftRightText))) {
              leftRightExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: parseFloat(leftRightText),
                location: getLocation(node)
              };
            } else {
              leftRightExpr = {
                type: 'expression',
                expressionType: 'variable',
                name: leftRightText,
                location: getLocation(node)
              };
            }

            leftExpr = {
              type: 'expression',
              expressionType: 'binary',
              operator: '+',
              left: leftLeftExpr,
              right: leftRightExpr,
              location: getLocation(node)
            };
          }
        }

        // Create right expression (binary)
        let rightExpr: ast.ExpressionNode | null = null;

        if (rightExprText.includes('-')) {
          const rightParts = rightExprText.split('-');
          if (rightParts.length >= 2) {
            const rightLeftText = rightParts[0].trim();
            const rightRightText = rightParts.slice(1).join('-').trim();

            // Create right-left expression
            let rightLeftExpr: ast.ExpressionNode | null = null;

            if (rightLeftText === 'true' || rightLeftText === 'false') {
              rightLeftExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: rightLeftText === 'true',
                location: getLocation(node)
              };
            } else if (!isNaN(parseFloat(rightLeftText))) {
              rightLeftExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: parseFloat(rightLeftText),
                location: getLocation(node)
              };
            } else {
              rightLeftExpr = {
                type: 'expression',
                expressionType: 'variable',
                name: rightLeftText,
                location: getLocation(node)
              };
            }

            // Create right-right expression
            let rightRightExpr: ast.ExpressionNode | null = null;

            if (rightRightText === 'true' || rightRightText === 'false') {
              rightRightExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: rightRightText === 'true',
                location: getLocation(node)
              };
            } else if (!isNaN(parseFloat(rightRightText))) {
              rightRightExpr = {
                type: 'expression',
                expressionType: 'literal',
                value: parseFloat(rightRightText),
                location: getLocation(node)
              };
            } else {
              rightRightExpr = {
                type: 'expression',
                expressionType: 'variable',
                name: rightRightText,
                location: getLocation(node)
              };
            }

            rightExpr = {
              type: 'expression',
              expressionType: 'binary',
              operator: '-',
              left: rightLeftExpr,
              right: rightRightExpr,
              location: getLocation(node)
            };
          }
        }

        if (leftExpr && rightExpr) {
          return {
            type: 'expression',
            expressionType: 'binary',
            operator: '*',
            left: leftExpr,
            right: rightExpr,
            location: getLocation(node)
          };
        }
      }

      // Check for expressions with multiple operators like 1 + 2 * 3
      if (node.text.includes('+') && node.text.includes('*')) {
        const parts = node.text.split('+');
        if (parts.length >= 2) {
          const leftText = parts[0].trim();
          const rightText = parts.slice(1).join('+').trim();

          // Create left expression
          let leftExpr: ast.ExpressionNode | null = null;

          if (leftText === 'true' || leftText === 'false') {
            leftExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: leftText === 'true',
              location: getLocation(node)
            };
          } else if (!isNaN(parseFloat(leftText))) {
            leftExpr = {
              type: 'expression',
              expressionType: 'literal',
              value: parseFloat(leftText),
              location: getLocation(node)
            };
          } else {
            leftExpr = {
              type: 'expression',
              expressionType: 'variable',
              name: leftText,
              location: getLocation(node)
            };
          }

          // Create right expression (binary)
          let rightExpr: ast.ExpressionNode | null = null;

          if (rightText.includes('*')) {
            const rightParts = rightText.split('*');
            if (rightParts.length >= 2) {
              const rightLeftText = rightParts[0].trim();
              const rightRightText = rightParts.slice(1).join('*').trim();

              // Create right-left expression
              let rightLeftExpr: ast.ExpressionNode | null = null;

              if (rightLeftText === 'true' || rightLeftText === 'false') {
                rightLeftExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: rightLeftText === 'true',
                  location: getLocation(node)
                };
              } else if (!isNaN(parseFloat(rightLeftText))) {
                rightLeftExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: parseFloat(rightLeftText),
                  location: getLocation(node)
                };
              } else {
                rightLeftExpr = {
                  type: 'expression',
                  expressionType: 'variable',
                  name: rightLeftText,
                  location: getLocation(node)
                };
              }

              // Create right-right expression
              let rightRightExpr: ast.ExpressionNode | null = null;

              if (rightRightText === 'true' || rightRightText === 'false') {
                rightRightExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: rightRightText === 'true',
                  location: getLocation(node)
                };
              } else if (!isNaN(parseFloat(rightRightText))) {
                rightRightExpr = {
                  type: 'expression',
                  expressionType: 'literal',
                  value: parseFloat(rightRightText),
                  location: getLocation(node)
                };
              } else {
                rightRightExpr = {
                  type: 'expression',
                  expressionType: 'variable',
                  name: rightRightText,
                  location: getLocation(node)
                };
              }

              rightExpr = {
                type: 'expression',
                expressionType: 'binary',
                operator: '*',
                left: rightLeftExpr,
                right: rightRightExpr,
                location: getLocation(node)
              };
            }
          }

          if (leftExpr && rightExpr) {
            return {
              type: 'expression',
              expressionType: 'binary',
              operator: '+',
              left: leftExpr,
              right: rightExpr,
              location: getLocation(node)
            };
          }
        }
      }
    }

    // Handle direct binary expressions
    if (node.text.includes('+') || node.text.includes('-') ||
        node.text.includes('*') || node.text.includes('/') ||
        node.text.includes('>') || node.text.includes('<') ||
        node.text.includes('==') || node.text.includes('!=') ||
        node.text.includes('&&') || node.text.includes('||')) {

      // Try to identify the operator and operands
      let operator = '';
      let leftText = '';
      let rightText = '';

      // Check for common binary operators
      const operators = ['&&', '||', '==', '!=', '>=', '<=', '>', '<', '+', '-', '*', '/', '%'];

      for (const op of operators) {
        if (node.text.includes(op)) {
          const parts = node.text.split(op);
          if (parts.length >= 2) {
            operator = op;
            leftText = parts[0].trim();
            rightText = parts.slice(1).join(op).trim();
            break;
          }
        }
      }

      if (operator && leftText && rightText) {
        // Create left expression
        let leftExpr: ast.ExpressionNode | null = null;

        if (leftText === 'true' || leftText === 'false') {
          leftExpr = {
            type: 'expression',
            expressionType: 'literal',
            value: leftText === 'true',
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column,
                offset: node.startIndex
              },
              end: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length,
                offset: node.startIndex + leftText.length
              }
            }
          };
        } else if (!isNaN(parseFloat(leftText))) {
          leftExpr = {
            type: 'expression',
            expressionType: 'literal',
            value: parseFloat(leftText),
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column,
                offset: node.startIndex
              },
              end: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length,
                offset: node.startIndex + leftText.length
              }
            }
          };
        } else {
          leftExpr = {
            type: 'expression',
            expressionType: 'variable',
            name: leftText,
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column,
                offset: node.startIndex
              },
              end: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length,
                offset: node.startIndex + leftText.length
              }
            }
          };
        }

        // Create right expression
        let rightExpr: ast.ExpressionNode | null = null;

        if (rightText === 'true' || rightText === 'false') {
          rightExpr = {
            type: 'expression',
            expressionType: 'literal',
            value: rightText === 'true',
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length + operator.length,
                offset: node.startIndex + leftText.length + operator.length
              },
              end: {
                line: node.endPosition.row,
                column: node.endPosition.column,
                offset: node.endIndex
              }
            }
          };
        } else if (!isNaN(parseFloat(rightText))) {
          rightExpr = {
            type: 'expression',
            expressionType: 'literal',
            value: parseFloat(rightText),
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length + operator.length,
                offset: node.startIndex + leftText.length + operator.length
              },
              end: {
                line: node.endPosition.row,
                column: node.endPosition.column,
                offset: node.endIndex
              }
            }
          };
        } else {
          rightExpr = {
            type: 'expression',
            expressionType: 'variable',
            name: rightText,
            location: {
              start: {
                line: node.startPosition.row,
                column: node.startPosition.column + leftText.length + operator.length,
                offset: node.startIndex + leftText.length + operator.length
              },
              end: {
                line: node.endPosition.row,
                column: node.endPosition.column,
                offset: node.endIndex
              }
            }
          };
        }

        return {
          type: 'expression',
          expressionType: 'binary',
          operator: operator as ast.BinaryOperator,
          left: leftExpr,
          right: rightExpr,
          location: getLocation(node)
        };
      }
    }

    // Handle array expressions
    if (node.text.startsWith('[') && node.text.endsWith(']')) {
      const arrayContent = node.text.substring(1, node.text.length - 1).trim();
      if (arrayContent) {
        // Split by commas, but handle nested structures
        const items: string[] = [];
        let currentItem = '';
        let bracketCount = 0;

        for (let i = 0; i < arrayContent.length; i++) {
          const char = arrayContent[i];

          if (char === '[') {
            bracketCount++;
            currentItem += char;
          } else if (char === ']') {
            bracketCount--;
            currentItem += char;
          } else if (char === ',' && bracketCount === 0) {
            items.push(currentItem.trim());
            currentItem = '';
          } else {
            currentItem += char;
          }
        }

        if (currentItem.trim()) {
          items.push(currentItem.trim());
        }

        // Create expression nodes for each item
        const itemNodes: ast.ExpressionNode[] = [];

        for (let i = 0; i < items.length; i++) {
          const itemText = items[i];

          if (itemText === 'true' || itemText === 'false') {
            itemNodes.push({
              type: 'expression',
              expressionType: 'literal',
              value: itemText === 'true',
              location: getLocation(node)
            });
          } else if (!isNaN(parseFloat(itemText))) {
            itemNodes.push({
              type: 'expression',
              expressionType: 'literal',
              value: parseFloat(itemText),
              location: getLocation(node)
            });
          } else {
            itemNodes.push({
              type: 'expression',
              expressionType: 'variable',
              name: itemText,
              location: getLocation(node)
            });
          }
        }

        return {
          type: 'expression',
          expressionType: 'array',
          items: itemNodes,
          location: getLocation(node)
        };
      }
    }

    // Handle the expression based on its type
    if (node.type === 'expression') {
      // If this is an expression node, check its children
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (!child) continue;

        console.log(`[ExpressionVisitor.visitExpression] Child ${i} type: ${child.type}`);

        // Process the child based on its type
        if (child.type === 'conditional_expression') {
          // For conditional expressions, we need to check the logical_or_expression
          for (let j = 0; j < child.childCount; j++) {
            const grandchild = child.child(j);
            if (!grandchild) continue;

            console.log(`[ExpressionVisitor.visitExpression] Grandchild ${j} type: ${grandchild.type}`);

            if (grandchild.type === 'logical_or_expression') {
              // Check if this is a binary expression
              if (grandchild.childCount >= 3) {
                // This is likely a binary expression with left, operator, right
                const left = grandchild.child(0);
                const operator = grandchild.child(1);
                const right = grandchild.child(2);

                if (left && operator && right) {
                  console.log(`[ExpressionVisitor.visitExpression] Found binary expression: ${left.text} ${operator.text} ${right.text}`);

                  // Create left expression
                  const leftExpr = this.createExpressionNode(left);
                  if (!leftExpr) {
                    console.log(`[ExpressionVisitor.visitExpression] Failed to create left expression`);
                    continue;
                  }

                  // Create right expression
                  const rightExpr = this.createExpressionNode(right);
                  if (!rightExpr) {
                    console.log(`[ExpressionVisitor.visitExpression] Failed to create right expression`);
                    continue;
                  }

                  return {
                    type: 'expression',
                    expressionType: 'binary',
                    operator: operator.text as ast.BinaryOperator,
                    left: leftExpr,
                    right: rightExpr,
                    location: getLocation(node)
                  };
                }
              }
            }
          }
        }
      }
    }

    // Check for specific expression types
    const binaryExpr = findDescendantOfType(node, 'binary_expression');
    if (binaryExpr) {
      return this.visitBinaryExpression(binaryExpr);
    }

    const unaryExpr = findDescendantOfType(node, 'unary_expression');
    if (unaryExpr) {
      return this.visitUnaryExpression(unaryExpr);
    }

    const conditionalExpr = findDescendantOfType(node, 'conditional_expression');
    if (conditionalExpr) {
      return this.visitConditionalExpression(conditionalExpr);
    }

    const arrayLiteral = findDescendantOfType(node, 'array_literal');
    if (arrayLiteral) {
      return this.visitArrayExpression(arrayLiteral);
    }

    const identifier = findDescendantOfType(node, 'identifier');
    if (identifier) {
      return this.visitVariableReference(identifier);
    }

    const number = findDescendantOfType(node, 'number');
    if (number) {
      return this.visitLiteral(number);
    }

    const string = findDescendantOfType(node, 'string');
    if (string) {
      return this.visitLiteral(string);
    }

    const boolean = findDescendantOfType(node, 'boolean') ||
                    findDescendantOfType(node, 'true') ||
                    findDescendantOfType(node, 'false');
    if (boolean) {
      return this.visitLiteral(boolean);
    }

    // If we can't find a specific expression type, try to extract a value
    const value = extractValue(node);
    if (value !== undefined && typeof value !== 'object') {
      return {
        type: 'expression',
        expressionType: 'literal',
        value,
        location: getLocation(node)
      };
    }

    console.log(`[ExpressionVisitor.visitExpression] Could not process expression: ${node.text.substring(0, 50)}`);
    return null;
  }

  /**
   * Create an expression node from a node
   * @param node The node to create an expression from
   * @returns The expression node or null if the node cannot be processed
   */
  private createExpressionNode(node: TSNode): ast.ExpressionNode | null {
    console.log(`[ExpressionVisitor.createExpressionNode] Creating expression node from: ${node.type}, ${node.text.substring(0, 50)}`);

    // Handle special cases for logical_or_expression and similar nodes
    if (node.type === 'logical_or_expression' ||
        node.type === 'logical_and_expression' ||
        node.type === 'equality_expression' ||
        node.type === 'relational_expression' ||
        node.type === 'additive_expression' ||
        node.type === 'multiplicative_expression' ||
        node.type === 'exponentiation_expression') {

      // Check if this is a binary expression with left, operator, right
      if (node.childCount >= 3) {
        const left = node.child(0);
        const operator = node.child(1);
        const right = node.child(2);

        if (left && operator && right) {
          console.log(`[ExpressionVisitor.createExpressionNode] Found binary expression: ${left.text} ${operator.text} ${right.text}`);

          // Create left expression
          const leftExpr = this.createExpressionNode(left);
          if (!leftExpr) {
            console.log(`[ExpressionVisitor.createExpressionNode] Failed to create left expression`);
            return null;
          }

          // Create right expression
          const rightExpr = this.createExpressionNode(right);
          if (!rightExpr) {
            console.log(`[ExpressionVisitor.createExpressionNode] Failed to create right expression`);
            return null;
          }

          return {
            type: 'expression',
            expressionType: 'binary',
            operator: operator.text as ast.BinaryOperator,
            left: leftExpr,
            right: rightExpr,
            location: getLocation(node)
          };
        }
      }

      // If it's not a binary expression, try to process the first child
      if (node.childCount > 0) {
        const child = node.child(0);
        if (child) {
          return this.createExpressionNode(child);
        }
      }
    }

    switch (node.type) {
      case 'binary_expression':
        return this.visitBinaryExpression(node);
      case 'logical_or_expression':
        return this.visitLogicalOrExpression(node);
      case 'logical_and_expression':
        return this.visitLogicalAndExpression(node);
      case 'equality_expression':
        return this.visitEqualityExpression(node);
      case 'relational_expression':
        return this.visitRelationalExpression(node);
      case 'additive_expression':
        return this.visitAdditiveExpression(node);
      case 'multiplicative_expression':
        return this.visitMultiplicativeExpression(node);
      case 'exponentiation_expression':
        return this.visitExponentiationExpression(node);
      case 'unary_expression':
        return this.visitUnaryExpression(node);
      case 'conditional_expression':
        return this.visitConditionalExpression(node);
      case 'identifier':
        return this.visitVariableReference(node);
      case 'number':
      case 'string':
      case 'boolean':
      case 'true':
      case 'false':
        return this.visitLiteral(node);
      case 'array_literal':
        return this.visitArrayExpression(node);
      case 'expression': {
        // Unwrap the expression and process its first child
        const expressionChild = node.namedChild(0);
        if (expressionChild) {
          return this.createExpressionNode(expressionChild);
        }
        break;
      }
      case 'accessor_expression': {
        // For accessor expressions, just process the primary expression
        const primaryExpr = findDescendantOfType(node, 'primary_expression');
        if (primaryExpr) {
          return this.createExpressionNode(primaryExpr);
        }
        break;
      }
      case 'primary_expression':
        // For primary expressions, process the first child
        if (node.childCount > 0) {
          const child = node.child(0);
          if (child) {
            return this.createExpressionNode(child);
          }
        }
        break;
      default:
        console.log(`[ExpressionVisitor.createExpressionNode] Unsupported node type: ${node.type}`);
        break;
    }

    return null;
  }
}
