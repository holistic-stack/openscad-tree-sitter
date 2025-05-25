import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { extractArguments } from './argument-extractor';
import { getLocation } from '../utils/location-utils';
import {
  extractNumberParameter,
  extractBooleanParameter,
  extractVectorParameter,
} from '../extractors/parameter-extractor';
import { ErrorHandler } from '../../error-handling';
// findDescendantOfType is not used in this file

/**
 * Extract a cube node from an accessor expression node
 * @param node The accessor expression node
 * @param errorHandler Optional error handler for enhanced expression evaluation
 * @returns A cube AST node or null if the node cannot be processed
 */
export function extractCubeNode(node: TSNode, errorHandler?: ErrorHandler): ast.CubeNode | null {
  console.log(
    `[extractCubeNode] Processing cube node: ${node.text.substring(0, 50)}`
  );
  console.log(
    `[extractCubeNode] Node type: ${node.type}, childCount: ${node.childCount}`
  );

  // Default values
  let size: number | ast.Vector3D = 1;
  let center = false;

  // Find the argument_list node - it could be a direct child or a field
  let argsNode: TSNode | null = null;

  // First try to get it as a field (for module_instantiation nodes)
  argsNode = node.childForFieldName('arguments');

  // If not found as field, look for argument_list as a direct child (for accessor_expression nodes)
  if (!argsNode) {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'argument_list') {
        argsNode = child;
        console.log(`[extractCubeNode] Found argument_list as child[${i}]`);
        break;
      }
    }
  }

  if (!argsNode) {
    console.log(`[extractCubeNode] No arguments found, using default values`);
    return {
      type: 'cube',
      size,
      center,
      location: getLocation(node),
    };
  }

  console.log(
    `[extractCubeNode] Found arguments node: type=${argsNode.type}, text='${argsNode.text}'`
  );

  const args = extractArguments(argsNode, errorHandler);
  console.log(
    `[extractCubeNode] Extracted ${args.length} arguments: ${JSON.stringify(
      args
    )}`
  );

  // Process arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Handle size parameter (first positional parameter or named 'size')
    if ((i === 0 && !arg.name) || arg.name === 'size') {
      // Check if it's a vector parameter
      const vectorValue = extractVectorParameter(arg);
      if (vectorValue && vectorValue.length >= 1) {
        if (vectorValue.length === 3) {
          size = vectorValue as ast.Vector3D;
        } else if (vectorValue.length === 2) {
          // If only 2 values provided, use 0 for z
          size = [vectorValue[0], vectorValue[1], 0] as ast.Vector3D;
        } else if (vectorValue.length === 1) {
          // If only 1 value provided, use it as a scalar
          size = vectorValue[0];
        }
        console.log(
          `[extractCubeNode] Found vector size: ${JSON.stringify(size)}`
        );
      } else {
        // Try as a number parameter
        const numberValue = extractNumberParameter(arg, errorHandler);
        if (numberValue !== null) {
          size = numberValue;
          console.log(`[extractCubeNode] Found number size: ${size}`);
        } else {
          console.log(
            `[extractCubeNode] Invalid size parameter: ${JSON.stringify(
              arg.value
            )}`
          );
        }
      }
    }
    // Handle center parameter (second positional parameter or named 'center')
    else if ((i === 1 && !arg.name) || arg.name === 'center') {
      const centerValue = extractBooleanParameter(arg, errorHandler);
      if (centerValue !== null) {
        center = centerValue;
        console.log(`[extractCubeNode] Found center parameter: ${center}`);
      } else {
        console.log(
          `[extractCubeNode] Invalid center parameter: ${JSON.stringify(
            arg.value
          )}`
        );
      }
    }
  }

  console.log(
    `[extractCubeNode] Final parameters: size=${JSON.stringify(
      size
    )}, center=${center}`
  );

  return {
    type: 'cube',
    size,
    center,
    location: getLocation(node),
  };
}
