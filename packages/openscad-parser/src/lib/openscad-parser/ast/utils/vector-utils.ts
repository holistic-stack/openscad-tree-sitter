import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types.js';
import { extractValue } from '../extractors/value-extractor.js';
import { findDescendantOfType } from './node-utils.js';

/**
 * Extract a vector (2D or 3D) from a vector node
 *
 * @param node The node to extract a vector from
 * @returns A 2D or 3D vector, or undefined if extraction fails
 */
export function extractVector(
  node: TSNode
): ast.Vector2D | ast.Vector3D | undefined {
  // const numbers: number[] = []; // Unused variable

  // Handle different node types
  if (node.type === 'array_literal') {
    // Process array_literal node
    return extractVectorFromArrayLiteral(node);
  } else if (node.type === 'expression') {
    // Try to find array_literal in expression
    const arrayLiteralNode = findDescendantOfType(node, 'array_literal');
    if (arrayLiteralNode) {
      return extractVectorFromArrayLiteral(arrayLiteralNode);
    }

    // If no array_literal found, try to extract from text
    return extractVectorFromText(node.text);
  } else if (node.type === 'accessor_expression') {
    // Try to find array_literal in accessor_expression
    const arrayLiteralNode = findDescendantOfType(node, 'array_literal');
    if (arrayLiteralNode) {
      return extractVectorFromArrayLiteral(arrayLiteralNode);
    }

    // If no array_literal found, try to extract from text
    return extractVectorFromText(node.text);
  } else {
    // For other node types, try to extract from text
    return extractVectorFromText(node.text);
  }
}

/**
 * Extract a vector from an array_literal node
 *
 * @param node The array_literal node
 * @returns A 2D or 3D vector, or undefined if extraction fails
 */
function extractVectorFromArrayLiteral(
  node: TSNode
): ast.Vector2D | ast.Vector3D | undefined {
  const numbers: number[] = [];
  const elementsToProcess = node.children || [];

  console.log(
    `[extractVectorFromArrayLiteral] Processing array_literal node: ${node.text.substring(
      0,
      30
    )}, children count: ${elementsToProcess.length}`
  );

  // Process each element
  for (const elementNode of elementsToProcess) {
    if (!elementNode) continue;

    console.log(
      `[extractVectorFromArrayLiteral] Iterating child: type='${
        elementNode.type
      }', text='${elementNode.text.substring(0, 20)}'`
    );

    if (elementNode.type === 'expression') {
      // Process expression node
      const value = extractValue(elementNode);
      if (typeof value === 'number') {
        numbers.push(value);
      }
    } else if (elementNode.type === 'number') {
      // Process number node directly
      const numValue = parseFloat(elementNode.text);
      if (!isNaN(numValue)) {
        numbers.push(numValue);
      }
    } else if (elementNode.type === 'identifier') {
      // For identifiers, we can't determine the value at parse time
      // For now, use 0 as a placeholder
      numbers.push(0);
    } else if (elementNode.type === 'unary_expression') {
      // Process unary expression (like -5)
      const operatorNode = elementNode.child(0);
      const operandNode = elementNode.child(1);

      if (operatorNode && operandNode && operandNode.type === 'number') {
        const operator = operatorNode.text;
        const operand = parseFloat(operandNode.text);

        if (!isNaN(operand)) {
          if (operator === '-') {
            numbers.push(-operand);
          } else if (operator === '+') {
            numbers.push(operand);
          }
        }
      }
    } else {
      console.log(
        `[extractVectorFromArrayLiteral] Skipping child of array_literal: type='${elementNode.type}'`
      );
    }
  }

  return createVectorFromNumbers(numbers, node.text);
}

/**
 * Extract a vector from a text string
 *
 * @param text The text to extract a vector from
 * @returns A 2D or 3D vector, or undefined if extraction fails
 */
function extractVectorFromText(
  text: string
): ast.Vector2D | ast.Vector3D | undefined {
  console.log(
    `[extractVectorFromText] Trying to extract vector from text: ${text}`
  );

  // Try to extract 3D vector
  const matches = text.match(
    /\[\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\]/
  );
  if (matches && matches.length === 4 && matches[1] && matches[2] && matches[3]) {
    const vector = [
      parseFloat(matches[1]),
      parseFloat(matches[2]),
      parseFloat(matches[3]),
    ];
    console.log(
      `[extractVectorFromText] Extracted 3D vector from text: ${JSON.stringify(
        vector
      )}`
    );
    return vector as ast.Vector3D;
  }

  // Try to extract 2D vector
  const matches2D = text.match(/\[\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\]/);
  if (matches2D && matches2D.length === 3 && matches2D[1] && matches2D[2]) {
    const vector = [parseFloat(matches2D[1]), parseFloat(matches2D[2])];
    console.log(
      `[extractVectorFromText] Extracted 2D vector from text: ${JSON.stringify(
        vector
      )}`
    );
    return vector as ast.Vector2D;
  }

  return undefined;
}

/**
 * Create a vector from an array of numbers
 *
 * @param numbers The array of numbers
 * @param originalText The original text for debugging
 * @returns A 2D or 3D vector, or undefined if creation fails
 */
function createVectorFromNumbers(
  numbers: number[],
  originalText: string
): ast.Vector2D | ast.Vector3D | undefined {
  // Filter out null, undefined, and NaN values
  const validNumbers = numbers.filter(n => n !== null && n !== undefined && !isNaN(n));

  if (validNumbers.length === 2) {
    console.log(
      `[createVectorFromNumbers] Returning 2D vector: ${JSON.stringify([
        validNumbers[0],
        validNumbers[1],
      ])}`
    );
    return [validNumbers[0], validNumbers[1]] as ast.Vector2D;
  } else if (validNumbers.length === 3) {
    console.log(
      `[createVectorFromNumbers] Returning 3D vector: ${JSON.stringify([
        validNumbers[0],
        validNumbers[1],
        validNumbers[2],
      ])}`
    );
    return [validNumbers[0], validNumbers[1], validNumbers[2]] as ast.Vector3D;
  } else if (validNumbers.length === 1) {
    // Single value - create uniform vector
    console.log(
      `[createVectorFromNumbers] Returning uniform 3D vector: ${JSON.stringify([
        validNumbers[0],
        validNumbers[0],
        validNumbers[0],
      ])}`
    );
    return [validNumbers[0], validNumbers[0], validNumbers[0]] as ast.Vector3D;
  }

  // This warning will now be more specific about failure.
  console.warn(
    `[createVectorFromNumbers] FAILURE: Extracted ${
      validNumbers.length
    } valid numbers from '${originalText.substring(
      0,
      30
    )}'. Expected 1, 2 or 3. Valid numbers: ${JSON.stringify(validNumbers)}. Original numbers: ${JSON.stringify(numbers)}.`
  );
  return undefined;
}
