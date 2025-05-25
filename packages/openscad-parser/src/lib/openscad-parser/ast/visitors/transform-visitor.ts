import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { ASTVisitor } from './ast-visitor';
import { extractArguments } from '../extractors/argument-extractor';
import {
  extractNumberParameter,
  extractVectorParameter,
} from '../extractors/parameter-extractor';
import { getLocation } from '../utils/location-utils';
import { findDescendantOfType } from '../utils/node-utils';
import { ErrorHandler } from '../../error-handling'; // Added ErrorHandler import

/**
 * Visitor for transform operations (translate, rotate, scale, mirror)
 *
 * @file Defines the TransformVisitor class for processing transform nodes
 */
export class TransformVisitor extends BaseASTVisitor {
  /**
   * Create a new TransformVisitor
   * @param source The source code
   * @param compositeVisitor Optional composite visitor for delegating child processing
   * @param errorHandler The error handler instance
   */
  constructor(
    source: string,
    private compositeVisitor: ASTVisitor | undefined, // Made explicit undefined for clarity with optional errorHandler
    protected errorHandler: ErrorHandler
  ) {
    super(source);
  }

  /**
   * Visit an accessor expression node (function calls like translate([10, 0, 0]))
   * @param node The accessor expression node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    console.log(
      `[TransformVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(
        0,
        50
      )}`
    );

    // Find function name and arguments using the same pattern as PrimitiveVisitor
    let functionName: string | null = null;
    let argsNode: TSNode | null = null;

    // Check if this accessor_expression has an argument_list (indicating it's a function call)
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'argument_list') {
        argsNode = child;
        console.log(
          `[TransformVisitor.visitAccessorExpression] Found argument_list as child[${i}]`
        );

        // The function name should be in the first child
        const functionChild = node.child(0);
        if (functionChild && functionChild.type === 'accessor_expression') {
          const identifierNode = findDescendantOfType(
            functionChild,
            'identifier'
          );
          if (identifierNode) {
            functionName = identifierNode.text;
            console.log(
              `[TransformVisitor.visitAccessorExpression] Found function name: ${functionName}`
            );
          }
        }
        break;
      }
    }

    if (!argsNode || !functionName) {
      console.log(
        `[TransformVisitor.visitAccessorExpression] No argument_list or function name found, delegating to parent`
      );
      return super.visitAccessorExpression(node);
    }

    // Check if this is a transform function
    if (
      ![
        'translate',
        'rotate',
        'scale',
        'mirror',
        'color',
        'multmatrix',
        'offset',
      ].includes(functionName)
    ) {
      console.log(
        `[TransformVisitor.visitAccessorExpression] Not a transform function: ${functionName}, delegating to parent`
      );
      return super.visitAccessorExpression(node);
    }

    // Extract arguments using the working argument extraction system
    let args: ast.Parameter[] = [];
    const argumentsNode = argsNode.namedChildren.find(
      child => child && child.type === 'arguments'
    );
    if (argumentsNode) {
      console.log(
        `[TransformVisitor.visitAccessorExpression] Found arguments node: ${argumentsNode.text}`
      );
      args = extractArguments(argumentsNode);
    } else {
      console.log(
        `[TransformVisitor.visitAccessorExpression] No arguments node found, trying direct extraction`
      );
      args = extractArguments(argsNode);
    }

    console.log(
      `[TransformVisitor.visitAccessorExpression] Extracted ${args.length} arguments for ${functionName}`
    );

    // Create the transform node
    return this.createTransformNode(node, functionName, args);
  }

  /**
   * Visit a module instantiation node (transform with children like translate([10, 0, 0]) cube())
   * @param node The module instantiation node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  public visitModuleInstantiation = (node: TSNode): ast.ASTNode | null => {
    console.log(
      `[TransformVisitor.visitModuleInstantiation] Processing module instantiation: ${node.text.substring(
        0,
        50
      )}`
    );

    // Get function name and arguments
    const nameFieldNode = node.childForFieldName('name');
    if (!nameFieldNode) {
      console.log(
        '[TransformVisitor.visitModuleInstantiation] Name field node not found'
      );
      return null;
    }

    const functionName = nameFieldNode.text;

    // Check if this is a transform function
    if (
      ![
        'translate',
        'rotate',
        'scale',
        'mirror',
        'color',
        'multmatrix',
        'offset',
      ].includes(functionName)
    ) {
      console.log(
        `[TransformVisitor.visitModuleInstantiation] Not a transform function: ${functionName}, delegating to parent`
      );
      return super.visitModuleInstantiation(node);
    }

    // Extract arguments
    const argsNode = node.childForFieldName('arguments');
    const args = argsNode ? extractArguments(argsNode) : [];
    console.log(
      `[TransformVisitor.visitModuleInstantiation] Extracted ${args.length} arguments for ${functionName}`
    );

    // Process children
    const children: ast.ASTNode[] = [];
    const bodyNode = node.childForFieldName('body');
    if (bodyNode) {
      console.log(
        `[TransformVisitor.visitModuleInstantiation] Found body node: type=${
          bodyNode.type
        }, text=${bodyNode.text.substring(0, 50)}`
      );

      if (bodyNode.type === 'block') {
        // Handle block with multiple statements: translate([10, 0, 0]) { cube(); sphere(); }
        console.log(
          `[TransformVisitor.visitModuleInstantiation] Processing block with ${bodyNode.namedChildCount} children`
        );
        for (let i = 0; i < bodyNode.namedChildCount; i++) {
          const child = bodyNode.namedChild(i);
          if (child) {
            console.log(
              `[TransformVisitor.visitModuleInstantiation] Processing block child ${i}: type=${child.type}`
            );
            const visitedChild = this.compositeVisitor
              ? this.compositeVisitor.visitNode(child)
              : this.visitNode(child);
            if (visitedChild) {
              children.push(visitedChild);
              console.log(
                `[TransformVisitor.visitModuleInstantiation] Added child: type=${visitedChild.type}`
              );
            }
          }
        }
      } else if (bodyNode.type === 'statement') {
        // Handle single statement: translate([10, 0, 0]) cube();
        console.log(
          `[TransformVisitor.visitModuleInstantiation] Processing single statement: ${bodyNode.text.substring(
            0,
            50
          )}`
        );
        const visitedChild = this.compositeVisitor
          ? this.compositeVisitor.visitNode(bodyNode)
          : this.visitNode(bodyNode);
        if (visitedChild) {
          children.push(visitedChild);
          console.log(
            `[TransformVisitor.visitModuleInstantiation] Added single child: type=${visitedChild.type}`
          );
        }
      } else {
        console.log(
          `[TransformVisitor.visitModuleInstantiation] Unexpected body type: ${bodyNode.type}`
        );
      }
    } else {
      console.log(
        `[TransformVisitor.visitModuleInstantiation] No body node found`
      );
    }

    // Create the transform node with children
    const transformNode = this.createTransformNode(node, functionName, args);
    if (transformNode && 'children' in transformNode) {
      (transformNode as any).children = children;
    }

    return transformNode;
  };

  /**
   * Create a transform node based on function name and arguments
   * @param node The CST node
   * @param functionName The transform function name
   * @param args The extracted arguments
   * @returns The transform AST node
   */
  private createTransformNode(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    console.log(
      `[TransformVisitor.createTransformNode] Creating ${functionName} node with ${args.length} arguments`
    );

    switch (functionName) {
      case 'translate':
        return this.createTranslateNode(node, args);
      case 'rotate':
        return this.createRotateNode(node, args);
      case 'scale':
        return this.createScaleNode(node, args);
      case 'mirror':
        return this.createMirrorNode(node, args);
      default:
        console.log(
          `[TransformVisitor.createTransformNode] Unsupported transform: ${functionName}`
        );
        return null;
    }
  }

  /**
   * Create a translate node
   * @param node The CST node
   * @param args The extracted arguments
   * @returns The translate AST node
   */
  private createTranslateNode(
    node: TSNode,
    args: ast.Parameter[]
  ): ast.TranslateNode {
    console.log(
      `[TransformVisitor.createTranslateNode] Creating translate node with ${args.length} arguments`
    );

    // Default vector
    let v: ast.Vector3D = [0, 0, 0];

    // Extract vector parameter (first positional or named 'v')
    for (const arg of args) {
      if ((!arg.name && args.indexOf(arg) === 0) || arg.name === 'v') {
        const vector = extractVectorParameter(arg);
        if (vector) {
          if (vector.length === 2) {
            v = [vector[0], vector[1], 0]; // Convert 2D to 3D
          } else if (vector.length >= 3) {
            v = [vector[0], vector[1], vector[2]];
          }
          console.log(
            `[TransformVisitor.createTranslateNode] Extracted vector: ${JSON.stringify(
              v
            )}`
          );
          break;
        }
      }
    }

    return {
      type: 'translate',
      v,
      children: [],
      location: getLocation(node),
    };
  }

  /**
   * Create a rotate node
   * @param node The CST node
   * @param args The extracted arguments
   * @returns The rotate AST node
   */
  private createRotateNode(
    node: TSNode,
    args: ast.Parameter[]
  ): ast.RotateNode {
    console.log(
      `[TransformVisitor.createRotateNode] Creating rotate node with ${args.length} arguments`
    );

    // Default values
    let a: number | ast.Vector3D = 0;
    let v: ast.Vector3D | undefined = undefined;

    // Extract angle parameter (first positional or named 'a')
    for (const arg of args) {
      if ((!arg.name && args.indexOf(arg) === 0) || arg.name === 'a') {
        // Try vector first (for angle vector like [90, 0, 0])
        const vector = extractVectorParameter(arg);
        if (vector && vector.length >= 3) {
          a = [vector[0], vector[1], vector[2]];
          console.log(
            `[TransformVisitor.createRotateNode] Extracted angle vector: ${JSON.stringify(
              a
            )}`
          );
          break;
        }

        // Try number (for single angle like 45)
        const angle = extractNumberParameter(arg);
        if (angle !== null) {
          a = angle;
          v = [0, 0, 1]; // Default Z-axis rotation
          console.log(
            `[TransformVisitor.createRotateNode] Extracted angle: ${a}, default axis: ${JSON.stringify(
              v
            )}`
          );
          break;
        }
      }
    }

    // Extract vector parameter (named 'v')
    for (const arg of args) {
      if (arg.name === 'v') {
        const vector = extractVectorParameter(arg);
        if (vector && vector.length >= 3) {
          v = [vector[0], vector[1], vector[2]];
          console.log(
            `[TransformVisitor.createRotateNode] Extracted rotation axis: ${JSON.stringify(
              v
            )}`
          );
          break;
        }
      }
    }

    const result: ast.RotateNode = {
      type: 'rotate',
      a,
      children: [],
      location: getLocation(node),
    };

    if (v !== undefined) {
      result.v = v;
    }

    return result;
  }

  /**
   * Create a scale node
   * @param node The CST node
   * @param args The extracted arguments
   * @returns The scale AST node
   */
  private createScaleNode(node: TSNode, args: ast.Parameter[]): ast.ScaleNode {
    console.log(
      `[TransformVisitor.createScaleNode] Creating scale node with ${args.length} arguments`
    );

    // Default scale
    let v: ast.Vector3D = [1, 1, 1];

    // Extract scale parameter (first positional or named 'v')
    for (const arg of args) {
      if ((!arg.name && args.indexOf(arg) === 0) || arg.name === 'v') {
        // Try vector first (for non-uniform scale like [2, 1, 0.5])
        const vector = extractVectorParameter(arg);
        if (vector) {
          if (vector.length === 2) {
            v = [vector[0], vector[1], 1]; // Convert 2D to 3D
          } else if (vector.length >= 3) {
            v = [vector[0], vector[1], vector[2]];
          }
          console.log(
            `[TransformVisitor.createScaleNode] Extracted scale vector: ${JSON.stringify(
              v
            )}`
          );
          break;
        }

        // Try number (for uniform scale like 2)
        const scale = extractNumberParameter(arg);
        if (scale !== null) {
          v = [scale, scale, scale]; // Convert uniform scale to vector
          console.log(
            `[TransformVisitor.createScaleNode] Extracted uniform scale: ${scale} -> ${JSON.stringify(
              v
            )}`
          );
          break;
        }
      }
    }

    return {
      type: 'scale',
      v,
      children: [],
      location: getLocation(node),
    };
  }

  /**
   * Create a mirror node
   * @param node The CST node
   * @param args The extracted arguments
   * @returns The mirror AST node
   */
  private createMirrorNode(
    node: TSNode,
    args: ast.Parameter[]
  ): ast.MirrorNode {
    console.log(
      `[TransformVisitor.createMirrorNode] Creating mirror node with ${args.length} arguments`
    );

    // Default mirror plane
    let v: ast.Vector3D = [1, 0, 0];

    // Extract vector parameter (first positional or named 'v')
    for (const arg of args) {
      if ((!arg.name && args.indexOf(arg) === 0) || arg.name === 'v') {
        const vector = extractVectorParameter(arg);
        if (vector && vector.length >= 3) {
          v = [vector[0], vector[1], vector[2]];
          console.log(
            `[TransformVisitor.createMirrorNode] Extracted mirror plane: ${JSON.stringify(
              v
            )}`
          );
          break;
        }
      }
    }

    return {
      type: 'mirror',
      v,
      children: [],
      location: getLocation(node),
    };
  }

  /**
   * Create an AST node for a function (required by BaseASTVisitor)
   * @param node The CST node
   * @param functionName The function name
   * @param args The extracted arguments
   * @returns The AST node or null if not supported
   */
  protected createASTNodeForFunction(
    node: TSNode,
    functionName: string,
    args: ast.Parameter[]
  ): ast.ASTNode | null {
    console.log(
      `[TransformVisitor.createASTNodeForFunction] Processing function: ${functionName}`
    );

    // Only handle transform functions
    if (
      [
        'translate',
        'rotate',
        'scale',
        'mirror',
        'color',
        'multmatrix',
        'offset',
      ].includes(functionName)
    ) {
      return this.createTransformNode(node, functionName, args);
    }

    // Return null for non-transform functions (will be handled by other visitors)
    console.log(
      `[TransformVisitor.createASTNodeForFunction] Not a transform function: ${functionName}`
    );
    return null;
  }
}
