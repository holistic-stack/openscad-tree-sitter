import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../../expression-visitor';
import { getLocation } from '../../../utils/location-utils';

export class UnaryExpressionVisitor extends BaseASTVisitor {
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
    // Unary expressions don't handle function calls
    return null;
  }

  visit(node: TSNode): ast.UnaryExpressionNode | null {
    if (node.type !== 'unary_expression') {
      const error = this.errorHandler.createParserError(
        `Expected 'unary_expression' but got '${node.type}'`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }
    // Tree-sitter grammar might use 'argument' or 'operand' for the operand node
    // and 'operator' for the operator node. This needs to match the grammar.
    const operatorNode = node.childForFieldName('operator');
    const operandNode = node.childForFieldName('argument'); // Or 'operand'

    if (!operatorNode || !operandNode) {
      const error = this.errorHandler.createParserError(
        `Malformed unary_expression: missing operator or operand. Operator: ${operatorNode}, Operand: ${operandNode}`,
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
    // Add type guard for ast.UnaryOperator if necessary

    const operandAST = this.parentVisitor.visitExpression(operandNode);

    if (!operandAST) {
      const error = this.errorHandler.createParserError(
        `Failed to parse operand in unary expression.`,
        {
          line: getLocation(operandNode).start.line,
          column: getLocation(operandNode).start.column,
          nodeType: operandNode.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'unary',
      operator: operator as ast.UnaryOperator, // Cast, assuming grammar aligns
      operand: operandAST,
      prefix: true, // OpenSCAD unary operators are always prefix
      location: getLocation(node),
    };
  }
}
