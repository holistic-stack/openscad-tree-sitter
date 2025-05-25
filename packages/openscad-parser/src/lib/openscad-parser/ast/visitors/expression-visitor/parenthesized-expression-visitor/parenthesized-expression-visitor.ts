import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../expression-visitor';

export class ParenthesizedExpressionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected errorHandler: ErrorHandler
  ) {
    super(parentVisitor.source, errorHandler);
  }

  visit(node: TSNode): ast.ExpressionNode | null { // Returns the inner expression's AST node
    if (node.type !== 'parenthesized_expression') {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Expected 'parenthesized_expression' but got '${node.type}'`,
          this.getLocation(node),
          'ParenthesizedExpressionVisitorError'
        )
      );
      return null;
    }
    // The Tree-sitter grammar for parenthesized_expression should have a child
    // that is the actual expression. Common field names are 'expression' or 'inner'.
    // If it's an unnamed child, we might need to iterate or use node.namedChild(0).
    const innerExpressionNode = node.childForFieldName('expression') || node.namedChild(0);

    if (!innerExpressionNode) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Malformed parenthesized_expression: missing inner expression.`,
          this.getLocation(node),
          'ParenthesizedExpressionVisitorError'
        )
      );
      return null;
    }

    // Visit the inner expression and return its AST node directly.
    // The location information will be from the inner expression.
    return this.parentVisitor.visitExpression(innerExpressionNode);
  }
}
