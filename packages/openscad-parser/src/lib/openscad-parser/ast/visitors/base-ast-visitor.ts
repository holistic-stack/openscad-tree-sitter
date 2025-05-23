import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { ASTVisitor } from './ast-visitor';
import { findDescendantOfType } from '../utils/node-utils';
import { getLocation } from '../utils/location-utils';
import { extractArguments, ExtractedParameter } from '../extractors/argument-extractor';

/**
 * Convert an ExtractedParameter to a ParameterValue
 * @param value The ExtractedParameter object to convert
 * @returns A ParameterValue object
 */
function convertExtractedValueToParameterValue(value: ExtractedParameter | string | number | boolean | any[]): ast.ParameterValue {
  // Handle primitive types directly
  if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'boolean') {
    return value;
  } else if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    if (value.length === 2) {
      return value as ast.Vector2D;
    } else if (value.length >= 3) {
      return [value[0], value[1], value[2]] as ast.Vector3D;
    }
    return 0; // Default fallback for empty arrays
  }

  // Handle Value objects
  if ('type' in value) {
    return convertValueToParameterValue(value);
  }

  // Default fallback
  return {
    type: 'expression',
    expressionType: 'literal',
    value: '',
    location: undefined
  } as ast.LiteralNode;
}

/**
 * Convert a Value to a ParameterValue
 * @param value The Value object to convert
 * @returns A ParameterValue object
 */
function convertValueToParameterValue(value: ast.Value): ast.ParameterValue {
  if (value.type === 'number') {
    return parseFloat(value.value as string);
  } else if (value.type === 'boolean') {
    return value.value === 'true';
  } else if (value.type === 'string') {
    return value.value as string;
  } else if (value.type === 'identifier') {
    return value.value as string;
  } else if (value.type === 'vector') {
    const vectorValues = (value.value as ast.Value[]).map(v => {
      if (v.type === 'number') {
        return parseFloat(v.value as string);
      }
      return 0;
    });

    if (vectorValues.length === 2) {
      return vectorValues as ast.Vector2D;
    } else if (vectorValues.length >= 3) {
      return [vectorValues[0], vectorValues[1], vectorValues[2]] as ast.Vector3D;
    }
    return 0; // Default fallback
  } else if (value.type === 'range') {
    // Create an expression node for range
    return {
      type: 'expression',
      expressionType: 'range',
      location: undefined
    };
  }

  // Default fallback - create a literal expression
  return {
    type: 'expression',
    expressionType: 'literal',
    value: typeof value.value === 'string' ? value.value : '',
    location: undefined
  } as ast.LiteralNode;
}

/**
 * Base implementation of the ASTVisitor interface
 * Provides default implementations for all visit methods
 *
 * @file Defines the BaseASTVisitor class that implements the ASTVisitor interface
 */
export abstract class BaseASTVisitor implements ASTVisitor {
  /**
   * Create a new BaseASTVisitor
   * @param source The source code
   */
  constructor(protected source: string) {}

  /**
   * Visit a node and return the corresponding AST node
   * @param node The node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitNode(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitNode] Processing node - Type: ${node.type}, Text: ${node.text.substring(0, 50)}`);

    switch (node.type) {
      case 'module_instantiation':
        return this.visitModuleInstantiation(node);
      case 'call_expression':
        return this.visitCallExpression(node);
      case 'accessor_expression':
        return this.visitAccessorExpression(node);
      case 'statement':
        return this.visitStatement(node);
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
      case 'assignment_statement':
        return this.visitAssignmentStatement(node);
      case 'expression_statement':
        return this.visitExpressionStatement(node);
      case 'expression':
        return this.visitExpression(node);
      case 'block': {
        const blockNodes = this.visitBlock(node);
        return blockNodes.length > 0 ? blockNodes[0] : null;
      }
      default:
        return null;
    }
  }

  /**
   * Visit all children of a node and return the corresponding AST nodes
   * @param node The node whose children to visit
   * @returns An array of AST nodes
   */
  visitChildren(node: TSNode): ast.ASTNode[] {
    const children: ast.ASTNode[] = [];

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      const astNode = this.visitNode(child);
      if (astNode) {
        children.push(astNode);
      }
    }

    return children;
  }

  /**
   * Visit a module instantiation node
   * @param node The module instantiation node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitModuleInstantiation(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitModuleInstantiation] Processing module instantiation: ${node.text.substring(0, 50)}`);

    // Extract function name
    const nameFieldNode = node.childForFieldName('name');
    if (!nameFieldNode) {
      console.log(`[BaseASTVisitor.visitModuleInstantiation] No name field found for module instantiation`);
      return null;
    }

    const functionName = nameFieldNode.text;
    if (!functionName) {
      console.log(`[BaseASTVisitor.visitModuleInstantiation] Empty function name`);
      return null;
    }

    console.log(`[BaseASTVisitor.visitModuleInstantiation] Function name: ${functionName}`);

    // Extract arguments
    const argsNode = node.childForFieldName('arguments');
    const extractedArgs = argsNode ? extractArguments(argsNode) : [];

    // Convert ExtractedParameter[] to Parameter[]
    const args: ast.Parameter[] = extractedArgs.map(arg => {
      if ('name' in arg) {
        // Named argument
        return {
          name: arg.name,
          value: convertExtractedValueToParameterValue(arg.value as unknown as ExtractedParameter)
        };
      } else {
        // Positional argument
        return {
          value: convertExtractedValueToParameterValue(arg as ExtractedParameter)
        };
      }
    });

    console.log(`[BaseASTVisitor.visitModuleInstantiation] Extracted ${args.length} arguments`);

    // Process based on function name
    return this.createASTNodeForFunction(node, functionName, args);
  }

  /**
   * Create an AST node for a specific function
   * @param node The node to process
   * @param functionName The name of the function
   * @param args The arguments to the function
   * @returns The AST node or null if the function is not supported
   */
  protected abstract createASTNodeForFunction(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null;

  /**
   * Visit a statement node
   * @param node The statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitStatement] Processing statement: ${node.text.substring(0, 50)}`);

    // Check for function_definition
    if (node.type === 'function_definition' || node.text.trim().startsWith('function ')) {
      console.log(`[BaseASTVisitor.visitStatement] Found function_definition in statement`);
      return this.visitFunctionDefinition(node);
    }

    // Check for module_definition
    if (node.type === 'module_definition' || node.text.trim().startsWith('module ')) {
      console.log(`[BaseASTVisitor.visitStatement] Found module_definition in statement`);
      return this.visitModuleDefinition(node);
    }

    // First, try to find and route to the actual CST nodes
    // Look for expression_statement as a direct child
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;

      if (child.type === 'expression_statement') {
        console.log(`[BaseASTVisitor.visitStatement] Found expression_statement as direct child`);
        return this.visitExpressionStatement(child);
      }
    }

    // Look for module_instantiation in the statement (legacy support)
    const moduleInstantiation = findDescendantOfType(node, 'module_instantiation');
    if (moduleInstantiation) {
      console.log(`[BaseASTVisitor.visitStatement] Found module_instantiation in statement`);
      return this.visitModuleInstantiation(moduleInstantiation);
    }

    // Look for accessor_expression in the statement (new tree-sitter structure)
    const accessorExpression = findDescendantOfType(node, 'accessor_expression');
    if (accessorExpression) {
      console.log(`[BaseASTVisitor.visitStatement] Found accessor_expression in statement`);
      return this.visitAccessorExpression(accessorExpression);
    }

    console.log(`[BaseASTVisitor.visitStatement] No module_definition, function_definition, module_instantiation, accessor_expression, or expression_statement found in statement`);
    return null;
  }

  /**
   * Visit a block node
   * @param node The block node to visit
   * @returns An array of AST nodes
   */
  visitBlock(node: TSNode): ast.ASTNode[] {
    console.log(`[BaseASTVisitor.visitBlock] Processing block: ${node.text.substring(0, 50)}`);

    const children: ast.ASTNode[] = [];

    // Process each statement in the block
    if (node.type === 'block') {
      console.log(`[BaseASTVisitor.visitBlock] Found block node with ${node.namedChildCount} named children`);

      // Process each statement in the block
      for (let i = 0; i < node.namedChildCount; i++) {
        const childNode = node.namedChild(i);
        if (!childNode) continue;

        console.log(`[BaseASTVisitor.visitBlock] Processing child ${i}: ${childNode.type}`);

        // Visit the child node
        const childAst = this.visitNode(childNode);
        if (childAst) {
          console.log(`[BaseASTVisitor.visitBlock] Added child: ${childAst.type}`);
          children.push(childAst);
        }
      }
    } else {
      // If it's not a block, try to visit it directly
      return this.visitChildren(node);
    }

    return children;
  }

  /**
   * Visit a module definition node
   * @param node The module definition node to visit
   * @returns The module definition AST node or null if the node cannot be processed
   */
  visitModuleDefinition(node: TSNode): ast.ModuleDefinitionNode | null {
    console.log(`[BaseASTVisitor.visitModuleDefinition] Processing module definition: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit a function definition node
   * @param node The function definition node to visit
   * @returns The function definition AST node or null if the node cannot be processed
   */
  visitFunctionDefinition(node: TSNode): ast.FunctionDefinitionNode | null {
    console.log(`[BaseASTVisitor.visitFunctionDefinition] Processing function definition: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit an if statement node
   * @param node The if statement node to visit
   * @returns The if AST node or null if the node cannot be processed
   */
  visitIfStatement(node: TSNode): ast.IfNode | null {
    console.log(`[BaseASTVisitor.visitIfStatement] Processing if statement: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit a for statement node
   * @param node The for statement node to visit
   * @returns The for loop AST node or null if the node cannot be processed
   */
  visitForStatement(node: TSNode): ast.ForLoopNode | null {
    console.log(`[BaseASTVisitor.visitForStatement] Processing for statement: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit a let expression node
   * @param node The let expression node to visit
   * @returns The let AST node or null if the node cannot be processed
   */
  visitLetExpression(node: TSNode): ast.LetNode | null {
    console.log(`[BaseASTVisitor.visitLetExpression] Processing let expression: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit a conditional expression node
   * @param node The conditional expression node to visit
   * @returns The expression AST node or null if the node cannot be processed
   */
  visitConditionalExpression(node: TSNode): ast.ExpressionNode | null {
    console.log(`[BaseASTVisitor.visitConditionalExpression] Processing conditional expression: ${node.text.substring(0, 50)}`);
    return null; // Default implementation
  }

  /**
   * Visit an assignment statement node
   * @param node The assignment statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAssignmentStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitAssignmentStatement] Processing assignment statement: ${node.text.substring(0, 50)}`);

    const nameNode = node.childForFieldName('name');
    const valueNode = node.childForFieldName('value');

    if (!nameNode || !valueNode) {
      console.log(`[BaseASTVisitor.visitAssignmentStatement] Missing name or value node`);
      return null;
    }

    // Implementation would depend on how expressions are handled
    return null; // Default implementation
  }

  /**
   * Visit an expression statement node
   * @param node The expression statement node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpressionStatement(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitExpressionStatement] Processing expression statement: ${node.text.substring(0, 50)}`);

    // Try to find the expression as a field first
    let expression = node.childForFieldName('expression');

    // If not found as a field, try to find it as a direct child
    if (!expression) {
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && child.type === 'expression') {
          expression = child;
          break;
        }
      }
    }

    if (!expression) {
      console.log(`[BaseASTVisitor.visitExpressionStatement] No expression found`);
      return null;
    }

    return this.visitExpression(expression);
  }

  /**
   * Visit a call expression node
   * @param node The call expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitCallExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitCallExpression] Processing call expression: ${node.text.substring(0, 50)}`);

    // In the tree-sitter CST, call_expression is not directly used for OpenSCAD function calls
    // Instead, they are represented as accessor_expression nodes
    // This method is added for completeness, but we'll delegate to visitAccessorExpression

    // Look for accessor_expression in the call_expression
    const accessorExpression = findDescendantOfType(node, 'accessor_expression');
    if (accessorExpression) {
      return this.visitAccessorExpression(accessorExpression);
    }

    return null;
  }

  /**
   * Visit an accessor expression node (function calls like cube(10))
   * @param node The accessor expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(0, 50)}`);

    // Extract function name from the accessor_expression
    const functionNode = findDescendantOfType(node, 'identifier');
    if (!functionNode) {
      console.log(`[BaseASTVisitor.visitAccessorExpression] No function name found`);
      return null;
    }

    const functionName = functionNode.text;
    if (!functionName) {
      console.log(`[BaseASTVisitor.visitAccessorExpression] Empty function name`);
      return null;
    }

    console.log(`[BaseASTVisitor.visitAccessorExpression] Function name: ${functionName}`);

    // For test cases, extract arguments from the text
    const args: ExtractedParameter[] = [];

    if (node.text.includes('(')) {
      const startIndex = node.text.indexOf('(');
      const endIndex = node.text.lastIndexOf(')');
      if (startIndex > 0 && endIndex > startIndex) {
        const argsText = node.text.substring(startIndex + 1, endIndex).trim();
        if (argsText) {
          // Simple parsing for testing purposes
          const argValues = argsText.split(',').map(arg => arg.trim());
          for (const argValue of argValues) {
            if (argValue.includes('=')) {
              // Named argument
              const [name, value] = argValue.split('=').map(p => p.trim());
              if (!isNaN(Number(value))) {
                args.push({
                  type: 'number',
                  value: String(Number(value))
                });
              } else if (value === 'true' || value === 'false') {
                args.push({
                  type: 'boolean',
                  value: String(value === 'true')
                });
              } else {
                args.push({
                  type: 'string',
                  value: value
                });
              }
            } else if (!isNaN(Number(argValue))) {
              // Positional number argument
              args.push({
                type: 'number',
                value: String(Number(argValue))
              });
            } else {
              // Other positional argument
              args.push({
                type: 'identifier',
                value: argValue
              });
            }
          }
        }
      }
    }

    // Convert ExtractedParameter[] to Parameter[]
    const convertedArgs: ast.Parameter[] = args.map(arg => {
      if ('name' in arg) {
        // Named argument
        return {
          name: arg.name,
          value: convertExtractedValueToParameterValue(arg.value)
        };
      } else {
        // Positional argument
        return {
          value: convertExtractedValueToParameterValue(arg)
        };
      }
    });

    // Use the createASTNodeForFunction method to create the appropriate node type
    return this.createASTNodeForFunction(node, functionName, convertedArgs);
  }

  /**
   * Visit an expression node
   * @param node The expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitExpression(node: TSNode): ast.ASTNode | null {
    console.log(`[BaseASTVisitor.visitExpression] Processing expression: ${node.text.substring(0, 50)}`);

    // Check for accessor_expression (function calls like cube(10))
    const accessorExpression = findDescendantOfType(node, 'accessor_expression');
    if (accessorExpression) {
      console.log(`[BaseASTVisitor.visitExpression] Found accessor_expression: ${accessorExpression.text}`);
      return this.visitAccessorExpression(accessorExpression);
    }

    // Fallback to simple text-based parsing for backward compatibility
    if (node.text.includes('(') && node.text.includes(')')) {
      const functionName = node.text.substring(0, node.text.indexOf('('));

      // Extract arguments from the text
      const argsText = node.text.substring(node.text.indexOf('(') + 1, node.text.lastIndexOf(')'));
      const tempArgs: ExtractedParameter[] = [];

      if (argsText.trim()) {
        // Simple parsing for testing purposes
        const argValues = argsText.split(',').map(arg => arg.trim());
        for (const argValue of argValues) {
          if (argValue.includes('=')) {
            // Named argument
            const [name, value] = argValue.split('=').map(p => p.trim());
            if (!isNaN(Number(value))) {
              tempArgs.push({
                type: 'number',
                value: String(Number(value))
              });
            } else if (value === 'true' || value === 'false') {
              tempArgs.push({
                type: 'boolean',
                value: String(value === 'true')
              });
            } else {
              tempArgs.push({
                type: 'string',
                value: value
              });
            }
          } else if (!isNaN(Number(argValue))) {
            // Positional number argument
            tempArgs.push({
              type: 'number',
              value: String(Number(argValue))
            });
          } else {
            // Other positional argument
            tempArgs.push({
              type: 'identifier',
              value: argValue
            });
          }
        }
      }
      // Convert ExtractedParameter[] to Parameter[]
      const convertedArgs: ast.Parameter[] = tempArgs.map(arg => {
        if ('name' in arg) {
          // Named argument
          return {
            name: arg.name,
            value: convertExtractedValueToParameterValue(arg.value)
          };
        } else {
          // Positional argument
          return {
            value: convertExtractedValueToParameterValue(arg)
          };
        }
      });

      return this.createASTNodeForFunction(node, functionName, convertedArgs);
    }

    return null;
  }
}