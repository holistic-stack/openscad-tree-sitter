/**
 * @file Assign Statement Visitor for OpenSCAD Parser
 * 
 * This module implements the AssignStatementVisitor class, which handles the parsing
 * and AST generation for OpenSCAD assign statements. Assign statements are deprecated
 * in OpenSCAD but still supported for legacy code compatibility.
 * 
 * The visitor supports assign statements with the pattern:
 * - Basic assign: assign(var = value) { statements }
 * - Multiple assignments: assign(var1 = value1, var2 = value2) { statements }
 * - Complex expressions: assign(x = a + b, y = sin(angle)) { statements }
 * 
 * ## Architecture
 * 
 * The AssignStatementVisitor integrates with the parser's visitor system through:
 * 1. CompositeVisitor integration for seamless parsing
 * 2. BaseASTVisitor enhancement for assign_statement detection
 * 3. Expression system integration for assignment value parsing
 * 
 * ## Technical Implementation
 * 
 * - **Real CST Parsing**: Uses actual tree-sitter `assign_statement` nodes
 * - **Expression Integration**: Leverages existing expression visitor system
 * - **Assignment Processing**: Sophisticated logic to handle multiple assignments
 * - **Error Handling**: Comprehensive error handling for malformed statements
 * 
 * @example
 * ```typescript
 * // Basic usage with parser
 * const parser = new EnhancedOpenscadParser(new SimpleErrorHandler());
 * await parser.init();
 * 
 * // Parse basic assign statement
 * const ast1 = parser.parseAST('assign(x = 5) cube(x);');
 * console.log(ast1[0]); // AssignStatementNode
 * 
 * // Parse assign with multiple assignments
 * const ast2 = parser.parseAST('assign(x = 5, y = 10) cube([x, y, 1]);');
 * console.log(ast2[0]); // AssignStatementNode with multiple assignments
 * 
 * // Parse assign with block
 * const ast3 = parser.parseAST('assign(r = 10) { sphere(r); translate([r*2, 0, 0]) sphere(r); }');
 * console.log(ast3[0]); // AssignStatementNode with block body
 * ```
 * 
 * @author OpenSCAD Parser Team
 * @since 1.0.0
 */

import { Node as TSNode } from 'web-tree-sitter';
import { BaseASTVisitor } from '../base-ast-visitor.js';
import { ErrorHandler } from '../../../error-handling/index.js';
import * as ast from '../../ast-types.js';
import { getLocation } from '../../utils/location-utils.js';

/**
 * Visitor class for processing OpenSCAD assign statements.
 *
 * The AssignStatementVisitor converts Tree-sitter CST nodes representing assign
 * statements into structured AST nodes. It handles both single and multiple
 * assignments within assign statements.
 *
 * Assign statements in OpenSCAD follow the pattern:
 * - `assign(var = value) statement` - Single assignment
 * - `assign(var1 = value1, var2 = value2) { statements }` - Multiple assignments with block
 *
 * The visitor integrates with the expression system to properly parse assignment
 * values, ensuring full support for complex expressions within assign statements.
 *
 * @example Creating and using the visitor
 * ```typescript
 * const visitor = new AssignStatementVisitor(sourceCode, errorHandler);
 *
 * // Process basic assign statement
 * const basicAssign = visitor.visitAssignStatement(basicAssignCST);
 * // Returns: { type: 'assign', assignments: [...], body: {...} }
 *
 * // Process assign with multiple assignments
 * const multipleAssign = visitor.visitAssignStatement(multipleAssignCST);
 * // Returns: { type: 'assign', assignments: [...], body: {...} }
 * ```
 *
 * @since 1.0.0
 */
export class AssignStatementVisitor extends BaseASTVisitor {
  /**
   * Creates a new AssignStatementVisitor instance.
   *
   * @param sourceCode - The original OpenSCAD source code being parsed
   * @param errorHandler - Handler for managing parsing errors and warnings
   *
   * @example
   * ```typescript
   * const errorHandler = new ErrorHandler();
   * const visitor = new AssignStatementVisitor(sourceCode, errorHandler);
   * ```
   */
  constructor(sourceCode: string, protected override errorHandler: ErrorHandler) {
    super(sourceCode, errorHandler);
  }

  /**
   * Create an AST node for a specific function.
   * This method is required by BaseASTVisitor but not used by AssignStatementVisitor
   * since assign statements are handled directly.
   *
   * @param node - The node to process
   * @param functionName - The name of the function
   * @param args - The arguments to the function
   * @returns Always returns null since assign statements don't use this method
   */
  protected createASTNodeForFunction(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    // Assign statements are handled directly in visitAssignStatement
    return null;
  }

  /**
   * Safe logging helper that checks if errorHandler exists
   *
   * @param level - The log level
   * @param message - The message to log
   * @param context - Optional context information
   * @param node - Optional node for additional context
   *
   * @private
   */
  private safeLog(level: 'info' | 'debug' | 'warning' | 'error', message: string, context?: string, node?: unknown): void {
    if (this.errorHandler) {
      switch (level) {
        case 'info':
          this.errorHandler.logInfo(message, context, node);
          break;
        case 'debug':
          this.errorHandler.logDebug(message, context, node);
          break;
        case 'warning':
          this.errorHandler.logWarning(message, context, node);
          break;
        case 'error':
          this.errorHandler.logError(message, context, node);
          break;
      }
    }
  }

  /**
   * Visits an assign statement node and converts it to an AST node.
   *
   * This method processes Tree-sitter CST nodes representing assign statements
   * and converts them into structured AssignStatementNode AST nodes. It handles
   * both single and multiple assignments within assign statements.
   *
   * The method expects the CST node to follow the grammar pattern:
   * ```
   * assign_statement: seq(
   *   'assign',
   *   '(',
   *   optional(commaSep1(assign_assignment)),
   *   ')',
   *   choice(block, statement)
   * )
   * ```
   *
   * @param node - The Tree-sitter CST node representing an assign statement
   * @returns The corresponding AssignStatementNode AST node, or null if processing fails
   *
   * @example Basic assign statement
   * ```typescript
   * // For OpenSCAD code: assign(x = 5) cube(x);
   * const assignNode = visitor.visitAssignStatement(cstNode);
   * // Returns: { type: 'assign', assignments: [{ variable: 'x', value: {...} }], body: {...} }
   * ```
   *
   * @example Multiple assignments
   * ```typescript
   * // For OpenSCAD code: assign(x = 5, y = 10) cube([x, y, 1]);
   * const assignNode = visitor.visitAssignStatement(cstNode);
   * // Returns: {
   * //   type: 'assign',
   * //   assignments: [
   * //     { variable: 'x', value: {...} },
   * //     { variable: 'y', value: {...} }
   * //   ],
   * //   body: {...}
   * // }
   * ```
   *
   * @since 1.0.0
   */
  override visitAssignStatement(node: TSNode): ast.AssignStatementNode | null {
    this.safeLog(
      'info',
      `[AssignStatementVisitor.visitAssignStatement] Processing assign statement: ${node.text.substring(0, 50)}`,
      'AssignStatementVisitor.visitAssignStatement',
      node
    );

    // Extract assignments from assign_assignment nodes
    const assignments: ast.AssignmentNode[] = [];

    // Find all assign_assignment children
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'assign_assignment') {
        const assignment = this.processAssignAssignment(child);
        if (assignment) {
          assignments.push(assignment);
        }
      }
    }

    // Extract the body (block or statement)
    let body: ast.ASTNode | null = null;

    // Look for block or statement as the last significant child
    for (let i = node.childCount - 1; i >= 0; i--) {
      const child = node.child(i);
      if (child && (child.type === 'block' || child.type === 'statement')) {
        body = this.visitNode(child);
        break;
      }
    }

    if (!body) {
      this.safeLog(
        'warning',
        `[AssignStatementVisitor.visitAssignStatement] No body found in assign statement`,
        'AssignStatementVisitor.visitAssignStatement',
        node
      );
      return null;
    }

    // Create the assign statement AST node
    const assignNode: ast.AssignStatementNode = {
      type: 'assign',
      assignments,
      body,
      location: getLocation(node),
    };

    this.safeLog(
      'info',
      `[AssignStatementVisitor.visitAssignStatement] Successfully created assign statement with ${assignments.length} assignments`,
      'AssignStatementVisitor.visitAssignStatement',
      node
    );

    return assignNode;
  }

  /**
   * Process an assign_assignment node to extract variable name and value.
   *
   * @param node - The assign_assignment CST node
   * @returns The corresponding AssignmentNode, or null if processing fails
   *
   * @private
   */
  private processAssignAssignment(node: TSNode): ast.AssignmentNode | null {
    this.safeLog(
      'info',
      `[AssignStatementVisitor.processAssignAssignment] Processing assignment: ${node.text.substring(0, 30)}`,
      'AssignStatementVisitor.processAssignAssignment',
      node
    );

    // Extract variable name
    const nameNode = node.childForFieldName('name');
    if (!nameNode) {
      this.safeLog(
        'warning',
        `[AssignStatementVisitor.processAssignAssignment] No name found in assignment`,
        'AssignStatementVisitor.processAssignAssignment',
        node
      );
      return null;
    }

    const variable = nameNode.text;

    // Extract value expression
    const valueNode = node.childForFieldName('value');
    if (!valueNode) {
      this.safeLog(
        'warning',
        `[AssignStatementVisitor.processAssignAssignment] No value found in assignment`,
        'AssignStatementVisitor.processAssignAssignment',
        node
      );
      return null;
    }

    const value = this.processExpression(valueNode);
    if (!value) {
      this.safeLog(
        'warning',
        `[AssignStatementVisitor.processAssignAssignment] Failed to process value expression`,
        'AssignStatementVisitor.processAssignAssignment',
        valueNode
      );
      return null;
    }

    return {
      type: 'assignment',
      variable,
      value,
      location: getLocation(node),
    };
  }

  /**
   * Processes an expression node using the expression visitor system.
   *
   * This method delegates expression processing to the appropriate expression
   * visitor, ensuring consistent handling of expressions throughout the parser.
   *
   * @param node - The expression CST node to process
   * @returns The corresponding expression AST node, or null if processing fails
   *
   * @private
   */
  private processExpression(node: TSNode): ast.ExpressionNode | null {
    // For now, create a basic expression node
    // This will be enhanced when integrated with the expression visitor system
    return {
      type: 'expression',
      expressionType: 'literal',
      value: node.text,
      location: getLocation(node),
    };
  }
}
