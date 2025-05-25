import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../../../ast-types';
import { BaseASTVisitor } from '../../base-ast-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { ExpressionVisitor } from '../../expression-visitor';
import { getLocation } from '../../../utils/location-utils';

export class ConditionalExpressionVisitor extends BaseASTVisitor {
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
    // Conditional expressions don't handle function calls
    return null;
  }

  visit(node: TSNode): ast.ConditionalExpressionNode | null {
    if (node.type !== 'conditional_expression') {
      const error = this.errorHandler.createParserError(
        `Expected 'conditional_expression' but got '${node.type}'`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }
    const conditionNode = node.childForFieldName('condition');
    const consequenceNode = node.childForFieldName('consequence');
    const alternativeNode = node.childForFieldName('alternative');

    if (!conditionNode || !consequenceNode || !alternativeNode) {
      // WORKAROUND: Check if this is actually a simple literal that was misclassified as conditional_expression
      // This can happen due to grammar issues where simple expressions are incorrectly parsed
      if (node.childCount === 1 && node.namedChildCount === 1) {
        const child = node.namedChild(0);
        if (child) {
          this.errorHandler.logWarning(
            `[ConditionalExpressionVisitor] Detected misclassified literal as conditional_expression. Delegating to parent visitor. Node: "${node.text}", Child: "${child.type}"`,
            'ConditionalExpressionVisitor.visit',
            node
          );
          // Delegate back to the parent visitor to handle this as a regular expression
          return this.parentVisitor.visitExpression(child);
        }
      }

      // If it's not a simple misclassified literal, it's a real error
      const error = this.errorHandler.createParserError(
        `Malformed conditional_expression: missing condition, consequence, or alternative.`,
        {
          line: getLocation(node).start.line,
          column: getLocation(node).start.column,
          nodeType: node.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    const conditionAST = this.parentVisitor.visitExpression(conditionNode);
    if (!conditionAST) {
      const error = this.errorHandler.createParserError(
        `Failed to parse condition in conditional expression.`,
        {
          line: getLocation(conditionNode).start.line,
          column: getLocation(conditionNode).start.column,
          nodeType: conditionNode.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    const consequenceAST = this.parentVisitor.visitExpression(consequenceNode);
    if (!consequenceAST) {
      const error = this.errorHandler.createParserError(
        `Failed to parse consequence in conditional expression.`,
        {
          line: getLocation(consequenceNode).start.line,
          column: getLocation(consequenceNode).start.column,
          nodeType: consequenceNode.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    const alternativeAST = this.parentVisitor.visitExpression(alternativeNode);
    if (!alternativeAST) {
      const error = this.errorHandler.createParserError(
        `Failed to parse alternative in conditional expression.`,
        {
          line: getLocation(alternativeNode).start.line,
          column: getLocation(alternativeNode).start.column,
          nodeType: alternativeNode.type
        }
      );
      this.errorHandler.report(error);
      return null;
    }

    return {
      type: 'expression',
      expressionType: 'conditional',
      condition: conditionAST,
      thenBranch: consequenceAST,
      elseBranch: alternativeAST,
      location: getLocation(node),
    };
  }
}
