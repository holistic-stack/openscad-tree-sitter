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
    
    // Start at the root node
    const rootNode = this.tree.rootNode;
    
    // Process each top-level statement
    if (rootNode) {
      for (let i = 0; i < rootNode.childCount; i++) {
        const child = rootNode.child(i);
        if (child && child.type === 'call_expression') {
          const node = this.processCallExpression(child);
          if (node) {
            statements.push(node);
          }
        }
        // TODO: Handle other top-level node types
      }
    }
    
    return statements;
  }

  /**
   * Process a call expression node
   */
  private processCallExpression(node: TSNode): ast.ASTNode | null {
    // Ensure we have a function name
    const functionName = node.firstChild?.text;
    if (!functionName) return null;

    // Get the arguments
    const args = this.extractArguments(node);

    // Create the appropriate node based on the function name
    switch (functionName) {
      case 'cube':
        return this.createCubeNode(node, args);
      case 'translate':
        return this.createTranslateNode(node, args);
      // TODO: Add more node types
      default:
        // For now, return a generic function call node
        return {
          type: 'function_call',
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
    const translateNode: ast.TranslateNode = {
      type: 'translate',
      v: [0, 0, 0], // Default translation vector
      children: [],
      location: this.getLocation(node)
    };

    // Process arguments
    for (const arg of args) {
      if (arg.name === 'v' || arg.name === undefined) {
        if (Array.isArray(arg.value)) {
          translateNode.v = arg.value as [number, number, number];
        }
      }
    }

    // Handle children (either immediate or in a block)
    const blockNode = this.findBlockNode(node);
    if (blockNode) {
      // Process block children
      for (let i = 0; i < blockNode.childCount; i++) {
        const child = blockNode.child(i);
        if (child && child.type === 'call_expression') {
          const childNode = this.processCallExpression(child);
          if (childNode) {
            translateNode.children?.push(childNode);
          }
        }
      }
    } else {
      // Handle immediate child (next node after arguments)
      const nextNode = node.nextSibling;
      if (nextNode && nextNode.type === 'call_expression') {
        const childNode = this.processCallExpression(nextNode);
        if (childNode) {
          translateNode.children = [childNode];
        }
      }
    }

    return translateNode;
  }

  /**
   * Find a block node that's a child of the given node
   */
  private findBlockNode(node: TSNode): TSNode | null {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child?.type === 'block') {
        return child;
      }
    }
    return null;
  }

  /**
   * Create a cube node from a call expression
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
   * Extract arguments from a call expression
   */
  private extractArguments(node: TSNode): ast.Parameter[] {
    const args: ast.Parameter[] = [];
    // Find the argument list node
    let argumentList: TSNode | null = null;
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'argument_list') {
        argumentList = child;
        break;
      }
    }
    
    if (!argumentList) return args;

    let currentArg: ast.Parameter | null = null;
    
    for (let i = 0; i < argumentList.childCount; i++) {
      const child = argumentList.child(i);
      if (!child) continue;
      if (child.type === '=') {
        // This is a named argument
        const nameNode = child.previousSibling;
        if (nameNode) {
          currentArg = {
            name: nameNode.text,
            value: this.extractValue(child.nextSibling || undefined)
          };
          args.push(currentArg);
          currentArg = null;
        }
      } else if (child.type === ',') {
        // Skip commas
        continue;
      } else if (!currentArg) {
        // This is a positional argument
        const value = this.extractValue(child);
        if (value !== undefined) {
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
      case 'boolean':
        return node.text === 'true';
      case 'string_literal':
        return node.text.slice(1, -1); // Remove quotes
      case 'vector':
        return this.extractVector(node);
      case 'identifier':
        return {
          type: 'expression',
          expressionType: 'variable',
          name: node.text,
          location: this.getLocation(node)
        } as ast.VariableNode;
      default:
        // For other node types, return as a literal for now
        return node.text;
    }
  }

  /**
   * Extract a vector (2D or 3D) from a vector node
   */
  private extractVector(node: TSNode): ast.Vector2D | ast.Vector3D | undefined {
    const numbers: number[] = [];
    
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (!child) continue;
      if (child.type === 'number') {
        numbers.push(parseFloat(child.text));
      } else if (child.type === 'unary_expression') {
        // Handle negative numbers
        for (let j = 0; j < child.childCount; j++) {
          const subChild = child.child(j);
          if (subChild?.type === 'number') {
            numbers.push(-parseFloat(subChild.text));
            break;
          }
        }
      }
    }

    if (numbers.length === 2) {
      return [numbers[0], numbers[1]] as ast.Vector2D;
    } else if (numbers.length === 3) {
      return [numbers[0], numbers[1], numbers[2]] as ast.Vector3D;
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
