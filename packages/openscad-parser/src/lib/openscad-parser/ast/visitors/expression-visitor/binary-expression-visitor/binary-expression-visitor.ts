import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor'; // Assuming this is the correct path
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../../expression-visitor'; // Parent visitor
import { getLocation } from '../../../utils/location-utils';

export class BinaryExpressionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected errorHandler: ErrorHandler
  ) {
    super('', errorHandler); // Use empty string for source since we get it from parent
  }

  // Implement the abstract method required by BaseASTVisitor
  protected createASTNodeForFunction(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    // Binary expressions don't handle function calls
    return null;
  }

  visit(node: TSNode): ast.BinaryExpressionNode | null {
    if (node.type !== 'binary_expression') {
      const error = this.errorHandler.createParserError(
        `Expected 'binary_expression' but got '${node.type}'`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }
    const leftNode = node.childForFieldName('left');
    const operatorNode = node.childForFieldName('operator');
    const rightNode = node.childForFieldName('right');

    if (!leftNode || !operatorNode || !rightNode) {
      const error = this.errorHandler.createParserError(
        `Malformed binary_expression: missing left, operator, or right child. Left: ${leftNode}, Op: ${operatorNode}, Right: ${rightNode}`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    const operator = operatorNode.text;
    // Type guard for valid operators if necessary, or let semantic analysis handle it
    // For now, we assume the grammar provides valid operator tokens.

    const leftAST = this.parentVisitor.visitExpression(leftNode);
    const rightAST = this.parentVisitor.visitExpression(rightNode);

    if (!leftAST || !rightAST) {
      // Errors in sub-expressions should have been handled by the parentVisitor
      // or its delegates. If they return null, it means a parsing error occurred.
      const error = this.errorHandler.createParserError(
        `Failed to parse operands in binary expression. Left: ${leftAST}, Right: ${rightAST}`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'binary',
      operator: operator as ast.BinaryOperator, // Cast, assuming grammar aligns with ast.BinaryOperator
      left: leftAST,
      right: rightAST,
      location: getLocation(node),
    };
  }
}
