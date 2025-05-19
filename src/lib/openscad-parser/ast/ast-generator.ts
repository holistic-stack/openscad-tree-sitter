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
   * Create a translate node
   */
  private createTranslateNode(node: TSNode, args: ast.Parameter[]): ast.TranslateNode {
    // console.log('[createTranslateNode] Creating translate node for:', node.text.substring(0, 30));
    const translateNode: ast.TranslateNode = {
      type: 'translate',
      v: [0, 0, 0], // Default translation vector
      children: [],
      location: this.getLocation(node)
    };

    // Process arguments
    for (const arg of args) {
      if (arg.name === 'v' || arg.name === undefined) { // Positional argument is 'v'
        if (Array.isArray(arg.value) && (arg.value.length === 2 || arg.value.length === 3)) {
          translateNode.v = arg.value as [number, number, number]; // ast.Vector type might need adjustment if it can be 2D
        }
      }
    }

    // Handle children using the 'body' field from the CST
    const bodyCSTNode = node.childForFieldName('body');

    if (bodyCSTNode) {
      if (bodyCSTNode.type === 'block') {
        // Process statements within the block
        for (let i = 0; i < bodyCSTNode.namedChildCount; i++) {
          const statementNode = bodyCSTNode.namedChild(i);
          if (statementNode && statementNode.type === 'module_instantiation') { // Assuming statements in block are module instantiations
            const astChildNode = this.processModuleInstantiation(statementNode);
            if (astChildNode) {
              translateNode.children.push(astChildNode);
            }
          } else if (statementNode) {
            // If we need to handle other statement types within a translate block,
            // we might need a more general processStatementNode method.
            // For now, expecting module_instantiations.
            const statementsInBlock: ast.ASTNode[] = [];
            this.processNode(statementNode, statementsInBlock);
            translateNode.children.push(...statementsInBlock);
          }
        }
      } else if (bodyCSTNode.type === 'statement') {
        // bodyCSTNode is the 'statement' node.
        // Its first named child should be the 'module_instantiation' (e.g., for cube)
        // According to grammar: statement: $ => choice($.module_instantiation, ..., $.expression_statement)
        // For `translate() cube();`, bodyCSTNode is 'statement', its child is 'module_instantiation'
        const actualModuleNode = bodyCSTNode.firstChild; // The module_instantiation is the first child of the statement node
        if (actualModuleNode && actualModuleNode.type === 'module_instantiation') {
          const astChildNode = this.processModuleInstantiation(actualModuleNode);
          if (astChildNode) {
            translateNode.children.push(astChildNode);
          }
        }
      }
    }

    return translateNode;
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
  private extractArguments(argumentList: TSNode): ast.Parameter[] { // Renamed 'node' to 'argumentList' for clarity
    const args: ast.Parameter[] = [];
    // The input 'argumentList' IS the 'argument_list' CST node from childForFieldName('arguments')
    // No need to search for it again.
    
    if (!argumentList || argumentList.type !== 'argument_list') return args; // Basic sanity check

    let currentArgValueNode: TSNode | null = null;
    let currentArgName: string | undefined = undefined;

    for (let i = 0; i < argumentList.namedChildCount; i++) {
      const child = argumentList.namedChild(i);
      if (!child) continue;

      // In argument_list: $ => seq('(', commaSep($.argument), ')'),
      // argument: $ => choice($.named_argument, $.expression)
      // named_argument: $ => seq(field('name', $.identifier), '=', field('value', $.expression)),
      // We iterate through namedChildren which are 'argument' nodes.

      if (child.type === 'named_argument') {
        const nameNode = child.childForFieldName('name');
        const valueNode = child.childForFieldName('value');
        if (nameNode && valueNode) {
          args.push({
            name: nameNode.text,
            value: this.extractValue(valueNode)
          });
        }
      } else {
        // This is a positional argument (an expression)
        const value = this.extractValue(child);
        // For positional arguments, we don't have a name from the CST directly here.
        // The calling function (e.g., createCubeNode) will assign meaning based on position.
        if (value !== undefined) { // Ensure value was extracted
          args.push({ value }); 
        }
      }
    }
    return args;
  }

  /**
   * Extract a value from a node
   */
  private extractValue(node?: TSNode | null): ast.ParameterValue {
    if (!node) return undefined;

    switch (node.type) {
      case 'number':
        return parseFloat(node.text);
      case 'boolean': // Boolean literals true/false
        return node.text === 'true';
      case 'string_literal':
        // Tree-sitter string_literal nodes include the quotes.
        const text = node.text;
        if ((text.startsWith('\"') && text.endsWith('\"')) || (text.startsWith("'") && text.endsWith("'"))) {
          return text.slice(1, -1);
        }
        return text; // Should not happen if grammar is correct
      case 'array_literal': // Added to handle [1,0,0] style vectors
        return this.extractVector(node);
      case 'unary_expression':
        // Expected structure: children[0] is operator, children[1] is operand (expression)
        if (node.childCount === 2) { // Use childCount for general children
          const operatorNode = node.child(0);
          const operandNode = node.child(1);
          if (operatorNode && operandNode) {
            const operator = operatorNode.text;
            const operandValue = this.extractValue(operandNode);

            if (operator === '-' && typeof operandValue === 'number') {
              return -operandValue;
            }
            if (operator === '+' && typeof operandValue === 'number') {
              return operandValue; // Unary plus
            }
          }
        }
        break; 
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
        const potentialNumText = node.text.trim();
        const num = parseFloat(potentialNumText);
        if (!isNaN(num) && num.toString() === potentialNumText) {
          return num;
        }
        return node.text; 
    }
    return node.text;
  }

  /**
   * Extract a vector (2D or 3D) from a vector node
   */
  private extractVector(node: TSNode): ast.Vector2D | ast.Vector3D | undefined {
    const numbers: number[] = [];

    const elementsToProcess = node.type === 'array_literal' ? node.namedChildren : [];

    for (const elementNode of elementsToProcess) {
      if (!elementNode) continue; // Added null check for elementNode

      const value = this.extractValue(elementNode); 
      if (typeof value === 'number') {
        numbers.push(value);
      } else {
        console.warn(`[ASTGenerator.extractVector] Element in array_literal did not resolve to a number: ${elementNode.text.substring(0,30)}, extracted value: ${JSON.stringify(value)}`);
      }
    }

    if (numbers.length === 2) {
      return [numbers[0], numbers[1]] as ast.Vector2D;
    } else if (numbers.length === 3) {
      return [numbers[0], numbers[1], numbers[2]] as ast.Vector3D;
    }
    
    if (node.type === 'array_literal') {
        console.warn(`[ASTGenerator.extractVector] Extracted ${numbers.length} numbers from array_literal node: ${node.text.substring(0,30)}. Expected 2 or 3. Numbers: ${JSON.stringify(numbers)}`);
    }
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
