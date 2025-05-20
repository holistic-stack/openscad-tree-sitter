import { TSNode } from './location-utils';
import * as ast from '../ast-types';
import { extractValue } from '../extractors/value-extractor';

/**
 * Extract a vector (2D or 3D) from a vector node
 */
export function extractVector(node: TSNode): ast.Vector2D | ast.Vector3D | undefined {
  const numbers: number[] = [];
  const elementsToProcess = node.type === 'array_literal' ? node.children : [];

  console.log(`[extractVector] Processing array_literal node: ${node.text.substring(0,30)}, children count: ${elementsToProcess.length}`);
  for (const elementNode of elementsToProcess) {
    if (!elementNode) continue;
    console.log(`[extractVector] Iterating child: type='${elementNode.type}', text='${elementNode.text.substring(0,20)}'`);

    // Only process expression, number, identifier, or unary_expression nodes as potential vector elements
    if (elementNode.type === 'expression' ||
        elementNode.type === 'number' ||
        elementNode.type === 'identifier' ||
        elementNode.type === 'unary_expression') {
      console.log(`[extractVector]   Processing child of array_literal: type='${elementNode.type}', text='${elementNode.text.substring(0,20)}'`); // DEBUG
      const value = extractValue(elementNode);
      console.log(`[extractVector]   extractValue returned: ${JSON.stringify(value)}, typeof: ${typeof value}`);
      if (typeof value === 'number') {
        numbers.push(value);
      } else {
        console.log(`[extractVector]   Skipping non-number value: ${JSON.stringify(value)}`);
      }
    } else {
      console.log(`[extractVector]   Skipping child of array_literal: type='${elementNode.type}' (not an expression, number, identifier, or unary_expression)`);
    }
  }

  if (numbers.length === 2) {
    console.log(`[extractVector] Returning 2D vector from ${node.text.substring(0,20)}: ${JSON.stringify([numbers[0], numbers[1]])}`); // DEBUG
    return [numbers[0], numbers[1]] as ast.Vector2D;
  } else if (numbers.length === 3) {
    console.log(`[extractVector] Returning 3D vector from ${node.text.substring(0,20)}: ${JSON.stringify([numbers[0], numbers[1], numbers[2]])}`); // DEBUG
    return [numbers[0], numbers[1], numbers[2]] as ast.Vector3D;
  }

  // This warning will now be more specific about failure.
  console.warn(`[extractVector] FAILURE: Extracted ${numbers.length} numbers from array_literal node '${node.text.substring(0,30)}'. Expected 2 or 3. Numbers: ${JSON.stringify(numbers)}. RETURNING UNDEFINED.`);
  return undefined;
}
