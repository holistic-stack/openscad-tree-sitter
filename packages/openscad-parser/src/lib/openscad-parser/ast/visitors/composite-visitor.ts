import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { ASTVisitor } from './ast-visitor';

/**
 * A visitor that delegates to multiple specialized visitors
 *
 * @file Defines the CompositeVisitor class that delegates to multiple specialized visitors
 */
export class CompositeVisitor implements ASTVisitor {
  /**
   * Create a new CompositeVisitor
   * @param visitors The visitors to delegate to
   */
  constructor(protected visitors: ASTVisitor[]) {}

  /**
   * Visit a node and return the corresponding AST node
   * @param node The node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitNode(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitNode] Processing node - Type: ${node.type}, Text: ${node.text.substring(0, 50)}`);

    // Route to specific visitor methods based on node type
    switch (node.type) {
      case 'assignment_statement':
        return this.visitAssignmentStatement(node);
      case 'statement':
        return this.visitStatement(node);
      case 'module_instantiation':
        return this.visitModuleInstantiation(node);
      case 'module_definition':
        return this.visitModuleDefinition(node);
      case 'function_definition':
        return this.visitFunctionDefinition(node);
      case 'if_statement':
        return this.visitIfStatement(node);
      case 'for_statement':
        return this.visitForStatement(node);
      case 'let_expression':
        return this.visitLetExpression(node);
      case 'conditional_expression':
        return this.visitConditionalExpression(node);
      case 'expression_statement':
        return this.visitExpressionStatement(node);
      case 'accessor_expression':
        return this.visitAccessorExpression(node);
      case 'call_expression':
        return this.visitCallExpression(node);
      case 'expression':
        return this.visitExpression(node);
      case 'block':
        // For block nodes, return the first child that produces a result
        const blockResults = this.visitBlock(node);
        return blockResults.length > 0 ? blockResults[0] : null;
      default:
        // For unknown node types, try each visitor in sequence
        for (const visitor of this.visitors) {
          const result = visitor.visitNode(node);
          if (result) {
            console.log(`[CompositeVisitor.visitNode] Visitor ${visitor.constructor.name} processed node`);
            return result;
          }
        }
        console.log(`[CompositeVisitor.visitNode] No visitor could process node`);
        return null;
    }
  }

  /**
   * Visit all children of a node and return the corresponding AST nodes
   * @param node The node whose children to visit
   * @returns An array of AST nodes
   */
  visitChildren(node: TSNode): ast.ASTNode[] {
    console.log(`[CompositeVisitor.visitChildren] Processing children of node - Type: ${node.type}`);

    const children: ast.ASTNode[] = [];

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      const astNode = this.visitNode(child);
      if (astNode) {
        children.push(astNode);
      }
    }

    console.log(`[CompositeVisitor.visitChildren] Processed ${children.length} children`);
    return children;
  }

  /**
   * Visit a module instantiation node
   * @param node The module instantiation node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitModuleInstantiation(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitModuleInstantiation] Processing module instantiation: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitModuleInstantiation(node);
      if (result) {
        console.log(`[CompositeVisitor.visitModuleInstantiation] Visitor ${visitor.constructor.name} processed module instantiation`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitModuleInstantiation] No visitor could process module instantiation`);
    return null;
  }

  /**
   * Visit a statement node
   * @param node The statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitStatement] Processing statement: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitStatement(node);
      if (result) {
        console.log(`[CompositeVisitor.visitStatement] Visitor ${visitor.constructor.name} processed statement`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitStatement] No visitor could process statement`);
    return null;
  }

  /**
   * Visit a block node
   * @param node The block node to visit
   * @returns An array of AST nodes
   */
  visitBlock(node: TSNode): ast.ASTNode[] {
    console.log(`[CompositeVisitor.visitBlock] Processing block: ${node.text.substring(0, 50)}`);
    return this.visitChildren(node);
  }

  /**
   * Visit a module definition node
   * @param node The module definition node to visit
   * @returns The module definition AST node or null if the node cannot be processed
   */
  visitModuleDefinition(node: TSNode): ast.ModuleDefinitionNode | null {
    console.log(`[CompositeVisitor.visitModuleDefinition] Processing module definition: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitModuleDefinition(node);
      if (result) {
        console.log(`[CompositeVisitor.visitModuleDefinition] Visitor ${visitor.constructor.name} processed module definition`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitModuleDefinition] No visitor could process module definition`);
    return null;
  }

  /**
   * Visit a function definition node
   * @param node The function definition node to visit
   * @returns The function definition AST node or null if the node cannot be processed
   */
  visitFunctionDefinition(node: TSNode): ast.FunctionDefinitionNode | null {
    console.log(`[CompositeVisitor.visitFunctionDefinition] Processing function definition: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitFunctionDefinition(node);
      if (result) {
        console.log(`[CompositeVisitor.visitFunctionDefinition] Visitor ${visitor.constructor.name} processed function definition`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitFunctionDefinition] No visitor could process function definition`);
    return null;
  }

  /**
   * Visit an if statement node
   * @param node The if statement node to visit
   * @returns The if AST node or null if the node cannot be processed
   */
  visitIfStatement(node: TSNode): ast.IfNode | null {
    console.log(`[CompositeVisitor.visitIfStatement] Processing if statement: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitIfStatement(node);
      if (result) {
        console.log(`[CompositeVisitor.visitIfStatement] Visitor ${visitor.constructor.name} processed if statement`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitIfStatement] No visitor could process if statement`);
    return null;
  }

  /**
   * Visit a for statement node
   * @param node The for statement node to visit
   * @returns The for loop AST node or null if the node cannot be processed
   */
  visitForStatement(node: TSNode): ast.ForLoopNode | null {
    console.log(`[CompositeVisitor.visitForStatement] Processing for statement: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitForStatement(node);
      if (result) {
        console.log(`[CompositeVisitor.visitForStatement] Visitor ${visitor.constructor.name} processed for statement`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitForStatement] No visitor could process for statement`);
    return null;
  }

  /**
   * Visit a let expression node
   * @param node The let expression node to visit
   * @returns The let AST node or null if the node cannot be processed
   */
  visitLetExpression(node: TSNode): ast.LetNode | null {
    console.log(`[CompositeVisitor.visitLetExpression] Processing let expression: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitLetExpression(node);
      if (result) {
        console.log(`[CompositeVisitor.visitLetExpression] Visitor ${visitor.constructor.name} processed let expression`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitLetExpression] No visitor could process let expression`);
    return null;
  }

  /**
   * Visit a conditional expression node
   * @param node The conditional expression node to visit
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitConditionalExpression(node: TSNode): ast.ExpressionNode | null {
    console.log(`[CompositeVisitor.visitConditionalExpression] Processing conditional expression: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitConditionalExpression(node);
      if (result) {
        console.log(`[CompositeVisitor.visitConditionalExpression] Visitor ${visitor.constructor.name} processed conditional expression`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitConditionalExpression] No visitor could process conditional expression`);
    return null;
  }

  /**
   * Visit an assignment statement node
   * @param node The assignment statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAssignmentStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitAssignmentStatement] Processing assignment statement: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitAssignmentStatement(node);
      if (result) {
        console.log(`[CompositeVisitor.visitAssignmentStatement] Visitor ${visitor.constructor.name} processed assignment statement`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitAssignmentStatement] No visitor could process assignment statement`);
    return null;
  }

  /**
   * Visit an expression statement node
   * @param node The expression statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpressionStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitExpressionStatement] Processing expression statement: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitExpressionStatement(node);
      if (result) {
        console.log(`[CompositeVisitor.visitExpressionStatement] Visitor ${visitor.constructor.name} processed expression statement`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitExpressionStatement] No visitor could process expression statement`);
    return null;
  }

  /**
   * Visit an accessor expression node (function calls like cube(10))
   * @param node The accessor expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitAccessorExpression(node);
      if (result) {
        console.log(`[CompositeVisitor.visitAccessorExpression] Visitor ${visitor.constructor.name} processed accessor expression`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitAccessorExpression] No visitor could process accessor expression`);
    return null;
  }

  /**
   * Visit a call expression node
   * @param node The call expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitCallExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitCallExpression] Processing call expression: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitCallExpression(node);
      if (result) {
        console.log(`[CompositeVisitor.visitCallExpression] Visitor ${visitor.constructor.name} processed call expression`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitCallExpression] No visitor could process call expression`);
    return null;
  }

  /**
   * Visit an expression node
   * @param node The expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[CompositeVisitor.visitExpression] Processing expression: ${node.text.substring(0, 50)}`);

    // Try each visitor in sequence
    for (const visitor of this.visitors) {
      const result = visitor.visitExpression(node);
      if (result) {
        console.log(`[CompositeVisitor.visitExpression] Visitor ${visitor.constructor.name} processed expression`);
        return result;
      }
    }

    console.log(`[CompositeVisitor.visitExpression] No visitor could process expression`);
    return null;
  }
}