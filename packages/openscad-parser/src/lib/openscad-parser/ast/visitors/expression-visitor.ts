/**
 * @file Expression evaluation visitor for OpenSCAD parser
 *
 * This module implements the ExpressionVisitor class, which specializes in processing
 * OpenSCAD expressions and converting them to structured AST representations. Expressions
 * are fundamental to OpenSCAD's computational model, enabling mathematical calculations,
 * logical operations, and dynamic value generation.
 *
 * The ExpressionVisitor handles:
 * - **Binary Expressions**: Arithmetic (+, -, *, /, %), comparison (==, !=, <, <=, >, >=), and logical (&&, ||) operations
 * - **Unary Expressions**: Negation (-), logical not (!), and other prefix operators
 * - **Conditional Expressions**: Ternary operator (condition ? then : else) for conditional evaluation
 * - **Variable References**: Identifier resolution and variable access
 * - **Literal Values**: Numbers, strings, booleans, vectors, and undefined values
 * - **Array Operations**: Vector/array construction, indexing, and manipulation
 * - **Function Calls**: Function invocation within expression contexts
 * - **Parenthesized Expressions**: Grouping and precedence control
 *
 * Key features:
 * - **Expression Hierarchy Processing**: Handles complex nested expression structures
 * - **Operator Precedence**: Respects mathematical and logical operator precedence
 * - **Type-Safe Evaluation**: Maintains type information throughout expression processing
 * - **Error Recovery**: Graceful handling of malformed expressions with detailed error reporting
 * - **Performance Optimization**: Efficient dispatching and minimal overhead for simple expressions
 * - **Location Tracking**: Preserves source location information for debugging and IDE integration
 *
 * Expression processing patterns:
 * - **Simple Literals**: `42`, `"hello"`, `true`, `[1, 2, 3]` - direct value extraction
 * - **Binary Operations**: `a + b`, `x > y`, `p && q` - operator-based calculations
 * - **Nested Expressions**: `(a + b) * (c - d)` - complex hierarchical evaluation
 * - **Conditional Logic**: `x > 0 ? x : -x` - ternary conditional expressions
 * - **Function Integration**: `sin(angle)`, `len(vector)` - function calls within expressions
 * - **Variable Access**: `myVar`, `dimensions[0]` - identifier and array access
 *
 * The visitor implements a comprehensive dispatching strategy:
 * 1. **Type-Based Routing**: Routes nodes to appropriate handlers based on CST node type
 * 2. **Hierarchical Processing**: Handles expression precedence through recursive evaluation
 * 3. **Error Propagation**: Maintains error context throughout the expression tree
 *
 * @example Basic expression processing
 * ```typescript
 * import { ExpressionVisitor } from './expression-visitor';
 *
 * const visitor = new ExpressionVisitor(sourceCode, errorHandler);
 *
 * // Process arithmetic expression
 * const binaryExpr = visitor.visitBinaryExpression(binaryCST);
 * // Returns: { type: 'expression', expressionType: 'binary', operator: '+', left: ..., right: ... }
 *
 * // Process conditional expression
 * const conditionalExpr = visitor.visitConditionalExpression(conditionalCST);
 * // Returns: { type: 'expression', expressionType: 'conditional', condition: ..., thenBranch: ..., elseBranch: ... }
 * ```
 *
 * @example Complex expression hierarchies
 * ```typescript
 * // For OpenSCAD code: (x + y) * sin(angle) > threshold ? max_value : min_value
 * const complexExpr = visitor.dispatchSpecificExpression(complexCST);
 * // Returns nested expression structure with proper precedence and evaluation order
 *
 * // For vector operations: [x, y, z][index] + offset
 * const vectorExpr = visitor.dispatchSpecificExpression(vectorCST);
 * // Returns expression with array access and arithmetic operation
 * ```
 *
 * @example Error handling and recovery
 * ```typescript
 * const visitor = new ExpressionVisitor(sourceCode, errorHandler);
 *
 * // Process malformed expression
 * const result = visitor.dispatchSpecificExpression(malformedCST);
 *
 * if (!result) {
 *   const errors = errorHandler.getErrors();
 *   console.log('Expression processing errors:', errors);
 * }
 * ```
 *
 * @module expression-visitor
 * @since 0.1.0
 */

import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types.js';
import { BaseASTVisitor } from './base-ast-visitor.js';
import { getLocation } from '../utils/location-utils.js';
import { FunctionCallVisitor } from './expression-visitor/function-call-visitor.js';
import { ListComprehensionVisitor } from './expression-visitor/list-comprehension-visitor/list-comprehension-visitor.js';
import { RangeExpressionVisitor } from './expression-visitor/range-expression-visitor/range-expression-visitor.js';
import { ErrorHandler } from '../../error-handling/index.js';
import { findDescendantOfType } from '../utils/node-utils.js';
import { evaluateBinaryExpression } from '../evaluation/binary-expression-evaluator/binary-expression-evaluator.js';

/**
 * Visitor for processing OpenSCAD expressions with comprehensive type support.
 *
 * The ExpressionVisitor extends BaseASTVisitor to provide specialized handling for
 * all types of expressions in OpenSCAD. It follows tree-sitter visitor pattern
 * best practices and adheres to DRY, KISS, and SRP principles by directly handling
 * all expression types without relying on incompatible sub-visitors.
 *
 * This implementation provides:
 * - **Direct Expression Handling**: All expression types processed in a single visitor
 * - **Efficient Dispatching**: Type-based routing to appropriate processing methods
 * - **Error Context Preservation**: Maintains detailed error information throughout processing
 * - **Performance Optimization**: Minimal overhead for simple expressions
 * - **Comprehensive Coverage**: Supports all OpenSCAD expression constructs
 *
 * The visitor maintains a single FunctionCallVisitor dependency for handling function
 * calls within expressions, following the Single Responsibility Principle by keeping
 * only essential dependencies.
 *
 * @class ExpressionVisitor
 * @extends {BaseASTVisitor}
 * @since 0.1.0
 */
export class ExpressionVisitor extends BaseASTVisitor {

  /**
   * Create a binary expression node from a CST node
   * @param node The binary expression CST node
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  createBinaryExpressionNode(node: TSNode): ast.BinaryExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.createBinaryExpressionNode] Creating binary expression node for: ${node.type} - "${node.text.substring(0, 30)}"`,
      'ExpressionVisitor.createBinaryExpressionNode',
      node
    );

    // Check if this is actually a single expression wrapped in a binary expression hierarchy node
    // This happens when the grammar creates nested expression hierarchies for precedence
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.createBinaryExpressionNode] Detected single expression wrapped as binary expression. Delegating to child. Node: "${node.text}", Child: "${child.type}"`,
          'ExpressionVisitor.createBinaryExpressionNode',
          node
        );
        // Delegate to the child node
        return this.dispatchSpecificExpression(child) as ast.BinaryExpressionNode;
      }
    }

    // Extract left operand, operator, and right operand
    let leftNode: TSNode | null = null;
    let operatorNode: TSNode | null = null;
    let rightNode: TSNode | null = null;

    // Binary expressions should have at least 3 children (left, operator, right)
    if (node.childCount >= 3) {
      // Try to get named children first
      leftNode = node.childForFieldName('left');
      operatorNode = node.childForFieldName('operator');
      rightNode = node.childForFieldName('right');

      // If that fails, try direct children approach
      if (!leftNode || !operatorNode || !rightNode) {
        leftNode = node.child(0);
        rightNode = node.child(2);

        // For operators, we need to find the first token that's an operator
        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (child && ['+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>=', '&&', '||'].includes(child.text)) {
            operatorNode = child;
            break;
          }
        }
      }
    }

    // Log what we found
    this.safeLog(
      'info',
      `[ExpressionVisitor.createBinaryExpressionNode] Found nodes: left=${leftNode?.text}, op=${operatorNode?.text}, right=${rightNode?.text}`,
      'ExpressionVisitor.createBinaryExpressionNode',
      node
    );

    // Validate that we have all required parts
    if (!leftNode || !rightNode || !operatorNode) {
      this.errorHandler.handleError(
        new Error(`Invalid binary expression structure: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.createBinaryExpressionNode',
        node
      );
      return null;
    }

    // Process left and right operands recursively
    const leftExpr = this.dispatchSpecificExpression(leftNode);
    const rightExpr = this.dispatchSpecificExpression(rightNode);

    if (!leftExpr || !rightExpr) {
      this.errorHandler.handleError(
        new Error(`Failed to process operands in binary expression: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.createBinaryExpressionNode',
        node
      );
      return null;
    }

    // Create the binary expression node
    const binaryExprNode: ast.BinaryExpressionNode = {
      type: 'expression',
      expressionType: 'binary',
      operator: operatorNode.text as ast.BinaryOperator,
      left: leftExpr,
      right: rightExpr,
      location: getLocation(node),
    };

    this.safeLog(
      'info',
      `[ExpressionVisitor.createBinaryExpressionNode] Created binary expression node: ${JSON.stringify(binaryExprNode, null, 2)}`,
      'ExpressionVisitor.createBinaryExpressionNode',
      node
    );

    return binaryExprNode;
  }
  /**
   * Function call visitor for handling function calls in expressions
   */
  private functionCallVisitor: FunctionCallVisitor;

  /**
   * List comprehension visitor for handling list comprehensions in expressions
   */
  private listComprehensionVisitor: ListComprehensionVisitor;

  /**
   * Range expression visitor for handling range expressions in expressions
   */
  private rangeExpressionVisitor: RangeExpressionVisitor;

  /**
   * Constructor for the ExpressionVisitor
   * @param source The source code
   * @param errorHandler The error handler
   */
  constructor(source: string, protected override errorHandler: ErrorHandler) {
    super(source, errorHandler);

    // Initialize specialized visitors
    // This follows SRP by keeping only essential dependencies
    this.functionCallVisitor = new FunctionCallVisitor(this, errorHandler);
    this.listComprehensionVisitor = new ListComprehensionVisitor(this, errorHandler);
    this.rangeExpressionVisitor = new RangeExpressionVisitor(this, errorHandler);
  }

  /**
   * Safe logging helper that checks if errorHandler exists
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
   * Dispatch an expression node to the appropriate handler method
   * @param node The expression node to dispatch
   * @returns The expression AST node or null if the node cannot be processed
   */
  dispatchSpecificExpression(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.dispatchSpecificExpression] Dispatching node type: ${node.type}`,
      'ExpressionVisitor.dispatchSpecificExpression',
      node
    );

    // Check for binary expression types first
    const binaryExpressionTypes = [
      'binary_expression',
      'additive_expression',
      'multiplicative_expression',
      'exponentiation_expression',
      'logical_or_expression',
      'logical_and_expression',
      'equality_expression',
      'relational_expression'
    ];

    if (binaryExpressionTypes.includes(node.type)) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.dispatchSpecificExpression] Handling binary expression type: ${node.type}`,
        'ExpressionVisitor.dispatchSpecificExpression',
        node
      );
      return this.createBinaryExpressionNode(node);
    }

    switch (node.type) {
      case 'expression':
        return this.visitExpression(node);
      case 'identifier':
        return this.visitIdentifier(node);
      case 'number_literal':
      case 'number':  // Handle both number_literal and number node types
      case 'string_literal':
      case 'string':  // Handle both string_literal and string node types
      case 'boolean_literal':
      case 'boolean': // Handle both boolean_literal and boolean node types
      case 'true':    // Handle true literal node type
      case 'false':   // Handle false literal node type
      case 'undef_literal':
      case 'undef':   // Handle both undef_literal and undef node types
        return this.visitLiteral(node);
      case 'vector_expression':
        return this.visitVectorExpression(node);
      case 'array_expression':
      case 'array_literal':
        return this.visitArrayExpression(node);
      case 'accessor_expression':
        return this.visitAccessorExpression(node);
      case 'primary_expression':
        return this.visitPrimaryExpression(node);
      case 'list_comprehension':
        return this.listComprehensionVisitor.visitListComprehension(node);
      case 'range_expression':
        return this.rangeExpressionVisitor.visitRangeExpression(node);
      case 'let_expression':
        return this.visitLetExpression(node);
      default:
        return this.createExpressionNode(node);
    }
  }

  /**
   * Create an expression node from a CST node
   * @param node The CST node
   * @returns The expression AST node or null if the node cannot be processed
   */
  createExpressionNode(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.createExpressionNode] Creating expression node for type: ${node.type}`,
      'ExpressionVisitor.createExpressionNode',
      node
    );

    // Handle specific expression types
    switch (node.type) {
      case 'binary_expression':
      case 'logical_or_expression':
      case 'logical_and_expression':
      case 'equality_expression':
      case 'relational_expression':
      case 'additive_expression':
      case 'multiplicative_expression':
      case 'exponentiation_expression': {
        // Process binary expression directly
        const leftNode = node.namedChild(0);
        const rightNode = node.namedChild(2);
        const operatorNode = node.namedChild(1);

        if (!leftNode || !rightNode || !operatorNode) {
          this.errorHandler.handleError(
            new Error(`Invalid binary expression structure: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Process left and right operands
        const leftExpr = this.dispatchSpecificExpression(leftNode);
        const rightExpr = this.dispatchSpecificExpression(rightNode);

        if (!leftExpr || !rightExpr) {
          this.errorHandler.handleError(
            new Error(`Failed to process operands in binary expression: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Create binary expression node
        return {
          type: 'expression',
          expressionType: 'binary',
          operator: operatorNode.text as ast.BinaryOperator,
          left: leftExpr,
          right: rightExpr,
          location: getLocation(node),
        };
      }
      case 'unary_expression': {
        // Check if this is actually a single expression wrapped in a unary expression hierarchy node
        if (node.namedChildCount === 1) {
          const child = node.namedChild(0);
          if (child) {
            this.safeLog(
              'info',
              `[ExpressionVisitor.createExpressionNode] Detected single expression wrapped as unary expression. Delegating to child. Node: "${node.text}", Child: "${child.type}"`,
              'ExpressionVisitor.createExpressionNode',
              node
            );
            // Delegate to the child node
            return this.dispatchSpecificExpression(child);
          }
        }

        // Process unary expression directly
        const operandNode = node.child(1);
        const operatorNode = node.child(0);

        if (!operandNode || !operatorNode) {
          this.errorHandler.handleError(
            new Error(`Invalid unary expression structure: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Process operand
        const operandExpr = this.dispatchSpecificExpression(operandNode);

        if (!operandExpr) {
          this.errorHandler.handleError(
            new Error(`Failed to process operand in unary expression: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Create unary expression node
        return {
          type: 'expression',
          expressionType: 'unary',
          operator: operatorNode.text as ast.UnaryOperator,
          operand: operandExpr,
          prefix: true, // All unary operators in OpenSCAD are prefix operators
          location: getLocation(node),
        } as ast.UnaryExpressionNode;
      }
      case 'conditional_expression': {
        // Check if this is actually a single expression wrapped in a conditional expression hierarchy node
        if (node.namedChildCount === 1) {
          const child = node.namedChild(0);
          if (child) {
            this.safeLog(
              'info',
              `[ExpressionVisitor.createExpressionNode] Detected single expression wrapped as conditional expression. Delegating to child. Node: "${node.text}", Child: "${child.type}"`,
              'ExpressionVisitor.createExpressionNode',
              node
            );
            // Delegate to the child node
            return this.dispatchSpecificExpression(child);
          }
        }

        // Process conditional expression directly
        const conditionNode = node.namedChild(0);
        const thenNode = node.namedChild(2);
        const elseNode = node.namedChild(4);

        if (!conditionNode || !thenNode || !elseNode) {
          this.errorHandler.handleError(
            new Error(`Invalid conditional expression structure: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Process condition, then, and else expressions
        const conditionExpr = this.dispatchSpecificExpression(conditionNode);
        const thenExpr = this.dispatchSpecificExpression(thenNode);
        const elseExpr = this.dispatchSpecificExpression(elseNode);

        if (!conditionExpr || !thenExpr || !elseExpr) {
          this.errorHandler.handleError(
            new Error(`Failed to process parts of conditional expression: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Create conditional expression node
        return {
          type: 'expression',
          expressionType: 'conditional',
          condition: conditionExpr,
          thenBranch: thenExpr,
          elseBranch: elseExpr,
          location: getLocation(node),
        };
      }
      case 'parenthesized_expression': {
        // Process parenthesized expression directly
        const innerNode = node.namedChild(0);

        if (!innerNode) {
          this.errorHandler.handleError(
            new Error(`Invalid parenthesized expression structure: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Process inner expression
        const innerExpr = this.dispatchSpecificExpression(innerNode);

        if (!innerExpr) {
          this.errorHandler.handleError(
            new Error(`Failed to process inner expression in parenthesized expression: ${node.text.substring(0, 100)}`),
            'ExpressionVisitor.createExpressionNode',
            node
          );
          return null;
        }

        // Return the inner expression with the parenthesized location
        return {
          ...innerExpr,
          location: getLocation(node),
        };
      }
      case 'function_call': {
        // Convert function call to expression node for expression contexts
        const functionCall = this.functionCallVisitor.visitFunctionCall(node);
        if (functionCall) {
          // Create an expression wrapper for the function call
          return {
            type: 'expression',
            expressionType: 'function_call',
            name: functionCall.name,
            arguments: functionCall.arguments,
            location: functionCall.location,
          } as ast.ExpressionNode;
        }
        return null;
      }
      case 'list_comprehension':
        // Handle list comprehension expressions
        return this.listComprehensionVisitor.visitListComprehension(node);
      case 'range_expression':
        // Handle range expressions
        return this.rangeExpressionVisitor.visitRangeExpression(node);
      case 'let_expression':
        // Handle let expressions
        return this.visitLetExpression(node);
      default:
        this.safeLog(
          'info',
          `[ExpressionVisitor.createExpressionNode] Unhandled expression type: ${node.type}`,
          'ExpressionVisitor.createExpressionNode',
          node
        );
        return null;
    }
  }

  /**
   * Visit a binary expression node
   * @param node The binary expression CST node
   * @returns The binary expression AST node or null if the node cannot be processed
   */
  visitBinaryExpression(node: TSNode): ast.BinaryExpressionNode | null {
    return this.createBinaryExpressionNode(node);
  }

  /**
   * Visit a unary expression node
   * @param node The unary expression CST node
   * @returns The unary expression AST node or null if the node cannot be processed
   */
  visitUnaryExpression(node: TSNode): ast.UnaryExpressionNode | null {
    // Process unary expression directly
    const operandNode = node.child(1);
    const operatorNode = node.child(0);

    if (!operandNode || !operatorNode) {
      this.errorHandler.handleError(
        new Error(`Invalid unary expression structure: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitUnaryExpression',
        node
      );
      return null;
    }

    // Process operand
    const operandExpr = this.dispatchSpecificExpression(operandNode);

    if (!operandExpr) {
      this.errorHandler.handleError(
        new Error(`Failed to process operand in unary expression: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitUnaryExpression',
        node
      );
      return null;
    }

    // Create unary expression node
    return {
      type: 'expression',
      expressionType: 'unary',
      operator: operatorNode.text as ast.UnaryOperator,
      operand: operandExpr,
      prefix: true, // All unary operators in OpenSCAD are prefix operators
      location: getLocation(node),
    } as ast.UnaryExpressionNode;
  }

  /**
   * Visit a conditional expression node
   * @param node The conditional expression CST node
   * @returns The conditional expression AST node or null if the node cannot be processed
   */
  override visitConditionalExpression(node: TSNode): ast.ConditionalExpressionNode | null {
    // Process conditional expression directly
    const conditionNode = node.child(0);
    const thenNode = node.child(2);
    const elseNode = node.child(4);

    if (!conditionNode || !thenNode || !elseNode) {
      this.errorHandler.handleError(
        new Error(`Invalid conditional expression structure: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitConditionalExpression',
        node
      );
      return null;
    }

    // Process condition, then, and else expressions
    const conditionExpr = this.dispatchSpecificExpression(conditionNode);
    const thenExpr = this.dispatchSpecificExpression(thenNode);
    const elseExpr = this.dispatchSpecificExpression(elseNode);

    if (!conditionExpr || !thenExpr || !elseExpr) {
      this.errorHandler.handleError(
        new Error(`Failed to process parts of conditional expression: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitConditionalExpression',
        node
      );
      return null;
    }

    // Create conditional expression node
    return {
      type: 'expression',
      expressionType: 'conditional',
      condition: conditionExpr,
      thenBranch: thenExpr,
      elseBranch: elseExpr,
      location: getLocation(node),
    };
  }

  /**
   * Visit an expression node. This method determines the specific type of expression
   * and dispatches to the appropriate handler method.
   * @param node The expression node to visit (CST node)
   * @returns The expression AST node or null if the node cannot be processed
   */
  override visitExpression(node: TSNode): ast.ExpressionNode | null {
    // Debug: Log the node structure
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitExpression] Processing expression: ${node.text.substring(0, 30)}`,
      'ExpressionVisitor.visitExpression',
      node
    );

    // If the node itself is a specific expression type, use it directly
    if (node.type !== 'expression') {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Node is a specific type: ${node.type}`,
        'ExpressionVisitor.visitExpression',
        node
      );
      return this.dispatchSpecificExpression(node);
    }

    // Check for let expression first (before other checks)
    const letExprNode = findDescendantOfType(node, 'let_expression');
    if (letExprNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found let expression: ${letExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        letExprNode
      );
      return this.visitLetExpression(letExprNode);
    }

    // Check for binary expression
    const binaryExprNode = findDescendantOfType(node, 'binary_expression');
    if (binaryExprNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found binary expression: ${binaryExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        binaryExprNode
      );
      return this.createExpressionNode(binaryExprNode);
    }

    // Check for unary expression, but be more selective about function call detection
    const unaryExprNode = findDescendantOfType(node, 'unary_expression');
    if (unaryExprNode) {
      // Check if this unary expression contains an accessor_expression
      const accessorExpr = findDescendantOfType(unaryExprNode, 'accessor_expression');
      if (accessorExpr) {
        // Check if this accessor expression has an argument_list (making it a function call)
        const argumentListNode = findDescendantOfType(accessorExpr, 'argument_list');
        if (argumentListNode) {
          // Check if this is a direct function call (not an array containing function calls)
          // If the unary expression starts with '[', it's likely an array containing function calls
          const nodeText = unaryExprNode.text.trim();
          if (nodeText.startsWith('[') && nodeText.endsWith(']')) {
            // This is an array that contains function calls - we should process it
            this.safeLog(
              'info',
              `[ExpressionVisitor.visitExpression] Found array containing function calls: ${unaryExprNode.text.substring(0, 30)}. Processing as array.`,
              'ExpressionVisitor.visitExpression',
              unaryExprNode
            );
          } else {
            // This is a direct function call like sphere(), cube(), etc.
            // Don't handle it here - let specialized visitors handle it
            this.safeLog(
              'info',
              `[ExpressionVisitor.visitExpression] Found direct function call: ${unaryExprNode.text.substring(0, 30)}. Skipping to let specialized visitors handle it.`,
              'ExpressionVisitor.visitExpression',
              unaryExprNode
            );
            return null;
          }
        } else {
          // This is just a simple expression wrapped in accessor_expression (like a number or variable)
          // Continue processing it as a unary expression
          this.safeLog(
            'info',
            `[ExpressionVisitor.visitExpression] Found unary expression with accessor_expression (not a function call): ${unaryExprNode.text.substring(0, 30)}. Processing as unary expression.`,
            'ExpressionVisitor.visitExpression',
            unaryExprNode
          );
        }
      }

      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found unary expression: ${unaryExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        unaryExprNode
      );
      return this.createExpressionNode(unaryExprNode);
    }

    // Check for conditional expression
    const condExprNode = findDescendantOfType(node, 'conditional_expression');
    if (condExprNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found conditional expression: ${condExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        condExprNode
      );
      return this.createExpressionNode(condExprNode);
    }

    // Check for parenthesized expression
    const parenExprNode = findDescendantOfType(node, 'parenthesized_expression');
    if (parenExprNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found parenthesized expression: ${parenExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        parenExprNode
      );
      return this.createExpressionNode(parenExprNode);
    }

    // Check for vector expression
    const vectorExprNode = findDescendantOfType(node, 'vector_expression');
    if (vectorExprNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found vector expression: ${vectorExprNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        vectorExprNode
      );
      return this.visitVectorExpression(vectorExprNode);
    }

    // Check for list comprehension
    const listComprehensionNode = findDescendantOfType(node, 'list_comprehension');
    if (listComprehensionNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found list comprehension: ${listComprehensionNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        listComprehensionNode
      );
      return this.listComprehensionVisitor.visitListComprehension(listComprehensionNode);
    }

    // Check for function call
    const functionCallNode = findDescendantOfType(node, 'function_call');
    if (functionCallNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found function call: ${functionCallNode.text.substring(0, 30)}`,
        'ExpressionVisitor.visitExpression',
        functionCallNode
      );
      return this.createExpressionNode(functionCallNode);
    }

    // Check for identifier (variable reference)
    const identifierNode = findDescendantOfType(node, 'identifier');
    if (identifierNode) {
      this.safeLog(
        'info',
        `[ExpressionVisitor.visitExpression] Found identifier: ${identifierNode.text}`,
        'ExpressionVisitor.visitExpression',
        identifierNode
      );
      return this.visitIdentifier(identifierNode);
    }

    // Check for literal values
    const literalTypes = ['number_literal', 'string_literal', 'boolean_literal', 'undef_literal'];
    for (const literalType of literalTypes) {
      const literalNode = findDescendantOfType(node, literalType);
      if (literalNode) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitExpression] Found literal: ${literalNode.text}`,
          'ExpressionVisitor.visitExpression',
          literalNode
        );
        return this.visitLiteral(literalNode);
      }
    }

    // If we couldn't find a specific expression type, log a warning and return null
    this.safeLog(
      'warning',
      `[ExpressionVisitor.visitExpression] Could not determine expression type: ${node.text.substring(0, 30)}`,
      'ExpressionVisitor.visitExpression',
      node
    );
    return null;
  }

  /**
   * Visit an accessor expression node (e.g., obj.prop)
   * @param node The accessor expression node to visit
   * @returns The accessor expression AST node or null if the node cannot be processed
   */
  override visitAccessorExpression(node: TSNode): ast.AccessorExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.visitAccessorExpression',
      node
    );

    // Check if this is actually a single expression wrapped in an accessor expression hierarchy node
    if (node.namedChildCount === 1) {
      const child = node.namedChild(0);
      if (child) {
        this.safeLog(
          'info',
          `[ExpressionVisitor.visitAccessorExpression] Detected single expression wrapped as accessor expression. Delegating to child. Node: "${node.text}", Child: "${child.type}"`,
          'ExpressionVisitor.visitAccessorExpression',
          node
        );
        // Delegate to the child node
        return this.dispatchSpecificExpression(child) as ast.AccessorExpressionNode;
      }
    }

    // Get the object and property nodes
    const objectNode = node.namedChild(0);
    const propertyNode = node.namedChild(1);

    if (!objectNode || !propertyNode) {
      this.errorHandler.handleError(
        new Error(`Invalid accessor expression structure: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitAccessorExpression',
        node
      );
      return null;
    }

    // Process the object
    const objectAST = this.dispatchSpecificExpression(objectNode);
    if (!objectAST) {
      this.errorHandler.handleError(
        new Error(`Failed to process object in accessor expression: ${node.text.substring(0, 100)}`),
        'ExpressionVisitor.visitAccessorExpression',
        node
      );
      return null;
    }

    // Create the accessor expression node
    return {
      type: 'expression',
      expressionType: 'accessor',
      object: objectAST,
      property: propertyNode.text,
      location: getLocation(node),
    };
  }

  /**
   * Visit a primary expression node
   * @param node The primary expression node to visit
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitPrimaryExpression(node: TSNode): ast.ExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitPrimaryExpression] Processing primary expression: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.visitPrimaryExpression',
      node
    );

    // Primary expressions are wrappers around other expressions
    // Find the actual expression inside
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child) {
        const expr = this.dispatchSpecificExpression(child);
        if (expr) {
          return expr;
        }
      }
    }

    this.errorHandler.handleError(
      new Error(`Failed to process primary expression: ${node.text.substring(0, 100)}`),
      'ExpressionVisitor.visitPrimaryExpression',
      node
    );
    return null;
  }

  /**
   * Visit an identifier node
   * @param node The identifier node to visit
   * @returns The variable node or null if the node cannot be processed
   */
  visitIdentifier(node: TSNode): ast.VariableNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitIdentifier] Processing identifier: ${node.text}`,
      'ExpressionVisitor.visitIdentifier',
      node
    );

    // Create a variable node for the identifier
    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node),
    };
  }

  /**
   * Visit a let expression node
   * @param node The let expression node to visit
   * @returns The let expression node or null if the node cannot be processed
   */
  visitLetExpression(node: TSNode): ast.LetExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitLetExpression] Processing let expression: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.visitLetExpression',
      node
    );

    // Extract assignments from let_assignment nodes
    const assignments: ast.AssignmentNode[] = [];

    // Find all let_assignment children
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'let_assignment') {
        const assignment = this.processLetAssignment(child);
        if (assignment) {
          assignments.push(assignment);
        }
      }
    }

    // Extract the body expression
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      this.safeLog(
        'warning',
        `[ExpressionVisitor.visitLetExpression] No body found in let expression`,
        'ExpressionVisitor.visitLetExpression',
        node
      );
      return null;
    }

    const expression = this.visitExpression(bodyNode);
    if (!expression) {
      this.safeLog(
        'warning',
        `[ExpressionVisitor.visitLetExpression] Failed to process body expression`,
        'ExpressionVisitor.visitLetExpression',
        bodyNode
      );
      return null;
    }

    this.safeLog(
      'info',
      `[ExpressionVisitor.visitLetExpression] Successfully created let expression with ${assignments.length} assignments`,
      'ExpressionVisitor.visitLetExpression',
      node
    );

    return {
      type: 'expression',
      expressionType: 'let_expression',
      assignments,
      expression,
      location: getLocation(node),
    };
  }

  /**
   * Process a let assignment node
   * @param node The let assignment node to process
   * @returns The assignment node or null if the node cannot be processed
   */
  private processLetAssignment(node: TSNode): ast.AssignmentNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.processLetAssignment] Processing let assignment: ${node.text}`,
      'ExpressionVisitor.processLetAssignment',
      node
    );

    // Extract variable name
    const nameNode = node.childForFieldName('name');
    if (!nameNode) {
      this.safeLog(
        'warning',
        `[ExpressionVisitor.processLetAssignment] No name found in let assignment`,
        'ExpressionVisitor.processLetAssignment',
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
        `[ExpressionVisitor.processLetAssignment] No value found in let assignment`,
        'ExpressionVisitor.processLetAssignment',
        node
      );
      return null;
    }

    const value = this.visitExpression(valueNode);
    if (!value) {
      this.safeLog(
        'warning',
        `[ExpressionVisitor.processLetAssignment] Failed to process value expression`,
        'ExpressionVisitor.processLetAssignment',
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
   * Visit a vector expression node
   * @param node The vector expression node to visit
   * @returns The vector expression AST node or null if the node cannot be processed
   */
  visitVectorExpression(node: TSNode): ast.VectorExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitVectorExpression] Processing vector expression: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.visitVectorExpression',
      node
    );

    // Process all elements in the vector
    const elements: ast.ExpressionNode[] = [];
    for (let i = 0; i < node.namedChildCount; i++) {
      const elementNode = node.namedChild(i);
      if (elementNode) {
        const elementExpr = this.dispatchSpecificExpression(elementNode);
        if (elementExpr) {
          elements.push(elementExpr);
        } else {
          this.safeLog(
            'warning',
            `[ExpressionVisitor.visitVectorExpression] Failed to process vector element at index ${i}: ${elementNode.text}`,
            'ExpressionVisitor.visitVectorExpression',
            elementNode
          );
        }
      }
    }

    // Create the vector expression node
    return {
      type: 'expression',
      expressionType: 'vector',
      elements,
      location: getLocation(node),
    };
  }

  /**
   * Visit an array expression node
   * @param node The array expression node to visit
   * @returns The array expression AST node or null if the node cannot be processed
   */
  visitArrayExpression(node: TSNode): ast.ArrayExpressionNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitArrayExpression] Processing array expression: ${node.text.substring(0, 50)}`,
      'ExpressionVisitor.visitArrayExpression',
      node
    );

    // Process all elements in the array
    const elements: ast.ExpressionNode[] = [];
    for (let i = 0; i < node.namedChildCount; i++) {
      const elementNode = node.namedChild(i);
      if (elementNode) {
        const elementExpr = this.dispatchSpecificExpression(elementNode);
        if (elementExpr) {
          elements.push(elementExpr);
        } else {
          this.safeLog(
            'warning',
            `[ExpressionVisitor.visitArrayExpression] Failed to process array element at index ${i}: ${elementNode.text}`,
            'ExpressionVisitor.visitArrayExpression',
            elementNode
          );
        }
      }
    }

    // Create the array expression node
    return {
      type: 'expression',
      expressionType: 'array',
      items: elements, // Using 'items' instead of 'elements' to match the type definition
      location: getLocation(node),
    } as ast.ArrayExpressionNode;
  }

  /**
   * Visit a literal node
   * @param node The literal node to visit
   * @returns The literal AST node or null if the node cannot be processed
   */
  visitLiteral(node: TSNode): ast.LiteralNode | null {
    this.safeLog(
      'info',
      `[ExpressionVisitor.visitLiteral] Processing literal: ${node.text}`,
      'ExpressionVisitor.visitLiteral',
      node
    );

    let value: number | string | boolean = ''; // Default to empty string
    let literalType: 'number' | 'string' | 'boolean' | 'undef' = 'string'; // Default to string

    // Determine the value and type based on the node type
    switch (node.type) {
      case 'number_literal':
      case 'number':  // Handle both number_literal and number node types
        value = parseFloat(node.text);
        literalType = 'number';
        break;
      case 'string_literal':
      case 'string': {  // Handle both string_literal and string node types
        // Remove quotes from string literals if they exist
        const text = node.text;
        if (text.startsWith('"') && text.endsWith('"')) {
          value = text.substring(1, text.length - 1);
        } else {
          value = text;
        }
        literalType = 'string';
        break;
      }
      case 'boolean_literal':
      case 'boolean':  // Handle both boolean_literal and boolean node types
      case 'true':     // Handle true literal node type
      case 'false':    // Handle false literal node type
        value = node.text === 'true';
        literalType = 'boolean';
        break;
      case 'undef_literal':
      case 'undef':  // Handle both undef_literal and undef node types
        value = 'undef';
        literalType = 'undef';
        break;
      default:
        // For unknown literal types, use the text as is
        value = node.text;
        break;
    }

    return {
      type: 'expression',
      expressionType: 'literal',
      literalType,
      value,
      location: getLocation(node),
    } as ast.LiteralNode;
  }

  /**
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The function node
   * @param functionName The function name
   * @param args The function arguments
   * @returns The function call AST node or null if not handled
   */
  createASTNodeForFunction(node: TSNode, _functionName?: string, _args?: ast.Parameter[]): ast.ASTNode | null {
    // Expression visitor doesn't handle function definitions, only function calls
    // Function calls are handled by the FunctionCallVisitor
    if (node.type === 'function_call') {
      return this.functionCallVisitor.visitFunctionCall(node);
    }
    return null;
  }
}