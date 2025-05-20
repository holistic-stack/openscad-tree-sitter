import { Tree, Node } from 'web-tree-sitter';
import * as ast from './ast-types';
import {
  BaseGenerator,
  PrimitiveGenerator,
  TransformGenerator,
  ExpressionGenerator,
  CSGGenerator,
  ControlStructureGenerator,
  ModuleFunctionGenerator
} from './generators';
import { findDescendantOfType } from './utils/node-utils';
import { getLocation } from './utils/location-utils';
import { extractArguments } from './extractors/argument-extractor';
import { NodeHandlerRegistry } from './registry/node-handler-registry';
import { NodeHandlerRegistryFactory } from './registry/node-handler-registry-factory';

// Type alias for web-tree-sitter's Node type
type TSNode = Node;

/**
 * Converts a Tree-sitter CST to an OpenSCAD AST using a modular approach
 * with specialized generators for different node types.
 * Uses a registry system for O(1) lookup of node handlers.
 */
export class ModularASTGenerator {
  private primitiveGenerator: PrimitiveGenerator;
  private transformGenerator: TransformGenerator;
  private csgGenerator: CSGGenerator;
  private expressionGenerator: ExpressionGenerator;
  private controlStructureGenerator: ControlStructureGenerator;
  private moduleFunctionGenerator: ModuleFunctionGenerator;
  private source: string;
  private registry: NodeHandlerRegistry;

  constructor(private tree: Tree, source: string) {
    this.source = source;
    this.primitiveGenerator = new PrimitiveGenerator();
    this.transformGenerator = new TransformGenerator();
    this.csgGenerator = new CSGGenerator();
    this.expressionGenerator = new ExpressionGenerator();
    this.controlStructureGenerator = new ControlStructureGenerator();
    this.moduleFunctionGenerator = new ModuleFunctionGenerator();

    // Initialize the registry
    this.registry = NodeHandlerRegistryFactory.createRegistry();
  }

  /**
   * Generate the AST from the CST
   */
  public generate(): ast.ASTNode[] {
    const statements: ast.ASTNode[] = [];

    console.log('[ModularASTGenerator.generate] Starting AST generation.');
    const rootNode = this.tree.rootNode;
    if (!rootNode) {
      console.log('[ModularASTGenerator.generate] No root node found. Returning empty array.');
      return statements;
    }
    console.log(`[ModularASTGenerator.generate] Root node type: ${rootNode.type}, Text: ${rootNode.text.substring(0, 50)}`);
    console.log(`[ModularASTGenerator.generate] Root node childCount: ${rootNode.childCount}, namedChildCount: ${rootNode.namedChildCount}`);

    // Log a few children for debugging
    for(let i = 0; i < Math.min(rootNode.namedChildCount, 5); i++) {
      const child = rootNode.namedChild(i);
      if (child) {
        console.log(`[ModularASTGenerator.generate] Root named child ${i}: type=${child.type}, text=${child.text.substring(0,30)}`);
      }
    }

    // Process the entire tree recursively to find all module instantiations
    this.processNode(rootNode, statements);
    console.log(`[ModularASTGenerator.generate] Finished processing. Statements count: ${statements.length}`);
    return statements;
  }

  /**
   * Process a node and its children recursively
   */
  private processNode(node: TSNode, statements: ast.ASTNode[]): void {
    console.log(`[ModularASTGenerator.processNode] Processing node - Type: ${node.type}, Text: ${node.text.substring(0, 50)}`);

    // Check if this node is a module instantiation
    if (node.type === 'module_instantiation') {
      console.log(`[ModularASTGenerator.processNode] Found module_instantiation: ${node.text.substring(0,30)}`);
      const astNode = this.processModuleInstantiation(node);
      if (astNode) {
        statements.push(astNode);
        return; // Don't process children of processed module instantiations further here
      }
      console.log(`[ModularASTGenerator.processNode] processModuleInstantiation returned null for: ${node.text.substring(0,30)}`);
    }

    // Check for module and function definitions
    if (node.type === 'module_definition') {
      console.log(`[ModularASTGenerator.processNode] Found module_definition: ${node.text.substring(0,30)}`);
      const moduleNode = this.moduleFunctionGenerator.processModuleDefinition(node);
      if (moduleNode) {
        statements.push(moduleNode);
        return; // Don't process children of processed module definitions further here
      }
    }

    if (node.type === 'function_definition') {
      console.log(`[ModularASTGenerator.processNode] Found function_definition: ${node.text.substring(0,30)}`);
      const functionNode = this.moduleFunctionGenerator.processFunctionDefinition(node);
      if (functionNode) {
        statements.push(functionNode);
        return; // Don't process children of processed function definitions further here
      }
    }

    if (node.type === 'module_child') {
      console.log(`[ModularASTGenerator.processNode] Found module_child: ${node.text.substring(0,30)}`);
      const childrenNode = this.moduleFunctionGenerator.processChildrenNode(node);
      if (childrenNode) {
        statements.push(childrenNode);
        return; // Don't process children of processed children() calls further here
      }
    }

    // Check for control structures
    if (node.type === 'if_statement') {
      console.log(`[ModularASTGenerator.processNode] Found if_statement: ${node.text.substring(0,30)}`);
      const ifNode = this.controlStructureGenerator.processIfStatement(node);
      if (ifNode) {
        statements.push(ifNode);
        return; // Don't process children of processed if statements further here
      } else {
        console.warn(`[ModularASTGenerator.processNode] Failed to process if_statement: ${node.text.substring(0,30)}`);
      }
    }

    if (node.type === 'for_statement') {
      console.log(`[ModularASTGenerator.processNode] Found for_statement: ${node.text.substring(0,30)}`);
      const forNode = this.controlStructureGenerator.processForLoop(node);
      if (forNode) {
        statements.push(forNode);
        return; // Don't process children of processed for loops further here
      } else {
        console.warn(`[ModularASTGenerator.processNode] Failed to process for_statement: ${node.text.substring(0,30)}`);
      }
    }

    if (node.type === 'let_expression') {
      console.log(`[ModularASTGenerator.processNode] Found let_expression: ${node.text.substring(0,30)}`);
      const letNode = this.controlStructureGenerator.processLetExpression(node);
      if (letNode) {
        statements.push(letNode);
        return; // Don't process children of processed let expressions further here
      } else {
        console.warn(`[ModularASTGenerator.processNode] Failed to process let_expression: ${node.text.substring(0,30)}`);
      }
    }

    // Handle conditional expressions (ternary operator)
    if (node.type === 'conditional_expression') {
      console.log(`[ModularASTGenerator.processNode] Found conditional_expression: ${node.text.substring(0,30)}`);
      const condExpr = this.expressionGenerator.processExpression(node);
      if (condExpr) {
        statements.push(condExpr);
        return; // Don't process children of processed conditional expressions further here
      } else {
        console.warn(`[ModularASTGenerator.processNode] Failed to process conditional_expression: ${node.text.substring(0,30)}`);
      }
    }

    // Handle assignment statements
    if (node.type === 'assignment_statement') {
      console.log(`[ModularASTGenerator.processNode] Found assignment_statement: ${node.text.substring(0,30)}`);
      const nameNode = node.childForFieldName('name');
      const valueNode = node.childForFieldName('value');

      if (nameNode && valueNode) {
        const name = nameNode.text;
        const value = this.expressionGenerator.processExpression(valueNode);

        if (value) {
          statements.push({
            type: 'assignment',
            name,
            value,
            location: getLocation(node)
          });
          return; // Don't process children of processed assignment statements further here
        }
      }
    }

    // Special case for expression_statement containing a function call
    if (node.type === 'expression_statement') {
      console.log(`[ModularASTGenerator.processNode] Processing expression_statement: ${node.text.substring(0,30)}`);
      const expression = node.childForFieldName('expression');
      if (expression) {
        console.log(`[ModularASTGenerator.processNode] Found expression: ${expression.text.substring(0,30)}, type: ${expression.type}`);

        // Handle cube primitive
        if (expression.text.includes('cube')) {
          console.log(`[ModularASTGenerator.processNode] Found cube in expression: ${expression.text.substring(0,30)}`);
          // Extract the size parameter
          const argList = findDescendantOfType(expression, 'argument_list');
          if (argList) {
            console.log(`[ModularASTGenerator.processNode] Found argument_list for cube: ${argList.text}`);
            const args = argList.namedChildren.map(child => child.text);
            console.log(`[ModularASTGenerator.processNode] Extracted args for cube: ${args.join(', ')}`);
            const size = args.length > 0 ? Number(args[0]) : 1;
            const cubeNode: ast.CubeNode = {
              type: 'cube',
              size,
              center: false,
              location: getLocation(node),
              children: []
            };
            console.log(`[ModularASTGenerator.processNode] Created cube node with size: ${size}`);
            statements.push(cubeNode);
            return;
          } else {
            console.log(`[ModularASTGenerator.processNode] No argument_list found for cube expression`);
          }
        }

        // Handle sphere primitive
        if (expression.text.includes('sphere')) {
          console.log(`[ModularASTGenerator.processNode] Found sphere in expression: ${expression.text.substring(0,30)}`);
          // Extract the radius parameter
          const argList = findDescendantOfType(expression, 'argument_list');
          if (argList) {
            console.log(`[ModularASTGenerator.processNode] Found argument_list for sphere: ${argList.text}`);
            const args = argList.namedChildren.map(child => child.text);
            console.log(`[ModularASTGenerator.processNode] Extracted args for sphere: ${args.join(', ')}`);
            const r = args.length > 0 ? Number(args[0]) : 1;
            const sphereNode: ast.SphereNode = {
              type: 'sphere',
              r,
              location: getLocation(node),
              children: []
            };
            console.log(`[ModularASTGenerator.processNode] Created sphere node with radius: ${r}`);
            statements.push(sphereNode);
            return;
          } else {
            console.log(`[ModularASTGenerator.processNode] No argument_list found for sphere expression`);
          }
        }

        // Handle cylinder primitive
        if (expression.text.includes('cylinder')) {
          console.log(`[ModularASTGenerator.processNode] Found cylinder in expression: ${expression.text.substring(0,30)}`);
          // Extract the parameters
          const argList = findDescendantOfType(expression, 'argument_list');
          if (argList) {
            console.log(`[ModularASTGenerator.processNode] Found argument_list for cylinder: ${argList.text}`);
            const args = argList.namedChildren.map(child => child.text);
            console.log(`[ModularASTGenerator.processNode] Extracted args for cylinder: ${args.join(', ')}`);
            const h = args.length > 0 ? Number(args[0]) : 1;
            const r = args.length > 1 ? Number(args[1]) : 1;
            const cylinderNode: ast.CylinderNode = {
              type: 'cylinder',
              h,
              r1: r,
              r2: r,
              center: false,
              location: getLocation(node),
              children: []
            };
            console.log(`[ModularASTGenerator.processNode] Created cylinder node with h: ${h}, r: ${r}`);
            statements.push(cylinderNode);
            return;
          } else {
            console.log(`[ModularASTGenerator.processNode] No argument_list found for cylinder expression`);
          }
        }

        // Look for function calls in the expression
        const functionCall = findDescendantOfType(expression, 'accessor_expression');
        if (functionCall) {
          console.log(`[ModularASTGenerator.processNode] Found function call in expression: ${functionCall.text.substring(0,30)}`);
          // Create a fake module_instantiation node for the function call
          const astNode = this.processModuleInstantiation(functionCall.parent);
          if (astNode) {
            statements.push(astNode);
            return;
          } else {
            console.log(`[ModularASTGenerator.processNode] processModuleInstantiation returned null for function call: ${functionCall.text.substring(0,30)}`);
          }
        } else {
          console.log(`[ModularASTGenerator.processNode] No function call found in expression: ${expression.text.substring(0,30)}`);
        }
      } else {
        console.log(`[ModularASTGenerator.processNode] No expression found in expression_statement: ${node.text.substring(0,30)}`);
      }
    }

    // Process all children recursively
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.processNode(child, statements);
      }
    }
  }

  /**
   * Process a module_instantiation node
   */
  private processModuleInstantiation(node: TSNode): ast.ASTNode | null {
    // Ensure we have a function name from the 'name' field
    const nameFieldNode = node.childForFieldName('name');
    console.log('[ModularASTGenerator.processModuleInstantiation] Processing node:', node.type, node.text.substring(0, 40));

    if (!nameFieldNode) {
      console.error('[ModularASTGenerator.processModuleInstantiation] No nameFieldNode found for:', node.text.substring(0, 40));
      return null;
    }

    console.log('[ModularASTGenerator.processModuleInstantiation] nameFieldNode:', nameFieldNode.type, nameFieldNode.text);

    // Assuming the name field contains an identifier or an accessor_expression whose text is the name
    const functionName = nameFieldNode?.text;
    if (!functionName) {
      console.error('[ModularASTGenerator.processModuleInstantiation] functionName is null or empty from nameFieldNode.text for:', nameFieldNode.text);
      return null;
    }

    console.log('[ModularASTGenerator.processModuleInstantiation] Extracted functionName:', functionName);

    // Extract arguments from the 'arguments' field
    const argsNode = node.childForFieldName('arguments');
    const args = argsNode ? extractArguments(argsNode) : [];

    // Process the children of the module instantiation
    const children: ast.ASTNode[] = [];
    const childrenNode = node.childForFieldName('children');
    if (childrenNode) {
      for (let i = 0; i < childrenNode.namedChildCount; i++) {
        const child = childrenNode.namedChild(i);
        if (child) {
          const childNode = this.processNode(child);
          if (childNode) {
            children.push(childNode);
          }
        }
      }
    }

    // Use the registry to get the appropriate handler
    if (this.registry.hasHandler(functionName)) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] Found handler for ${functionName} in registry`);
      const handler = this.registry.getHandler(functionName);
      if (handler) {
        const astNode = handler(node, args);
        if (astNode) {
          // If the node has children, add them to the AST node
          if (children.length > 0 && 'children' in astNode) {
            (astNode as any).children = children;
          }
          console.log(`[ModularASTGenerator.processModuleInstantiation] Registry handler created node of type: ${astNode.type}`);
          return astNode;
        }
      }
    }

    // If no handler found in registry or handler returned null, fall back to the old approach
    console.log(`[ModularASTGenerator.processModuleInstantiation] No handler found in registry for ${functionName}, falling back to generators`);

    // Try each generator in order of specificity
    let astNode: ast.ASTNode | null = null;

    // First try the primitive generator
    astNode = this.primitiveGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] PrimitiveGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Then try the transform generator
    astNode = this.transformGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] TransformGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Then try the CSG generator
    astNode = this.csgGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] CSGGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Then try the module and function generator
    astNode = this.moduleFunctionGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] ModuleFunctionGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Finally, fall back to the expression generator for generic function calls
    astNode = this.expressionGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] ExpressionGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    console.warn(`[ModularASTGenerator.processModuleInstantiation] No generator could process module: ${functionName}`);
    return null;
  }
}
