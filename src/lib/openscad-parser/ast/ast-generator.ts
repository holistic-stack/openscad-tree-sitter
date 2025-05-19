import { Parser, Tree, TreeCursor, Node } from 'web-tree-sitter';
import * as ast from './ast-types';
import { isNodeType } from '../cst/cursor-utils/cursor-utils';

// Type alias for web-tree-sitter's Node type
type TSNode = Node;

/**
 * Converts a Tree-sitter CST to an OpenSCAD AST
 */
export class ASTGenerator {
  private cursor: TreeCursor;
  private source: string;

  constructor(private tree: Tree, source: string) {
    this.cursor = tree.walk();
    this.source = source;
  }

  /**
   * Generate the AST from the CST
   */
  public generate(): ast.ASTNode[] {
    const statements: ast.ASTNode[] = [];
    
    console.log('[ASTGenerator.generate] Starting AST generation.');
    const rootNode = this.tree.rootNode;
    if (!rootNode) {
      console.log('[ASTGenerator.generate] No root node found. Returning empty array.');
      return statements;
    }
    console.log(`[ASTGenerator.generate] Root node type: ${rootNode.type}, Text: ${rootNode.text.substring(0, 50)}`);
    console.log(`[ASTGenerator.generate] Root node childCount: ${rootNode.childCount}, namedChildCount: ${rootNode.namedChildCount}`);
    for(let i = 0; i < Math.min(rootNode.namedChildCount, 5); i++) {
        const child = rootNode.namedChild(i);
        if (child) {
            console.log(`[ASTGenerator.generate] Root named child ${i}: type=${child.type}, text=${child.text.substring(0,30)}`);
        }
    }

    // Process the entire tree recursively to find all module instantiations
    this.processNode(rootNode, statements);
    console.log(`[ASTGenerator.generate] Finished processing. Statements count: ${statements.length}`);
    return statements;
  }
  
  /**
   * Process a node and its children recursively
   */
  private processNode(node: TSNode, statements: ast.ASTNode[]): void {
    console.log(`[ASTGenerator.processNode] Processing node - Type: ${node.type}, Text: ${node.text.substring(0, 50)}`);
    // Check if this node is a module instantiation
    if (node.type === 'module_instantiation') {
      // console.log(`[processNode] Found module_instantiation: ${node.text.substring(0,30)}`);
      const astNode = this.processModuleInstantiation(node);
      if (astNode) {
        statements.push(astNode);
        return; // Don't process children of processed module instantiations further here
      }
      // console.log(`[processNode] processModuleInstantiation returned null for: ${node.text.substring(0,30)}`);
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
    console.log('[processModuleInstantiation] Processing node:', node.type, node.text.substring(0, 40));
    if (!nameFieldNode) {
      console.error('[processModuleInstantiation] No nameFieldNode found for:', node.text.substring(0, 40));
      return null;
    }
    console.log('[processModuleInstantiation] nameFieldNode:', nameFieldNode.type, nameFieldNode.text);
    
    // Assuming the name field contains an identifier or an accessor_expression whose text is the name
    const functionName = nameFieldNode?.text; 
    if (!functionName) {
      console.error('[processModuleInstantiation] functionName is null or empty from nameFieldNode.text for:', nameFieldNode.text);
      return null;
    }
    // console.log('[processModuleInstantiation] Extracted functionName:', functionName);

    // Get the arguments from the 'arguments' field
    const M_custom_node_obj_instantiationArgsNode = node.childForFieldName('arguments');
    const args = M_custom_node_obj_instantiationArgsNode ? this.extractArguments(M_custom_node_obj_instantiationArgsNode) : [];

    // console.log('[processModuleInstantiation] Args extracted. Switching on functionName:', functionName);

    // Create the appropriate node based on the function name
    switch (functionName) {
      case 'cube':
        // console.log('[processModuleInstantiation] Creating cube node');
        return this.createCubeNode(node, args);
      case 'translate':
        // console.log('[processModuleInstantiation] Creating translate node');
        return this.createTranslateNode(node, args);
      case 'sphere':
        // console.log('[processModuleInstantiation] Creating sphere node');
        return this.createSphereNode(node, args);
      case 'cylinder':
        // console.log('[processModuleInstantiation] Creating cylinder node');
        return this.createCylinderNode(node, args);
      // Add more node types as needed
      default:
        // console.log('[processModuleInstantiation] Default case for functionName:', functionName, '. Creating generic function_call node.');
        // For now, return a generic function call node (or consider a specific 'module_call' type)
        return {
          type: 'function_call', // Or 'module_instantiation_ast' etc.
          name: functionName,
          arguments: args,
          location: this.getLocation(node)
        } as ast.FunctionCallNode;
    }
  }

  /**
   * Find a block node that's a child of the given node
   * This method might become obsolete or less used with the new grammar.
   */
  private findBlockNode(node: TSNode): TSNode | null {
    // First check direct children
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child?.type === 'block') {
        return child;
      }
    }
    
    // Then check for block after the module instantiation
    let nextSibling = node.nextSibling;
    while (nextSibling) {
      if (nextSibling.type === 'block') {
        return nextSibling;
      }
      // Only check the immediate next sibling
      break;
    }
    
    return null;
  }

  /**
   * Create a translate node
   */
  private createTranslateNode(node: TSNode, args: ast.Parameter[]): ast.TranslateNode {
    let vParamValue: ast.ParameterValue | undefined = undefined;

    const namedVArg = args.find(arg => arg.name === 'v');
    if (namedVArg) {
      vParamValue = namedVArg.value;
      console.log(`[ASTGenerator.createTranslateNode] Found named 'v' argument. Value: ${JSON.stringify(vParamValue)}`); // DEBUG
    } else {
      const positionalVArg = args.find(arg => !arg.name); // Assuming 'v' is the first positional if not named
      if (positionalVArg) {
        vParamValue = positionalVArg.value;
        console.log(`[ASTGenerator.createTranslateNode] Found positional vector argument. Value: ${JSON.stringify(vParamValue)}`); // DEBUG
      } else {
        console.log(`[ASTGenerator.createTranslateNode] No named 'v' or positional vector argument found for translate node: ${node.text.substring(0,30)}`); // DEBUG
      }
    }

    console.log(`[ASTGenerator.createTranslateNode] Final vParamValue before creating vector: ${JSON.stringify(vParamValue)}, Type: ${typeof vParamValue}, IsArray: ${Array.isArray(vParamValue)}`); // DEBUG

    const v = vParamValue && Array.isArray(vParamValue) && (vParamValue.length === 2 || vParamValue.length === 3)
      ? vParamValue as ast.Vector2D | ast.Vector3D
      : [0, 0, 0] as ast.Vector3D;
    
    console.log(`[ASTGenerator.createTranslateNode] Resulting vector 'v' for ${node.text.substring(0,30)}: ${JSON.stringify(v)}`); // DEBUG

    const children: ast.ASTNode[] = [];
    const bodyNode = node.childForFieldName('body');

    if (bodyNode) {
      if (bodyNode.type === 'block') {
        console.log(`[ASTGenerator.createTranslateNode] Found block body for ${node.text.substring(0,30)}`); // DEBUG
        for (const statementCSTNode of bodyNode.children) {
          if (statementCSTNode && statementCSTNode.type === 'statement') { // Or directly module_instantiation, etc.
             // We expect statements within a block to be processable into ASTNodes
            this.processNode(statementCSTNode, children);
          }
        }
      } else if (bodyNode.type === 'statement') {
        // This case might be for something like: translate() if (true) cube(); where body is a single statement
        console.log(`[ASTGenerator.createTranslateNode] Found statement body for ${node.text.substring(0,30)}: ${bodyNode.text.substring(0,20)}`); // DEBUG
        this.processNode(bodyNode, children);
      }
    } else {
      // No explicit body, check for an immediately following statement (e.g., translate() cube();)
      // The 'node' here is the module_instantiation for 'translate'
      // Its next sibling should be the 'statement' node for 'cube()'
      const nextSibling = node.nextSibling;
      if (nextSibling && nextSibling.type === 'statement') {
        console.log(`[ASTGenerator.createTranslateNode] Found next sibling statement for ${node.text.substring(0,30)}: ${nextSibling.text.substring(0,20)}`); // DEBUG
        this.processNode(nextSibling, children);
      } else {
        console.log(`[ASTGenerator.createTranslateNode] No body and no next sibling statement found for ${node.text.substring(0,30)}. Next sibling type: ${nextSibling?.type}`); // DEBUG
      }
    }

    return {
      type: 'translate',
      v,
      children,
      location: this.getLocation(node)
    };
  }

  /**
   * Create a cube node from a module instantiation
   */
  private createCubeNode(node: TSNode, args: ast.Parameter[]): ast.CubeNode {
    const cubeNode: ast.CubeNode = {
      type: 'cube',
      size: 1, // Default size
      location: this.getLocation(node)
    };

    // Process arguments
    for (const arg of args) {
      if (arg.name === 'size' || (!arg.name && !cubeNode.size)) {
        cubeNode.size = arg.value;
      } else if (arg.name === 'center') {
        cubeNode.center = arg.value as boolean;
      }
    }

    return cubeNode;
  }

  /**
   * Create a sphere node from a module instantiation
   */
  private createSphereNode(node: TSNode, args: ast.Parameter[]): ast.SphereNode {
    const sphereNode: ast.SphereNode = {
      type: 'sphere',
      r: 1, // Default radius
      location: this.getLocation(node)
    };

    // Process arguments
    for (const arg of args) {
      if (arg.name === 'r' || (!arg.name && !arg.name)) {
        sphereNode.r = arg.value as number;
      } else if (arg.name === 'd') {
        sphereNode.d = arg.value as number;
        // If diameter is specified, remove radius
        delete sphereNode.r;
      } else if (arg.name === '$fn') {
        sphereNode.$fn = arg.value as number;
      } else if (arg.name === '$fa') {
        sphereNode.$fa = arg.value as number;
      } else if (arg.name === '$fs') {
        sphereNode.$fs = arg.value as number;
      }
    }

    return sphereNode;
  }

  /**
   * Create a cylinder node from a module instantiation
   */
  private createCylinderNode(node: TSNode, args: ast.Parameter[]): ast.CylinderNode {
    const cylinderNode: ast.CylinderNode = {
      type: 'cylinder',
      h: 1, // Default height
      r: 1, // Default radius
      location: this.getLocation(node)
    };

    // Process arguments
    for (const arg of args) {
      if (arg.name === 'h' || (!arg.name && !cylinderNode.h)) {
        cylinderNode.h = arg.value as number;
      } else if (arg.name === 'r') {
        cylinderNode.r = arg.value as number;
        // If r is specified, remove r1 and r2 if they exist
        delete cylinderNode.r1;
        delete cylinderNode.r2;
      } else if (arg.name === 'r1') {
        cylinderNode.r1 = arg.value as number;
        // If r1 is specified, remove r if it exists
        delete cylinderNode.r;
      } else if (arg.name === 'r2') {
        cylinderNode.r2 = arg.value as number;
        // If r2 is specified, remove r if it exists
        delete cylinderNode.r;
      } else if (arg.name === 'd') {
        cylinderNode.d = arg.value as number;
        // If d is specified, remove r, r1, and r2 if they exist
        delete cylinderNode.r;
        delete cylinderNode.r1;
        delete cylinderNode.r2;
      } else if (arg.name === 'd1') {
        cylinderNode.d1 = arg.value as number;
        // If d1 is specified, remove r and r1 if they exist
        delete cylinderNode.r;
        delete cylinderNode.r1;
      } else if (arg.name === 'd2') {
        cylinderNode.d2 = arg.value as number;
        // If d2 is specified, remove r and r2 if they exist
        delete cylinderNode.r;
        delete cylinderNode.r2;
      } else if (arg.name === 'center') {
        cylinderNode.center = arg.value as boolean;
      } else if (arg.name === '$fn') {
        cylinderNode.$fn = arg.value as number;
      } else if (arg.name === '$fa') {
        cylinderNode.$fa = arg.value as number;
      } else if (arg.name === '$fs') {
        cylinderNode.$fs = arg.value as number;
      }
    }

    return cylinderNode;
  }

  /**
   * Extract arguments from a module instantiation
   */
  private extractArguments(argumentList: TSNode): ast.Parameter[] {
    const args: ast.Parameter[] = [];
    console.log(`[ASTGenerator.extractArguments] Processing argument_list: ${argumentList.text.substring(0,40)}, children count: ${argumentList.childCount}, namedChildren count: ${argumentList.namedChildCount}`); // DEBUG

    for (const childNode of argumentList.children) { 
      if (!childNode) continue; // Added null check for childNode
      console.log(`[ASTGenerator.extractArguments] Child of argument_list: type='${childNode.type}', text='${childNode.text.substring(0,20)}'`); // DEBUG
      
      if (childNode.type === 'named_argument') {
        const nameNode = childNode.childForFieldName('name'); 
        const valueNode = childNode.childForFieldName('value');
        console.log(`[ASTGenerator.extractArguments]   Named argument: nameNode type='${nameNode?.type}', valueNode type='${valueNode?.type}'`); // DEBUG
        if (nameNode && valueNode) {
          const name = nameNode.text;
          const value = this.extractValue(valueNode);
          console.log(`[ASTGenerator.extractArguments]     Extracted named arg: name='${name}', value='${JSON.stringify(value)}'`); // DEBUG
          if (value !== undefined) {
            args.push({ name, value });
          }
        }
      } else if (childNode.type === 'expression' || 
                 childNode.type === 'number' || 
                 childNode.type === 'string_literal' ||
                 childNode.type === 'array_literal' ||
                 childNode.type === 'identifier' ||
                 childNode.type === 'boolean' // Added boolean as it's a valid value
                ) { 
        console.log(`[ASTGenerator.extractArguments]   Positional argument candidate: type='${childNode.type}', text='${childNode.text.substring(0,20)}'`); // DEBUG
        const value = this.extractValue(childNode);
        console.log(`[ASTGenerator.extractArguments]     Extracted positional value: '${JSON.stringify(value)}'`); // DEBUG
        if (value !== undefined) { 
          args.push({ value }); 
        }
      } else {
        console.log(`[ASTGenerator.extractArguments]   Ignoring child of argument_list: type='${childNode.type}'`); // DEBUG
      }
    }
    console.log(`[ASTGenerator.extractArguments] Extracted args: ${JSON.stringify(args)}`); // DEBUG
    return args;
  }

  /**
   * Extract a value from a node
   */
  private extractValue(node?: TSNode | null): ast.ParameterValue {
    if (!node) return undefined;
    console.log(`[ASTGenerator.extractValue] Attempting to extract from node: type='${node.type}', text='${node.text.substring(0,30)}'`); // DEBUG

    switch (node.type) {
      case 'number':
        return parseFloat(node.text);
      case 'boolean':
        return node.text === 'true';
      case 'string_literal':
        const text = node.text;
        if ((text.startsWith('\"') && text.endsWith('\"')) || (text.startsWith("'") && text.endsWith("'"))) {
          return text.slice(1, -1);
        }
        return text;
      case 'array_literal':
        console.log(`[ASTGenerator.extractValue] Calling extractVector for array_literal: ${node.text.substring(0,20)}`); // DEBUG
        return this.extractVector(node);
      case 'unary_expression':
        if (node.childCount === 2) {
          const operatorNode = node.child(0);
          const operandNode = node.child(1);
          if (operatorNode && operandNode) {
            const operator = operatorNode.text;
            const operandValue = this.extractValue(operandNode);
            if (operator === '-' && typeof operandValue === 'number') return -operandValue;
            if (operator === '+' && typeof operandValue === 'number') return operandValue;
          }
        }
        console.warn(`[ASTGenerator.extractValue] Unhandled unary_expression: ${node.text.substring(0,30)}. Returning undefined.`); // DEBUG
        return undefined; // Explicitly return undefined if not handled
      case 'expression':
        // If expression has one child, it might be a wrapper. Try to extract from child.
        if (node.childCount === 1) {
          const actualValueNode = node.child(0);
          if (actualValueNode) {
            console.log(`[ASTGenerator.extractValue] Unwrapping 'expression', calling extractValue on child: type='${actualValueNode.type}', text='${actualValueNode.text.substring(0,20)}'`); // DEBUG
            return this.extractValue(actualValueNode);
          }
        }
        // If not a simple wrapper, or has multiple children (e.g. binary expression)
        // We might need specific handlers for binary_expression, etc. if they are valid parameter values.
        // For now, try to parse its text as a number, or return text if it's more complex.
        console.log(`[ASTGenerator.extractValue] 'expression' (text: ${node.text.substring(0,30)}) not a simple wrapper. Trying to parse its text as number or returning text.`);
        const exprNum = parseFloat(node.text.trim());
        if (!isNaN(exprNum)) {
          return exprNum;
        }
        // Fallback for complex expressions or expressions that evaluate to strings not yet handled.
        // This might need to be an actual expression object in the AST later.
        console.warn(`[ASTGenerator.extractValue] Complex 'expression' node text '${node.text.substring(0,30)}' returned as string or undefined. Consider specific handlers.`);
        // Returning node.text might be appropriate if the expression is a variable name not caught by 'identifier'.
        // However, for something like '1+2', it should ideally be an expression node or evaluated.
        // For now, returning undefined as a safer default for unhandled complex expressions.
        return undefined; 
      case 'identifier':
        if (node.text === 'true') return true;
        if (node.text === 'false') return false;
        return {
          type: 'expression',
          expressionType: 'variable',
          name: node.text,
          location: this.getLocation(node)
        } as ast.VariableNode;
      default:
        console.log(`[ASTGenerator.extractValue] Default case for node type: '${node.type}', text: '${node.text.substring(0,30)}'`);
        const potentialNumText = node.text.trim();
        const num = parseFloat(potentialNumText);
        if (!isNaN(num)) {
          console.log(`[ASTGenerator.extractValue] Default case parsed text '${potentialNumText}' as number: ${num}`);
          return num;
        }
        console.warn(`[ASTGenerator.extractValue] Default case returning raw text for node type: '${node.type}', text: '${node.text.substring(0,30)}'`);
        // Returning node.text can be a fallback but might hide issues.
        // Consider returning undefined for unhandled types to make errors more obvious.
        return node.text; // Or return undefined for stricter handling
    }
    // Should not be reached if all cases return explicitly or define behavior for falling through
    // console.error(`[ASTGenerator.extractValue] Reached end of switch unexpectedly for node type: '${node.type}', text: '${node.text.substring(0,30)}'. Returning undefined.`);
    // return undefined;
  }

  /**
   * Extract a vector (2D or 3D) from a vector node
   */
  private extractVector(node: TSNode): ast.Vector2D | ast.Vector3D | undefined {
    const numbers: number[] = [];
    const elementsToProcess = node.type === 'array_literal' ? node.children : [];

    console.log(`[ASTGenerator.extractVector] Processing array_literal node: ${node.text.substring(0,30)}, children count: ${elementsToProcess.length}`);
    for (const elementNode of elementsToProcess) {
      if (!elementNode) continue;
      console.log(`[ASTGenerator.extractVector] Iterating child: type='${elementNode.type}', text='${elementNode.text.substring(0,20)}'`);

      // Only process expression, number, identifier, or unary_expression nodes as potential vector elements
      if (elementNode.type === 'expression' || 
          elementNode.type === 'number' || 
          elementNode.type === 'identifier' ||
          elementNode.type === 'unary_expression') { 
        console.log(`[ASTGenerator.extractVector]   Processing child of array_literal: type='${elementNode.type}', text='${elementNode.text.substring(0,20)}'`); // DEBUG
        const value = this.extractValue(elementNode);
        console.log(`[ASTGenerator.extractVector]   extractValue returned: ${JSON.stringify(value)}, typeof: ${typeof value}`);
        if (typeof value === 'number') {
          numbers.push(value);
        } else {
          console.warn(`[ASTGenerator.extractVector] Element in array_literal (type='${elementNode.type}', text='${elementNode.text.substring(0,20)}') did not resolve to a number. Extracted value: ${JSON.stringify(value)}`);
        }
      } else {
        console.log(`[ASTGenerator.extractVector]   Skipping child of array_literal: type='${elementNode.type}' (not an expression, number, identifier, or unary_expression)`);
      }
    }

    if (numbers.length === 2) {
      console.log(`[ASTGenerator.extractVector] Returning 2D vector from ${node.text.substring(0,20)}: ${JSON.stringify([numbers[0], numbers[1]])}`); // DEBUG
      return [numbers[0], numbers[1]] as ast.Vector2D;
    } else if (numbers.length === 3) {
      console.log(`[ASTGenerator.extractVector] Returning 3D vector from ${node.text.substring(0,20)}: ${JSON.stringify([numbers[0], numbers[1], numbers[2]])}`); // DEBUG
      return [numbers[0], numbers[1], numbers[2]] as ast.Vector3D;
    }
    
    // This warning will now be more specific about failure.
    console.warn(`[ASTGenerator.extractVector] FAILURE: Extracted ${numbers.length} numbers from array_literal node '${node.text.substring(0,30)}'. Expected 2 or 3. Numbers: ${JSON.stringify(numbers)}. RETURNING UNDEFINED.`);
    return undefined;
  }

  /**
   * Get the source location of a node
   */
  private getLocation(node: TSNode): ast.SourceLocation {
    return {
      start: {
        line: node.startPosition.row,
        column: node.startPosition.column,
        offset: node.startIndex
      },
      end: {
        line: node.endPosition.row,
        column: node.endPosition.column,
        offset: node.endIndex
      },
      text: node.text
    };
  }
}
