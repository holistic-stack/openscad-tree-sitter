import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { getLocation } from '../utils/location-utils';
import { extractVectorParameter, extractNumberParameter, extractBooleanParameter, extractStringParameter } from '../extractors/parameter-extractor';
// extractVectorFromString is not used in this file
import { findDescendantOfType } from '../utils/node-utils';
import { extractArguments } from '../extractors/argument-extractor';
import { extractColorNode } from '../extractors/color-extractor';
import { extractOffsetNode } from '../extractors/offset-extractor';

/**
 * Visitor for transformations (translate, rotate, scale, etc.)
 *
 * @file Defines the TransformVisitor class for processing transformation nodes
 */
export class TransformVisitor extends BaseASTVisitor {
  /**
   * Create an AST node for a specific function
   * @param node The node to process
   * @param functionName The name of the function
   * @param args The arguments to the function
   * @returns The AST node or null if the function is not supported
   */
  protected createASTNodeForFunction(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    console.log(`[TransformVisitor.createASTNodeForFunction] Processing function: ${functionName}`);

    // Get the location information
    // const location = getLocation(node); // Unused variable

    // Process based on function name
    switch (functionName) {
      case 'translate':
        return this.createTranslateNode(node, args);
      case 'rotate':
        return this.createRotateNode(node, args);
      case 'scale':
        return this.createScaleNode(node, args);
      case 'mirror':
        return this.createMirrorNode(node, args);
      case 'resize':
        return this.createResizeNode(node, args);
      case 'multmatrix':
        return this.createMultmatrixNode(node, args);
      case 'color':
        // Use the specialized color extractor first, fall back to the old method if it fails
        return extractColorNode(node) || this.createColorNode(node, args);
      case 'offset':
        // Use the specialized offset extractor first, fall back to the old method if it fails
        return extractOffsetNode(node) || this.createOffsetNode(node, args);
      case 'color(':
        // Use the specialized color extractor first, fall back to the old method if it fails
        return extractColorNode(node) || this.createColorNode(node, args);
      case 'mirror(':
        return this.createMirrorNode(node, args);
      case 'multmatrix(':
        return this.createMultmatrixNode(node, args);
      default:
        console.log(`[TransformVisitor.createASTNodeForFunction] Unsupported function: ${functionName}`);
        return null;
    }
  }

  /**
   * Create a translate node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The translate AST node or null if the arguments are invalid
   */
  private createTranslateNode(node: TSNode, args: ast.Parameter[]): ast.TranslateNode | null {
    console.log(`[TransformVisitor.createTranslateNode] Creating translate node with ${args.length} arguments`);

    // Extract vector parameter
    let vector: [number, number, number] = [0, 0, 0];
    const vectorParam = args.find(arg => arg.name === undefined || arg.name === 'v');

    if (vectorParam) {
      const extractedVector = extractVectorParameter(vectorParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          vector = [extractedVector[0], extractedVector[1], 0];
        } else if (extractedVector.length === 1) {
          // 1D vector, Y and Z should default to 0
          vector = [extractedVector[0], 0, 0];
        } else {
          console.log(`[TransformVisitor.createTranslateNode] Invalid vector length: ${extractedVector.length}`);
        }
      } else {
        console.log(`[TransformVisitor.createTranslateNode] Invalid vector: ${extractedVector}`);
      }
    } else if (args.length === 1 && args[0].name === undefined) {
      // Handle case where vector is provided as a positional parameter
      const extractedVector = extractVectorParameter(args[0]);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          vector = [extractedVector[0], extractedVector[1], 0];
        } else if (extractedVector.length === 1) {
          // 1D vector, Y and Z should default to 0
          vector = [extractedVector[0], 0, 0];
        }
      }
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    console.log(`[TransformVisitor.createTranslateNode] Created translate node with vector=[${vector}], children=${children.length}`);

    return {
      type: 'translate',
      v: vector, // Use v property to match the TranslateNode interface
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a rotate node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The rotate AST node or null if the arguments are invalid
   */
  private createRotateNode(node: TSNode, args: ast.Parameter[]): ast.RotateNode | null {
    console.log(`[TransformVisitor.createRotateNode] Creating rotate node with ${args.length} arguments`);

    // Extract angle parameter
    let angle: number | [number, number, number] = 0;
    let v: [number, number, number] | undefined = undefined;

    const angleParam = args.find(arg => arg.name === undefined || arg.name === 'a');
    const vParam = args.find(arg => arg.name === 'v');

    // Handle case where angle is provided as a positional parameter
    if (args.length === 1 && args[0].name === undefined) {
      const extractedValue = args[0].value;

      // Check if it's a vector
      const extractedVector = extractVectorParameter(args[0]);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          angle = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          angle = [extractedVector[0], extractedVector[1], 0];
        } else if (extractedVector.length === 1) {
          // 1D vector, treat as scalar angle
          angle = extractedVector[0];
          // When a scalar angle is provided, default to z-axis rotation
          v = [0, 0, 1];
        }
      } else if (typeof extractedValue === 'number') {
        // It's a scalar angle
        angle = extractedValue;
        // When a scalar angle is provided, default to z-axis rotation
        v = [0, 0, 1];
      }
    } else if (angleParam) {
      // Handle named angle parameter
      const extractedVector = extractVectorParameter(angleParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          angle = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          angle = [extractedVector[0], extractedVector[1], 0];
        } else if (extractedVector.length === 1) {
          // 1D vector, treat as scalar angle
          angle = extractedVector[0];
          // When a scalar angle is provided, default to z-axis rotation
          v = [0, 0, 1];
        }
      } else {
        const numberValue = extractNumberParameter(angleParam);
        if (numberValue !== null) {
          angle = numberValue;
          // When a scalar angle is provided, default to z-axis rotation
          v = [0, 0, 1];
        }
      }
    }

    // Handle rotation axis parameter
    if (vParam) {
      const extractedVector = extractVectorParameter(vParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          v = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          v = [extractedVector[0], extractedVector[1], 0];
        }
      }
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    console.log(`[TransformVisitor.createRotateNode] Created rotate node with angle=${angle}, v=${v}, children=${children.length}`);

    return {
      type: 'rotate',
      a: angle, // Use a property to match the RotateNode interface
      v, // v property for axis-angle rotation
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a scale node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The scale AST node or null if the arguments are invalid
   */
  private createScaleNode(node: TSNode, args: ast.Parameter[]): ast.ScaleNode | null {
    console.log(`[TransformVisitor.createScaleNode] Creating scale node with ${args.length} arguments`);

    // Extract vector parameter
    let vector: [number, number, number] = [1, 1, 1]; // Default to [1, 1, 1] for uniform scaling
    const vectorParam = args.find(arg => arg.name === undefined || arg.name === 'v');

    // Handle case where scale is provided as a positional parameter
    if (args.length === 1 && args[0].name === undefined) {
      const extractedValue = args[0].value;

      // Check if it's a vector
      const extractedVector = extractVectorParameter(args[0]);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 1
          vector = [extractedVector[0], extractedVector[1], 1];
        } else if (extractedVector.length === 1) {
          // 1D vector, treat as uniform scaling
          const scale = extractedVector[0];
          vector = [scale, scale, scale];
        }
      } else if (typeof extractedValue === 'number') {
        // It's a scalar scale factor
        vector = [extractedValue, extractedValue, extractedValue];
      } else {
        // Try to extract as a number
        const numberValue = extractNumberParameter(args[0]);
        if (numberValue !== null) {
          vector = [numberValue, numberValue, numberValue];
        }
      }
    } else if (vectorParam) {
      // Handle named vector parameter
      const extractedVector = extractVectorParameter(vectorParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 1
          vector = [extractedVector[0], extractedVector[1], 1];
        } else if (extractedVector.length === 1) {
          // 1D vector, treat as uniform scaling
          const scale = extractedVector[0];
          vector = [scale, scale, scale];
        }
      } else {
        // Try to extract as a number
        const numberValue = extractNumberParameter(vectorParam);
        if (numberValue !== null) {
          vector = [numberValue, numberValue, numberValue];
        }
      }
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    console.log(`[TransformVisitor.createScaleNode] Created scale node with vector=[${vector}], children=${children.length}`);

    return {
      type: 'scale',
      v: vector, // Use v property to match the ScaleNode interface
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a mirror node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The mirror AST node or null if the arguments are invalid
   */
  private createMirrorNode(node: TSNode, args: ast.Parameter[]): ast.MirrorNode | null {
    console.log(`[TransformVisitor.createMirrorNode] Creating mirror node with ${args.length} arguments`);

    // Extract vector parameter
    let vector: [number, number, number] = [1, 0, 0]; // Default to x-axis mirror
    const vectorParam = args.find(arg => arg.name === undefined || arg.name === 'v');

    // Handle case where vector is provided as a positional parameter
    if (args.length === 1 && args[0].name === undefined) {
      const extractedVector = extractVectorParameter(args[0]);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          vector = [extractedVector[0], extractedVector[1], 0];
        }
      }
    } else if (vectorParam) {
      // Handle named vector parameter
      const extractedVector = extractVectorParameter(vectorParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          vector = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          vector = [extractedVector[0], extractedVector[1], 0];
        }
      }
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    console.log(`[TransformVisitor.createMirrorNode] Created mirror node with vector=[${vector}], children=${children.length}`);

    return {
      type: 'mirror',
      v: vector, // Use v property to match the MirrorNode interface
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a resize node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The resize AST node or null if the arguments are invalid
   */
  private createResizeNode(node: TSNode, args: ast.Parameter[]): ast.ResizeNode | null {
    console.log(`[TransformVisitor.createResizeNode] Creating resize node with ${args.length} arguments`);

    // Extract parameters
    let newsize: [number, number, number] = [0, 0, 0];
    let auto: [boolean, boolean, boolean] = [false, false, false];

    // Handle case where newsize is provided as a positional parameter
    if (args.length >= 1 && args[0].name === undefined) {
      const extractedVector = extractVectorParameter(args[0]);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          newsize = [extractedVector[0], extractedVector[1], extractedVector[2]];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to 0
          newsize = [extractedVector[0], extractedVector[1], 0];
        }
      }
    } else {
      // Handle named newsize parameter
      const newsizeParam = args.find(arg => arg.name === 'newsize');
      if (newsizeParam) {
        const extractedVector = extractVectorParameter(newsizeParam);
        if (extractedVector) {
          if (extractedVector.length === 3) {
            newsize = [extractedVector[0], extractedVector[1], extractedVector[2]];
          } else if (extractedVector.length === 2) {
            // 2D vector, Z should default to 0
            newsize = [extractedVector[0], extractedVector[1], 0];
          }
        }
      }
    }

    // Handle auto parameter
    const autoParam = args.find(arg => arg.name === 'auto');
    if (autoParam) {
      // Check if auto is a vector
      const extractedVector = extractVectorParameter(autoParam);
      if (extractedVector) {
        if (extractedVector.length === 3) {
          auto = [
            extractedVector[0] !== 0,
            extractedVector[1] !== 0,
            extractedVector[2] !== 0
          ];
        } else if (extractedVector.length === 2) {
          // 2D vector, Z should default to false
          auto = [
            extractedVector[0] !== 0,
            extractedVector[1] !== 0,
            false
          ];
        }
      } else {
        // Check if auto is a boolean
        const boolValue = extractBooleanParameter(autoParam);
        if (boolValue !== null) {
          auto = [boolValue, boolValue, boolValue];
        }
      }
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    console.log(`[TransformVisitor.createResizeNode] Created resize node with newsize=[${newsize}], auto=[${auto}], children=${children.length}`);

    return {
      type: 'resize',
      newsize,
      auto,
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a multmatrix node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The multmatrix AST node or null if the arguments are invalid
   */
  private createMultmatrixNode(node: TSNode, args: ast.Parameter[]): ast.MultmatrixNode | null {
    console.log(`[TransformVisitor.createMultmatrixNode] Creating multmatrix node with ${args.length} arguments`);

    // Extract matrix parameter
    const matrix: number[][] = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    const matrixParam = args.find(arg => arg.name === undefined || arg.name === 'm');

    if (matrixParam && matrixParam.value.type === 'matrix') {
      // Matrix extraction would be more complex and depends on how matrices are represented in the AST
      // For now, we'll just use the identity matrix
      console.log(`[TransformVisitor.createMultmatrixNode] Using identity matrix for now`);
    }

    // Extract matrix from parameters
    if (matrixParam && matrixParam.value.type === 'vector') {
      // Try to extract the matrix from the vector parameter
      // This would need a more sophisticated extraction method for nested vectors
      console.log(`[TransformVisitor.createMultmatrixNode] Matrix parameter found, but extraction not yet implemented`);
    }

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    // No special handling for test cases anymore

    console.log(`[TransformVisitor.createMultmatrixNode] Created multmatrix node with children=${children.length}`);

    return {
      type: 'multmatrix',
      m: matrix, // Use m property to match the MultmatrixNode interface
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a color node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The color AST node or null if the arguments are invalid
   */
  private createColorNode(node: TSNode, args: ast.Parameter[]): ast.ColorNode | null {
    console.log(`[TransformVisitor.createColorNode] Creating color node with ${args.length} arguments`);

    // Extract color parameter
    let color: string | ast.Vector4D = "red";
    let alpha: number | undefined = undefined;

    const colorParam = args.find(arg => arg.name === undefined || arg.name === 'c');
    const alphaParam = args.find(arg => arg.name === 'alpha');

    if (colorParam) {
      // Try to extract as a string parameter first
      const stringValue = extractStringParameter(colorParam);
      if (stringValue !== null) {
        color = stringValue;
        console.log(`[TransformVisitor.createColorNode] Found color name: ${color}`);
      } else {
        // Try to extract as a vector parameter
        const vector = extractVectorParameter(colorParam);
        if (vector && vector.length === 3) {
          // Convert RGB to RGBA by adding alpha=1
          color = [vector[0], vector[1], vector[2], 1.0] as ast.Vector4D;
          console.log(`[TransformVisitor.createColorNode] Found RGB color, converted to RGBA: ${JSON.stringify(color)}`);
        } else if (vector && vector.length === 4) {
          color = [vector[0], vector[1], vector[2], vector[3]] as ast.Vector4D;
          alpha = vector[3];
          console.log(`[TransformVisitor.createColorNode] Found RGBA color: ${JSON.stringify(color)}`);
        } else {
          console.log(`[TransformVisitor.createColorNode] Invalid color parameter: ${JSON.stringify(colorParam.value)}`);
        }
      }
    }

    if (alphaParam) {
      const alphaValue = extractNumberParameter(alphaParam);
      if (alphaValue !== null) {
        alpha = alphaValue;
        console.log(`[TransformVisitor.createColorNode] Found alpha parameter: ${alpha}`);
      } else {
        console.log(`[TransformVisitor.createColorNode] Invalid alpha parameter: ${JSON.stringify(alphaParam.value)}`);
      }
    }

    // No more hardcoded special cases for testing

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    // No more special handling for test cases

    console.log(`[TransformVisitor.createColorNode] Created color node with color=${color}, alpha=${alpha}, children=${children.length}`);

    return {
      type: 'color',
      c: color, // Use c property to match the ColorNode interface
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create an offset node
   * @param node The node to process
   * @param args The arguments to the function
   * @returns The offset AST node or null if the arguments are invalid
   */
  private createOffsetNode(node: TSNode, args: ast.Parameter[]): ast.OffsetNode | null {
    console.log(`[TransformVisitor.createOffsetNode] Creating offset node with ${args.length} arguments`);

    // Extract parameters
    let radius: number = 0;
    let delta: number = 0;
    let chamfer: boolean = false;

    const radiusParam = args.find(arg => arg.name === 'r');
    const deltaParam = args.find(arg => arg.name === 'delta');
    const chamferParam = args.find(arg => arg.name === 'chamfer');

    if (radiusParam) {
      const radiusValue = extractNumberParameter(radiusParam);
      if (radiusValue !== null) {
        radius = radiusValue;
        console.log(`[TransformVisitor.createOffsetNode] Found radius parameter: ${radius}`);
      } else {
        console.log(`[TransformVisitor.createOffsetNode] Invalid radius parameter: ${JSON.stringify(radiusParam.value)}`);
      }
    }

    if (deltaParam) {
      const deltaValue = extractNumberParameter(deltaParam);
      if (deltaValue !== null) {
        delta = deltaValue;
        console.log(`[TransformVisitor.createOffsetNode] Found delta parameter: ${delta}`);
      } else {
        console.log(`[TransformVisitor.createOffsetNode] Invalid delta parameter: ${JSON.stringify(deltaParam.value)}`);
      }
    }

    if (chamferParam) {
      const chamferValue = extractBooleanParameter(chamferParam);
      if (chamferValue !== null) {
        chamfer = chamferValue;
        console.log(`[TransformVisitor.createOffsetNode] Found chamfer parameter: ${chamfer}`);
      } else {
        console.log(`[TransformVisitor.createOffsetNode] Invalid chamfer parameter: ${JSON.stringify(chamferParam.value)}`);
      }
    }

    // No more hardcoded special cases for testing

    // Extract children
    const bodyNode = node.childForFieldName('body');
    const children: ast.ASTNode[] = [];

    if (bodyNode) {
      const blockChildren = this.visitBlock(bodyNode);
      children.push(...blockChildren);
    }

    // No more special handling for test cases

    console.log(`[TransformVisitor.createOffsetNode] Created offset node with radius=${radius}, delta=${delta}, chamfer=${chamfer}, children=${children.length}`);

    return {
      type: 'offset',
      r: radius, // Use r property to match the OffsetNode interface
      delta,
      chamfer,
      children,
      location: getLocation(node)
    };
  }

  /**
   * Process an accessor_expression node
   * @param node The node to process
   * @returns The AST node or null if the node is not supported
   */
  visitAccessorExpression(node: TSNode): ast.ASTNode | null {
    try {
      if (node.text) {
        console.log(`[TransformVisitor.visitAccessorExpression] Processing accessor expression: ${node.text.substring(0, 50)}`);
      } else {
        console.log(`[TransformVisitor.visitAccessorExpression] Processing accessor expression (no text available)`);
      }
    } catch (error) {
      console.log(`[TransformVisitor.visitAccessorExpression] Error logging node text: ${error}`);
    }

    // Extract function name from the accessor_expression
    const functionNode = findDescendantOfType(node, 'identifier');
    if (!functionNode) {
      console.log(`[TransformVisitor.visitAccessorExpression] No function name found`);
      return null;
    }

    // Get the function name from the identifier node
    const functionName = functionNode.text;

    if (!functionName) {
      console.log(`[TransformVisitor.visitAccessorExpression] Empty function name`);
      return null;
    }

    console.log(`[TransformVisitor.visitAccessorExpression] Function name: ${functionName}`);

    // Check if this is a transformation function
    const transformFunctions = [
      'translate', 'rotate', 'scale', 'mirror', 'resize',
      'multmatrix', 'color', 'offset'
    ];

    if (!transformFunctions.includes(functionName)) {
      console.log(`[TransformVisitor.visitAccessorExpression] Not a transformation function: ${functionName}`);
      return null;
    }

    // Extract arguments from the argument_list
    const argsNode = node.childForFieldName('arguments');
    let args: ast.Parameter[] = [];
    if (argsNode) {
      args = extractArguments(argsNode);
    }

    console.log(`[TransformVisitor.visitAccessorExpression] Extracted ${args.length} arguments`);

    // Process based on function name
    return this.createASTNodeForFunction(node, functionName, args);
  }

  /**
   * Visit a module instantiation node
   * @param node The module instantiation node to visit
   * @returns The AST node or null if the node cannot be processed
   */
  visitModuleInstantiation(node: TSNode): ast.ASTNode | null {
    try {
      if (node.text) {
        console.log(`[TransformVisitor.visitModuleInstantiation] Processing module instantiation: ${node.text.substring(0, 50)}`);
      } else {
        console.log(`[TransformVisitor.visitModuleInstantiation] Processing module instantiation (no text available)`);
      }
    } catch (error) {
      console.log(`[TransformVisitor.visitModuleInstantiation] Error logging node text: ${error}`);
    }

    // Extract function name
    const nameFieldNode = node.childForFieldName('name');
    if (!nameFieldNode) {
      console.log(`[TransformVisitor.visitModuleInstantiation] No name field found for module instantiation`);
      return null;
    }

    const functionName = nameFieldNode.text;
    if (!functionName) {
      console.log(`[TransformVisitor.visitModuleInstantiation] Empty function name`);
      return null;
    }

    console.log(`[TransformVisitor.visitModuleInstantiation] Function name: ${functionName}`);

    // Extract arguments
    const argsNode = node.childForFieldName('arguments');
    const args = argsNode ? extractArguments(argsNode) : [];

    console.log(`[TransformVisitor.visitModuleInstantiation] Extracted ${args.length} arguments`);

    // Process based on function name
    return this.createASTNodeForFunction(node, functionName, args);
  }
}