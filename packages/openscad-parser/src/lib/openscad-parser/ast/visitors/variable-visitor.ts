/**
 * Visitor for variable assignments and references
 *
 * This visitor handles variable-related nodes in OpenSCAD, including:
 * - Variable assignments (var = value)
 * - Variable references (using variables in expressions)
 * - Special OpenSCAD variables ($fn, $fa, $fs, etc.)
 *
 * @module lib/openscad-parser/ast/visitors/variable-visitor
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { getLocation } from '../utils/location-utils';
import { findDescendantOfType } from '../utils/node-utils';
import { extractValue } from '../extractors/value-extractor';
import { isSpecialVariable, extractVariableName, isValidVariableName } from '../utils/variable-utils';
import { ErrorHandler } from '../../error-handling';

/**
 * Visitor for variable assignments and references
 */
export class VariableVisitor extends BaseASTVisitor {
  constructor(source: string, protected errorHandler: ErrorHandler) {
    super(source, errorHandler);
  }

  /**
   * Visit an assignment statement node
   * @param node The assignment statement node to visit
   * @returns The assignment AST node or null if the node cannot be processed
   */
  visitAssignmentStatement(node: TSNode): ast.AssignmentNode | ast.SpecialVariableAssignment | null {
    this.errorHandler.logInfo(
      `[VariableVisitor.visitAssignmentStatement] Processing assignment: ${node.text.substring(0, 50)}`,
      'VariableVisitor.visitAssignmentStatement',
      node
    );

    // Find the identifier (variable name)
    const identifierNode = findDescendantOfType(node, 'identifier');
    if (!identifierNode) {
      this.errorHandler.handleError(
        new Error(`No identifier found in assignment statement: ${node.text.substring(0, 100)}`),
        'VariableVisitor.visitAssignmentStatement',
        node
      );
      return null;
    }

    const variableName = extractVariableName(identifierNode);
    if (!variableName) {
      this.errorHandler.handleError(
        new Error(`Invalid variable name in assignment: ${identifierNode.text}`),
        'VariableVisitor.visitAssignmentStatement',
        node
      );
      return null;
    }

    // Validate variable name
    if (!isValidVariableName(variableName)) {
      this.errorHandler.handleError(
        new Error(`Invalid variable name format: ${variableName}`),
        'VariableVisitor.visitAssignmentStatement',
        node
      );
      return null;
    }

    // Find the value expression
    let value: ast.ExpressionNode | ast.ParameterValue | null = null;

    // Look for expression nodes that represent the value
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      // Skip the identifier and assignment operator
      if (child.type === 'identifier' || child.text === '=') {
        continue;
      }

      // Try to extract a simple value first
      const extractedValue = extractValue(child);
      if (extractedValue !== null) {
        value = extractedValue;
        break;
      }

      // If not a simple value, treat as expression
      // This would need to be handled by ExpressionVisitor
      // For now, create a simple literal expression
      if (child.type === 'number_literal' || child.type === 'string_literal' || child.type === 'boolean_literal') {
        const literalValue = extractValue(child);
        if (literalValue !== null) {
          value = {
            type: 'expression',
            expressionType: 'literal',
            value: literalValue,
            location: getLocation(child),
          } as ast.LiteralNode;
          break;
        }
      }
    }

    if (value === null) {
      this.errorHandler.handleError(
        new Error(`No value found in assignment statement: ${node.text.substring(0, 100)}`),
        'VariableVisitor.visitAssignmentStatement',
        node
      );
      return null;
    }

    // Check if this is a special variable assignment
    if (isSpecialVariable(identifierNode)) {
      return {
        type: 'specialVariableAssignment',
        variable: variableName as ast.SpecialVariable,
        value: typeof value === 'object' && 'expressionType' in value ? value.value : value,
        location: getLocation(node),
      } as ast.SpecialVariableAssignment;
    }

    // Regular variable assignment
    return {
      type: 'assignment',
      variable: variableName,
      value: value,
      location: getLocation(node),
    } as ast.AssignmentNode;
  }

  /**
   * Visit a variable reference (identifier used in expressions)
   * @param node The identifier node to visit
   * @returns The variable reference AST node or null if the node cannot be processed
   */
  visitVariableReference(node: TSNode): ast.VariableNode | null {
    this.errorHandler.logInfo(
      `[VariableVisitor.visitVariableReference] Processing variable reference: ${node.text}`,
      'VariableVisitor.visitVariableReference',
      node
    );

    if (node.type !== 'identifier') {
      this.errorHandler.handleError(
        new Error(`Expected identifier but got ${node.type}: ${node.text}`),
        'VariableVisitor.visitVariableReference',
        node
      );
      return null;
    }

    const variableName = extractVariableName(node);
    if (!variableName) {
      this.errorHandler.handleError(
        new Error(`Invalid variable name: ${node.text}`),
        'VariableVisitor.visitVariableReference',
        node
      );
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'variable',
      name: variableName,
      location: getLocation(node),
    };
  }

  /**
   * Visit an identifier node and determine if it's an assignment or reference
   * @param node The identifier node to visit
   * @returns The appropriate AST node or null if the node cannot be processed
   */
  visitIdentifier(node: TSNode): ast.ASTNode | null {
    this.errorHandler.logInfo(
      `[VariableVisitor.visitIdentifier] Processing identifier: ${node.text}`,
      'VariableVisitor.visitIdentifier',
      node
    );

    // Check if this identifier is part of an assignment by looking at the parent
    const parent = node.parent;
    if (parent && parent.type === 'assignment_statement') {
      // This is handled by visitAssignmentStatement
      return null;
    }

    // Otherwise, treat as a variable reference
    return this.visitVariableReference(node);
  }

  /**
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The function node
   * @returns null (not handled by this visitor)
   */
  createASTNodeForFunction(node: TSNode): ast.ASTNode | null {
    // Variables don't handle functions
    return null;
  }
}
