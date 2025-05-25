import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../../expression-visitor';
import { getLocation } from '../../../utils/location-utils';

export class ParenthesizedExpressionVisitor extends BaseASTVisitor {
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
    // Parenthesized expressions don't handle function calls
    return null;
  }

  visit(node: TSNode): ast.ExpressionNode | null { // Returns the inner expression's AST node
    if (node.type !== 'parenthesized_expression') {
      const error = this.errorHandler.createParserError(
        `Expected 'parenthesized_expression' but got '${node.type}'`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }
    // The Tree-sitter grammar for parenthesized_expression should have a child
    // that is the actual expression. Common field names are 'expression' or 'inner'.
    // If it's an unnamed child, we might need to iterate or use node.namedChild(0).
    const innerExpressionNode = node.childForFieldName('expression') || node.namedChild(0);

    if (!innerExpressionNode) {
      const error = this.errorHandler.createParserError(
        `Malformed parenthesized_expression: missing inner expression.`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    // Visit the inner expression and return its AST node directly.
    // The location information will be from the inner expression.
    return this.parentVisitor.visitExpression(innerExpressionNode);
  }
}
