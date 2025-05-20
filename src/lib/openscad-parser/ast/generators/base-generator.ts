import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { findDescendantOfType } from '../utils/node-utils';
import { extractArguments } from '../extractors/argument-extractor';

/**
 * Base class for all AST generators
 */
export abstract class BaseGenerator {
  /**
   * Process a node and add the resulting AST node to the children array
   */
  public processNode(node: TSNode, children: ast.ASTNode[]): void {
    console.log(`[BaseGenerator.processNode] Processing node: type='${node.type}', text='${node.text.substring(0,30)}'`);
    
    if (node.type === 'statement') {
      // Look for module_instantiation in the statement
      const moduleInstantiation = findDescendantOfType(node, 'module_instantiation');
      if (moduleInstantiation) {
        console.log(`[BaseGenerator.processNode] Found module_instantiation in statement: ${moduleInstantiation.text.substring(0,30)}`);
        const astNode = this.processModuleInstantiation(moduleInstantiation);
        if (astNode) {
          children.push(astNode);
        }
      } else {
        console.log(`[BaseGenerator.processNode] No module_instantiation found in statement: ${node.text.substring(0,30)}`);
      }
    } else if (node.type === 'module_instantiation') {
      console.log(`[BaseGenerator.processNode] Processing module_instantiation directly: ${node.text.substring(0,30)}`);
      const astNode = this.processModuleInstantiation(node);
      if (astNode) {
        children.push(astNode);
      }
    } else {
      console.log(`[BaseGenerator.processNode] Unhandled node type: ${node.type}`);
    }
  }

  /**
   * Process a module_instantiation node
   */
  public processModuleInstantiation(node: TSNode): ast.ASTNode | null {
    // Ensure we have a function name from the 'name' field
    const nameFieldNode = node.childForFieldName('name');
    console.log('[BaseGenerator.processModuleInstantiation] Processing node:', node.type, node.text.substring(0, 40));
    if (!nameFieldNode) {
      console.error('[BaseGenerator.processModuleInstantiation] No nameFieldNode found for:', node.text.substring(0, 40));
      return null;
    }
    console.log('[BaseGenerator.processModuleInstantiation] nameFieldNode:', nameFieldNode.type, nameFieldNode.text);
    
    // Assuming the name field contains an identifier or an accessor_expression whose text is the name
    const functionName = nameFieldNode?.text; 
    if (!functionName) {
      console.error('[BaseGenerator.processModuleInstantiation] functionName is null or empty from nameFieldNode.text for:', nameFieldNode.text);
      return null;
    }
    console.log('[BaseGenerator.processModuleInstantiation] Extracted functionName:', functionName);

    // Get the arguments from the 'arguments' field
    const argsNode = node.childForFieldName('arguments');
    const args = argsNode ? extractArguments(argsNode) : [];

    // Create the appropriate node based on the function name
    return this.createASTNode(node, functionName, args);
  }

  /**
   * Create an AST node based on the function name
   */
  protected abstract createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null;

  /**
   * Create a generic function call node
   */
  protected createFunctionCallNode(node: TSNode, name: string, args: ast.Parameter[]): ast.FunctionCallNode {
    return {
      type: 'function_call',
      name,
      arguments: args,
      location: getLocation(node)
    };
  }
}
