import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { findDescendantOfType } from '../utils/node-utils';
import { extractVector } from '../utils/vector-utils';
import { getLocation } from '../utils/location-utils';
import { ErrorHandler } from '../../error-handling';
import { evaluateExpression } from '../evaluation/expression-evaluator-registry';

/**
 * Check if a node represents a complex expression that needs evaluation
 */
function isComplexExpression(node: TSNode): boolean {
  const complexTypes = new Set([
    'additive_expression',
    'multiplicative_expression',
    'exponentiation_expression',
    'logical_or_expression',
    'logical_and_expression',
    'equality_expression',
    'relational_expression',
    'binary_expression'
  ]);

  // Check if it's a complex type with multiple children (actual expression)
  if (complexTypes.has(node.type) && node.childCount > 1) {
    console.log(`[isComplexExpression] Detected complex expression: ${node.type} with ${node.childCount} children`);
    return true;
  }

  // Also check for arguments and argument nodes that might contain complex expressions
  if (node.type === 'arguments' || node.type === 'argument') {
    // Look for complex expressions in children
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && isComplexExpression(child)) {
        console.log(`[isComplexExpression] Found complex child in ${node.type}: ${child.type}`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Enhanced value extraction with expression evaluation support
 */
export function extractValueEnhanced(node: TSNode, errorHandler?: ErrorHandler): ast.ParameterValue {
  console.log(
    `[extractValueEnhanced] Attempting to extract from node: type='${
      node.type
    }', text='${node.text.substring(0, 50)}'`
  );

  // Check if this is a complex expression that needs evaluation
  if (isComplexExpression(node) && errorHandler) {
    console.log(`[extractValueEnhanced] Detected complex expression: ${node.type}`);

    try {
      const result = evaluateExpression(node, errorHandler);
      console.log(`[extractValueEnhanced] Evaluation result: ${result.type} = ${result.value}`);
      return result.value;
    } catch (error) {
      console.warn(`[extractValueEnhanced] Expression evaluation failed: ${error}`);
      // Fall back to simple extraction
    }
  }

  // Fall back to the original simple extraction logic
  return extractValue(node);
}

/**
 * Extract a value from a node (original implementation)
 */
export function extractValue(node: TSNode): ast.ParameterValue {
  console.log(
    `[extractValue] Attempting to extract from node: type='${
      node.type
    }', text='${node.text.substring(0, 50)}'`
  );

  switch (node.type) {
    case 'expression':
      console.log(
        `[extractValue] Unwrapping 'expression', calling extractValue on child: type='${
          node.child(0)?.type
        }', text='${node.child(0)?.text.substring(0, 50)}'`
      );
      // Unwrap the expression and extract from its first child
      return node.childCount > 0 ? extractValue(node.child(0)!) : undefined;
    case 'number': {
      const numValue = parseFloat(node.text);
      console.log(`[extractValue] Extracted number: ${numValue}`);
      return numValue;
    }
    case 'string_literal':
    case 'string': {
      // Remove quotes from string literals
      const stringValue = node.text.substring(1, node.text.length - 1);
      console.log(
        `[extractValue] Extracted string from ${node.type}: "${stringValue}"`
      );
      return stringValue;
    }
    case 'boolean':
    case 'true':
      console.log(`[extractValue] Extracted boolean: true`);
      return true;
    case 'false':
      console.log(`[extractValue] Extracted boolean: false`);
      return false;
    case 'array_literal':
      console.log(
        `[extractValue] Calling extractVector for array_literal: ${node.text.substring(
          0,
          20
        )}`
      ); // DEBUG
      return extractVector(node);
    case 'array_expression':
      console.log(
        `[extractValue] Calling extractVector for array_expression: ${node.text.substring(
          0,
          20
        )}`
      ); // DEBUG
      return extractVector(node);
    case 'unary_expression': {
      console.log(
        `[extractValue] Processing unary_expression with ${node.childCount} children: '${node.text}'`
      );

      // Handle actual unary operators (-, +)
      if (node.childCount === 2) {
        const operatorNode = node.child(0);
        const operandNode = node.child(1);
        if (operatorNode && operandNode) {
          const operator = operatorNode.text;
          const operandValue = extractValue(operandNode);
          if (operator === '-' && typeof operandValue === 'number') {
            console.log(`[extractValue] Applied unary minus: -${operandValue}`);
            return -operandValue;
          }
          if (operator === '+' && typeof operandValue === 'number') {
            console.log(`[extractValue] Applied unary plus: +${operandValue}`);
            return operandValue;
          }
        }
      }

      // Handle single child (wrapped value)
      if (node.childCount === 1) {
        const child = node.child(0);
        if (child) {
          console.log(
            `[extractValue] Single child in unary_expression: type='${child.type}', text='${child.text}'`
          );
          return extractValue(child);
        }
      }

      // Try to parse the text directly for simple values
      const text = node.text.trim();

      // Check for numbers
      const num = parseFloat(text);
      if (!isNaN(num)) {
        console.log(
          `[extractValue] Parsed unary_expression text '${text}' as number: ${num}`
        );
        return num;
      }

      // Check for strings
      if (text.startsWith('"') && text.endsWith('"')) {
        const stringValue = text.substring(1, text.length - 1);
        console.log(
          `[extractValue] Extracted string from unary_expression: "${stringValue}"`
        );
        return stringValue;
      }

      // Check for booleans
      if (text === 'true') {
        console.log(
          `[extractValue] Extracted boolean from unary_expression: true`
        );
        return true;
      }
      if (text === 'false') {
        console.log(
          `[extractValue] Extracted boolean from unary_expression: false`
        );
        return false;
      }

      console.warn(
        `[extractValue] Unhandled unary_expression: ${node.text.substring(
          0,
          30
        )}`
      );
      return undefined;
    }
    case 'logical_or_expression':
    case 'logical_and_expression':
    case 'equality_expression':
    case 'relational_expression':
    case 'additive_expression':
    case 'multiplicative_expression':
    case 'exponentiation_expression': {
      console.log(
        `[extractValue] Processing ${node.type} with ${node.childCount} children`
      );

      // These expression types often wrap simpler values, so try to extract from children
      if (node.childCount === 1) {
        const child = node.child(0);
        if (child) {
          console.log(
            `[extractValue] Single child in ${node.type}: type='${child.type}', text='${child.text}'`
          );
          return extractValue(child);
        }
      }

      // For complex expressions with multiple children, this is likely a binary operation
      // that should be handled by the expression evaluator
      if (node.childCount > 1) {
        console.log(
          `[extractValue] Complex ${node.type} with ${node.childCount} children - attempting enhanced extraction`
        );

        // Try to use enhanced extraction if this is a complex expression
        if (isComplexExpression(node)) {
          console.log(
            `[extractValue] Using enhanced extraction for complex ${node.type}`
          );
          // Create a simple error handler for this extraction
          const tempErrorHandler = {
            logInfo: (msg: string) => console.log(`[TempErrorHandler] ${msg}`),
            logWarning: (msg: string) => console.warn(`[TempErrorHandler] ${msg}`),
            handleError: (error: Error) => console.error(`[TempErrorHandler] ${error.message}`),
            getErrors: () => [],
            createParserError: (msg: string, context?: any) => new Error(msg),
            report: (error: Error) => console.error(`[TempErrorHandler] ${error.message}`)
          } as any;

          const enhancedResult = extractValueEnhanced(node, tempErrorHandler);
          if (enhancedResult !== undefined) {
            console.log(
              `[extractValue] Enhanced extraction succeeded: ${enhancedResult}`
            );
            return enhancedResult;
          }
        }
      }

      // For simple cases, try to parse as number first
      const potentialNumText = node.text.trim();
      const num = parseFloat(potentialNumText);
      if (!isNaN(num)) {
        console.log(
          `[extractValue] Parsed ${node.type} text '${potentialNumText}' as number: ${num}`
        );
        return num;
      }

      // Check for string literals in the text
      if (potentialNumText.startsWith('"') && potentialNumText.endsWith('"')) {
        const stringValue = potentialNumText.substring(
          1,
          potentialNumText.length - 1
        );
        console.log(
          `[extractValue] Extracted string from ${node.type}: "${stringValue}"`
        );
        return stringValue;
      }

      // Check for boolean literals
      if (potentialNumText === 'true') {
        console.log(`[extractValue] Extracted boolean from ${node.type}: true`);
        return true;
      }
      if (potentialNumText === 'false') {
        console.log(
          `[extractValue] Extracted boolean from ${node.type}: false`
        );
        return false;
      }

      console.warn(
        `[extractValue] Unhandled ${node.type}: '${node.text.substring(0, 30)}' - consider using extractValueEnhanced`
      );
      return undefined;
    }
    case 'identifier': {
      if (node.text === 'true') return true;
      if (node.text === 'false') return false;
      return {
        type: 'expression',
        expressionType: 'variable',
        name: node.text,
        location: getLocation(node),
      } as ast.VariableNode;
    }
    case 'conditional_expression': {
      console.log(
        `[extractValue] Processing conditional_expression: '${node.text.substring(
          0,
          30
        )}'`
      );
      // Check if this is a wrapper for an array_literal
      if (node.text.startsWith('[') && node.text.endsWith(']')) {
        // Try to find an array_literal in the descendants
        const arrayLiteralNode = findDescendantOfType(node, 'array_literal');
        if (arrayLiteralNode) {
          console.log(
            `[extractValue] Found array_literal in conditional_expression: '${arrayLiteralNode.text.substring(
              0,
              30
            )}'`
          );
          return extractVector(arrayLiteralNode);
        }
      }

      // If not an array literal, try to extract from the first child
      if (node.childCount > 0) {
        const firstChild = node.child(0);
        if (firstChild) {
          console.log(
            `[extractValue] Trying to extract from first child of conditional_expression: '${firstChild.type}'`
          );
          return extractValue(firstChild);
        }
      }

      // Fallback to parsing as number or returning text
      const potentialCondExprText = node.text.trim();
      const condExprNum = parseFloat(potentialCondExprText);
      if (!isNaN(condExprNum)) {
        console.log(
          `[extractValue] Parsed conditional_expression text '${potentialCondExprText}' as number: ${condExprNum}`
        );
        return condExprNum;
      }
      console.warn(
        `[extractValue] Returning raw text for conditional_expression: '${node.text.substring(
          0,
          30
        )}'`
      );
      return node.text;
    }
    case 'accessor_expression':
    case 'primary_expression': {
      console.log(
        `[extractValue] Processing ${node.type} with ${node.childCount} children: '${node.text}'`
      );

      // Handle single child (wrapped value)
      if (node.childCount === 1) {
        const child = node.child(0);
        if (child) {
          console.log(
            `[extractValue] Single child in ${node.type}: type='${child.type}', text='${child.text}'`
          );
          return extractValue(child);
        }
      }

      // Try to parse the text directly for simple values
      const text = node.text.trim();

      // Check for numbers
      const num = parseFloat(text);
      if (!isNaN(num)) {
        console.log(
          `[extractValue] Parsed ${node.type} text '${text}' as number: ${num}`
        );
        return num;
      }

      // Check for strings
      if (text.startsWith('"') && text.endsWith('"')) {
        const stringValue = text.substring(1, text.length - 1);
        console.log(
          `[extractValue] Extracted string from ${node.type}: "${stringValue}"`
        );
        return stringValue;
      }

      // Check for booleans
      if (text === 'true') {
        console.log(`[extractValue] Extracted boolean from ${node.type}: true`);
        return true;
      }
      if (text === 'false') {
        console.log(
          `[extractValue] Extracted boolean from ${node.type}: false`
        );
        return false;
      }

      console.warn(
        `[extractValue] Unhandled ${node.type}: ${node.text.substring(0, 30)}`
      );
      return undefined;
    }
    case 'argument': {
      console.log(
        `[extractValue] Processing argument node with ${node.childCount} children`
      );

      // Check if this is a named argument (contains '=')
      if (node.text.includes('=')) {
        console.log(
          `[extractValue] Detected named argument in value-extractor, should be handled by extractArgument. Returning undefined.`
        );
        return undefined;
      }

      // For positional arguments, look for the actual expression inside
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && child.type !== ',' && child.type !== '(' && child.type !== ')' && child.type !== '=') {
          console.log(
            `[extractValue] Found expression child in argument: type='${child.type}', text='${child.text}'`
          );
          return extractValue(child);
        }
      }

      console.warn(
        `[extractValue] No expression found in argument node: '${node.text}'`
      );
      return undefined;
    }
    case 'arguments': {
      console.log(
        `[extractValue] Processing arguments node with ${node.childCount} children`
      );

      // Arguments node is a container - look for the actual expression inside
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && child.type !== ',' && child.type !== '(' && child.type !== ')') {
          console.log(
            `[extractValue] Found expression child in arguments: type='${child.type}', text='${child.text}'`
          );
          return extractValue(child);
        }
      }

      console.warn(
        `[extractValue] No expression found in arguments node: '${node.text}'`
      );
      return undefined;
    }
    default:
      console.warn(
        `[extractValue] Unhandled node type: '${
          node.type
        }', text: '${node.text.substring(0, 30)}'`
      );
      return undefined;
  }
}
