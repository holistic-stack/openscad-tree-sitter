import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../expression-visitor';

export class UnaryExpressionVisitor extends BaseASTVisitor {
  constructor(
    protected parentVisitor: ExpressionVisitor,
    protected errorHandler: ErrorHandler
  ) {
    super(parentVisitor.source, errorHandler);
  }

  visit(node: TSNode): ast.UnaryExpressionNode | null {
    if (node.type !== 'unary_expression') {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Expected 'unary_expression' but got '${node.type}'`,
          this.getLocation(node),
          'UnaryExpressionVisitorError'
        )
      );
      return null;
    }
    // Tree-sitter grammar might use 'argument' or 'operand' for the operand node
    // and 'operator' for the operator node. This needs to match the grammar.
    const operatorNode = node.childForFieldName('operator');
    const operandNode = node.childForFieldName('argument'); // Or 'operand'

    if (!operatorNode || !operandNode) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Malformed unary_expression: missing operator or operand. Operator: ${operatorNode}, Operand: ${operandNode}`,
          this.getLocation(node),
          'UnaryExpressionVisitorError'
        )
      );
      return null;
    }

    const operator = operatorNode.text;
    // Add type guard for ast.UnaryOperator if necessary

    const operandAST = this.parentVisitor.visitExpression(operandNode);

    if (!operandAST) {
      this.errorHandler.handleError(
        new ast.ParserError(
          `Failed to parse operand in unary expression.`,
          this.getLocation(operandNode), // Location of the problematic operand
          'UnaryExpressionVisitorError'
        )
      );
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'unary_expression',
      operator: operator as ast.UnaryOperator, // Cast, assuming grammar aligns
      operand: operandAST,
      location: this.getLocation(node),
    };
  }
}
