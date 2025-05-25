import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor'; // Assuming this is the correct path
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../expression-visitor'; // Parent visitor

export class BinaryExpressionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected errorHandler: ErrorHandler
  ) {
    super(parentVisitor.source, errorHandler);
  }

  visit(node: TSNode): ast.BinaryExpressionNode | null {
    if (node.type !== 'binary_expression') {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Expected 'binary_expression' but got '${node.type}'`,
          this.getLocation(node),
          'BinaryExpressionVisitorError'
        )
      );
      return null;
    }
    const leftNode = node.childForFieldName('left');
    const operatorNode = node.childForFieldName('operator');
    const rightNode = node.childForFieldName('right');

    if (!leftNode || !operatorNode || !rightNode) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Malformed binary_expression: missing left, operator, or right child. Left: ${leftNode}, Op: ${operatorNode}, Right: ${rightNode}`,
          this.getLocation(node),
          'BinaryExpressionVisitorError'
        )
      );
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
      this.errorHandler.handleError(
        new ast.ParserError(
          `Failed to parse operands in binary expression. Left: ${leftAST}, Right: ${rightAST}`,
          this.getLocation(node),
          'BinaryExpressionVisitorError'
        )
      );
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'binary_expression',
      operator: operator as ast.BinaryOperator, // Cast, assuming grammar aligns with ast.BinaryOperator
      left: leftAST,
      right: rightAST,
      location: this.getLocation(node),
    };
  }
}
