import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../expression-visitor';

export class ConditionalExpressionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected errorHandler: ErrorHandler
  ) {
    super(parentVisitor.source, errorHandler);
  }

  visit(node: TSNode): ast.ConditionalExpressionNode | null {
    if (node.type !== 'conditional_expression') {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Expected 'conditional_expression' but got '${node.type}'`,
          this.getLocation(node),
          'ConditionalExpressionVisitorError'
        )
      );
      return null;
    }
    const conditionNode = node.childForFieldName('condition');
    const consequenceNode = node.childForFieldName('consequence');
    const alternativeNode = node.childForFieldName('alternative');

    if (!conditionNode || !consequenceNode || !alternativeNode) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Malformed conditional_expression: missing condition, consequence, or alternative.`,
          this.getLocation(node),
          'ConditionalExpressionVisitorError'
        )
      );
      return null;
    }

    const conditionAST = this.parentVisitor.visitExpression(conditionNode);
    if (!conditionAST) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Failed to parse condition in conditional expression.`,
          this.getLocation(conditionNode),
          'ConditionalExpressionVisitorError'
        )
      );
      return null;
    }

    const consequenceAST = this.parentVisitor.visitExpression(consequenceNode);
    if (!consequenceAST) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Failed to parse consequence in conditional expression.`,
          this.getLocation(consequenceNode),
          'ConditionalExpressionVisitorError'
        )
      );
      return null;
    }

    const alternativeAST = this.parentVisitor.visitExpression(alternativeNode);
    if (!alternativeAST) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Failed to parse alternative in conditional expression.`,
          this.getLocation(alternativeNode),
          'ConditionalExpressionVisitorError'
        )
      );
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'conditional_expression',
      condition: conditionAST,
      consequence: consequenceAST,
      alternative: alternativeAST,
      location: this.getLocation(node),
    };
  }
}
