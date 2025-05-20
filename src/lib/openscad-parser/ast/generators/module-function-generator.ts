import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';
import { findDescendantOfType } from '../utils/node-utils';
import { extractArguments } from '../extractors/argument-extractor';
import { extractValue } from '../extractors/value-extractor';

/**
 * Generator for module and function nodes
 */
export class ModuleFunctionGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    // This method is required by BaseGenerator but not used for module and function definitions
    // For module instantiations, we'll create a ModuleInstantiationNode
    return this.createModuleInstantiationNode(node, functionName, args);
  }

  /**
   * Process a module definition node
   */
  public processModuleDefinition(node: TSNode): ast.ModuleDefinitionNode | null {
    console.log(`[ModuleFunctionGenerator.processModuleDefinition] Processing module definition: ${node.text.substring(0, 50)}`);
    
    // Extract the module name
    const nameNode = node.childForFieldName('name');
    if (!nameNode) {
      console.warn('[ModuleFunctionGenerator.processModuleDefinition] No name found in module definition');
      return null;
    }
    const name = nameNode.text;

    // Extract the parameters
    const parametersNode = node.childForFieldName('parameters');
    const parameters: ast.ModuleParameter[] = [];
    
    if (parametersNode) {
      const paramDeclarationsNode = parametersNode.childForFieldName('parameter_declarations');
      if (paramDeclarationsNode) {
        for (let i = 0; i < paramDeclarationsNode.namedChildCount; i++) {
          const paramNode = paramDeclarationsNode.namedChild(i);
          if (paramNode && paramNode.type === 'parameter_declaration') {
            const paramName = paramNode.namedChild(0)?.text;
            if (paramName) {
              // Check if there's a default value
              if (paramNode.namedChildCount > 1 && paramNode.namedChild(1)?.type === 'expression') {
                const defaultValueNode = paramNode.namedChild(1);
                const defaultValue = extractValue(defaultValueNode);
                parameters.push({ name: paramName, defaultValue });
              } else {
                parameters.push({ name: paramName });
              }
            }
          }
        }
      }
    }

    // Extract the body
    const bodyNode = node.childForFieldName('body');
    if (!bodyNode) {
      console.warn('[ModuleFunctionGenerator.processModuleDefinition] No body found in module definition');
      return null;
    }

    // Process the body
    const body: ast.ASTNode[] = [];
    this.processBodyNode(bodyNode, body);

    return {
      type: 'module_definition',
      name,
      parameters,
      body,
      location: getLocation(node)
    };
  }

  /**
   * Process a function definition node
   */
  public processFunctionDefinition(node: TSNode): ast.FunctionDefinitionNode | null {
    console.log(`[ModuleFunctionGenerator.processFunctionDefinition] Processing function definition: ${node.text.substring(0, 50)}`);
    
    // Extract the function name
    const nameNode = node.childForFieldName('name');
    if (!nameNode) {
      console.warn('[ModuleFunctionGenerator.processFunctionDefinition] No name found in function definition');
      return null;
    }
    const name = nameNode.text;

    // Extract the parameters
    const parametersNode = node.childForFieldName('parameters');
    const parameters: ast.ModuleParameter[] = [];
    
    if (parametersNode) {
      const paramDeclarationsNode = parametersNode.childForFieldName('parameter_declarations');
      if (paramDeclarationsNode) {
        for (let i = 0; i < paramDeclarationsNode.namedChildCount; i++) {
          const paramNode = paramDeclarationsNode.namedChild(i);
          if (paramNode && paramNode.type === 'parameter_declaration') {
            const paramName = paramNode.namedChild(0)?.text;
            if (paramName) {
              // Check if there's a default value
              if (paramNode.namedChildCount > 1 && paramNode.namedChild(1)?.type === 'expression') {
                const defaultValueNode = paramNode.namedChild(1);
                const defaultValue = extractValue(defaultValueNode);
                parameters.push({ name: paramName, defaultValue });
              } else {
                parameters.push({ name: paramName });
              }
            }
          }
        }
      }
    }

    // Extract the expression
    const valueNode = node.childForFieldName('value');
    if (!valueNode) {
      console.warn('[ModuleFunctionGenerator.processFunctionDefinition] No value found in function definition');
      return null;
    }

    // Process the expression
    const expression = this.processExpression(valueNode);
    if (!expression) {
      console.warn('[ModuleFunctionGenerator.processFunctionDefinition] Failed to process expression in function definition');
      return null;
    }

    return {
      type: 'function_definition',
      name,
      parameters,
      expression,
      location: getLocation(node)
    };
  }

  /**
   * Create a module instantiation node
   */
  private createModuleInstantiationNode(node: TSNode, name: string, args: ast.Parameter[]): ast.ModuleInstantiationNode {
    console.log(`[ModuleFunctionGenerator.createModuleInstantiationNode] Creating module instantiation node for: ${name}`);
    
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'module_instantiation',
      name,
      arguments: args,
      children,
      location: getLocation(node)
    };
  }

  /**
   * Process a children() call in a module
   */
  public processChildrenNode(node: TSNode): ast.ChildrenNode | null {
    console.log(`[ModuleFunctionGenerator.processChildrenNode] Processing children node: ${node.text.substring(0, 50)}`);
    
    // Check if there's an index specified
    let index: number | undefined = undefined;
    
    // Look for an expression in parentheses
    const expressionNode = findDescendantOfType(node, 'expression');
    if (expressionNode) {
      const indexValue = extractValue(expressionNode);
      if (typeof indexValue === 'number') {
        index = indexValue;
      }
    }

    return {
      type: 'children',
      index,
      location: getLocation(node)
    };
  }

  /**
   * Process child nodes of a module instantiation
   */
  private processChildNodes(node: TSNode, children: ast.ASTNode[]): void {
    // Check for a body node
    const bodyNode = node.childForFieldName('body');
    if (bodyNode) {
      if (bodyNode.type === 'block') {
        console.log(`[ModuleFunctionGenerator.processChildNodes] Found block body for ${node.text.substring(0,30)}`);
        for (const statementCSTNode of bodyNode.children) {
          if (statementCSTNode && statementCSTNode.type === 'statement') {
            this.processNode(statementCSTNode, children);
          }
        }
      } else if (bodyNode.type === 'statement') {
        console.log(`[ModuleFunctionGenerator.processChildNodes] Found statement body for ${node.text.substring(0,30)}: ${bodyNode.text.substring(0,20)}`);
        this.processNode(bodyNode, children);
      }
    } else {
      // No explicit body, check for an immediately following statement
      const nextSibling = node.nextSibling;
      if (nextSibling && nextSibling.type === 'statement') {
        console.log(`[ModuleFunctionGenerator.processChildNodes] Found next sibling statement for ${node.text.substring(0,30)}: ${nextSibling.text.substring(0,20)}`);
        this.processNode(nextSibling, children);
      } else {
        console.log(`[ModuleFunctionGenerator.processChildNodes] No body and no next sibling statement found for ${node.text.substring(0,30)}. Next sibling type: ${nextSibling?.type}`);
      }
    }
  }

  /**
   * Process a body node (block or statement)
   */
  private processBodyNode(node: TSNode, children: ast.ASTNode[]): void {
    if (node.type === 'block') {
      // Process all statements in the block
      for (let i = 0; i < node.namedChildCount; i++) {
        const statementNode = node.namedChild(i);
        if (statementNode && statementNode.type === 'statement') {
          this.processNode(statementNode, children);
        }
      }
    } else if (node.type === 'statement') {
      // Process a single statement
      this.processNode(node, children);
    } else {
      console.warn(`[ModuleFunctionGenerator.processBodyNode] Unexpected body node type: ${node.type}`);
    }
  }

  /**
   * Process an expression node
   */
  private processExpression(node: TSNode): ast.ExpressionNode | null {
    if (!node) return null;

    // For simplicity, create a basic variable expression
    // In a real implementation, this would delegate to the ExpressionGenerator
    return {
      type: 'expression',
      expressionType: 'variable',
      name: node.text,
      location: getLocation(node)
    };
  }
}
