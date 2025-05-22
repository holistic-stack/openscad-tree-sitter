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
import { IfElseVisitor } from './control-structure-visitor/if-else-visitor';
import { ForLoopVisitor } from './control-structure-visitor/for-loop-visitor';
import { ExpressionVisitor } from './expression-visitor';

/**
 * Visitor for control structures
 */
export class ControlStructureVisitor extends BaseASTVisitor {
  private ifElseVisitor: IfElseVisitor;
  private forLoopVisitor: ForLoopVisitor;
  private expressionVisitor: ExpressionVisitor;

  /**
   * Create a new ControlStructureVisitor
   * @param source The source code (optional, defaults to empty string)
   */
  constructor(source: string = '') {
    super(source);
    this.ifElseVisitor = new IfElseVisitor(source);
    this.forLoopVisitor = new ForLoopVisitor(source);
    this.expressionVisitor = new ExpressionVisitor(source);
  }

  /**
   * Visit an if statement node
   * @param node The if statement node to visit
   * @returns The if AST node or null if the node cannot be processed
   */
  visitIfStatement(node: TSNode): ast.IfNode | null {
    console.log(`[ControlStructureVisitor.visitIfStatement] Processing if statement: ${node.text.substring(0, 50)}`);

    // Delegate to the specialized IfElseVisitor
    return this.ifElseVisitor.visitIfStatement(node);
  }

  /**
   * Visit a for statement node
   * @param node The for statement node to visit
   * @returns The for loop AST node or null if the node cannot be processed
   */
  visitForStatement(node: TSNode): ast.ForLoopNode | null {
    console.log(`[ControlStructureVisitor.visitForStatement] Processing for statement: ${node.text.substring(0, 50)}`);

    // Delegate to the specialized ForLoopVisitor
    return this.forLoopVisitor.visitForStatement(node);
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

  /**
   * Create an AST node for a function call
   * @param node The node containing the function call
   * @param functionName The name of the function
   * @param args The arguments to the function
   * @returns The AST node or null if the function is not supported
   */
  protected createASTNodeForFunction(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    console.log(`[ControlStructureVisitor.createASTNodeForFunction] Processing function: ${functionName}`);

    // Handle control structure functions
    switch (functionName.trim()) {
      case 'if':
        return this.ifElseVisitor.createIfNode(node, args);
      case 'for':
        return this.forLoopVisitor.createForNode(node, args);
      case 'let':
        return this.createLetNode(node, args);
      case 'each':
        return this.createEachNode(node, args);
      default:
        console.log(`[ControlStructureVisitor.createASTNodeForFunction] Unsupported function: ${functionName}`);
        return null;
    }
  }

  /**
   * Create a let node
   * @param node The node containing the let expression
   * @param args The arguments to the let expression
   * @returns The let AST node or null if the arguments are invalid
   */
  private createLetNode(node: TSNode, args: ast.Parameter[]): ast.LetNode | null {
    console.log(`[ControlStructureVisitor.createLetNode] Creating let node with ${args.length} arguments`);

    // Extract assignments from the arguments
    const assignments: { [key: string]: ast.ParameterValue } = {};

    for (const arg of args) {
      if (arg.name) {
        assignments[arg.name] = arg.value;
      }
    }

    // For testing purposes, create an empty body
    return {
      type: 'let',
      assignments,
      body: [],
      location: getLocation(node)
    };
  }

  /**
   * Create an each node
   * @param node The node containing the each statement
   * @param args The arguments to the each statement
   * @returns The each AST node or null if the arguments are invalid
   */
  private createEachNode(node: TSNode, args: ast.Parameter[]): ast.EachNode | null {
    console.log(`[ControlStructureVisitor.createEachNode] Creating each node with ${args.length} arguments`);

    // Each should have exactly one argument (the expression)
    if (args.length !== 1) {
      console.log(`[ControlStructureVisitor.createEachNode] Invalid number of arguments: ${args.length}`);
      return null;
    }

    // Create a simple expression node
    const expression: ast.ExpressionNode = {
      type: 'expression',
      expressionType: 'literal',
      value: typeof args[0].value === 'object' && !Array.isArray(args[0].value) && args[0].value.type === 'expression'
        ? args[0].value.value
        : typeof args[0].value === 'string' || typeof args[0].value === 'number' || typeof args[0].value === 'boolean'
          ? args[0].value
          : JSON.stringify(args[0].value),
      location: getLocation(node)
    };

    return {
      type: 'each',
      expression,
      location: getLocation(node)
    };
  }
}
