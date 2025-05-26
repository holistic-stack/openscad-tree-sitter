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
    _node: TSNode,
    _functionName: string,
    _args: ast.Parameter[]
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
    // Tree-sitter grammar uses 'operator' and 'operand' field names
    const operatorNode = node.childForFieldName('operator');
    const operandNode = node.childForFieldName('operand');

    if (!operatorNode || !operandNode) {
      // WORKAROUND: Check if this is actually a single expression wrapped in a unary expression node
      // This can happen when the grammar creates nested expression hierarchies for precedence
      if (node.namedChildCount === 1) {
        const child = node.namedChild(0);
        if (child) {
          this.errorHandler.logWarning(
            `[UnaryExpressionVisitor] Detected single expression wrapped as unary expression. Delegating to parent visitor. Node: "${node.text}", Child: "${child.type}"`,
            'UnaryExpressionVisitor.visit',
            node
          );
          // Delegate back to the parent visitor to handle this as a regular expression
          const result = this.parentVisitor.visitExpression(child);
          // Return any valid expression result, but only if it's actually a unary expression
          if (result && result.type === 'expression' && 'expressionType' in result && result.expressionType === 'unary') {
            return result as ast.UnaryExpressionNode;
          }
          // If it's not a unary expression, return null to indicate this isn't a unary expression
          return null;
        }
      }

      // If it's not a simple wrapped expression, it's a real error
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
      expressionType: 'unary_expression',
      operator: operator as ast.UnaryOperator, // Cast, assuming grammar aligns
      operand: operandAST,
      prefix: true, // OpenSCAD unary operators are always prefix
      location: getLocation(node),
    } as ast.UnaryExpressionNode;
  }
}
