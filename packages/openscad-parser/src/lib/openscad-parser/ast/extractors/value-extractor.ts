import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { findDescendantOfType } from '../utils/node-utils';
import { extractVector } from '../utils/vector-utils';
import { getLocation } from '../utils/location-utils';

/**
 * Extract a value from a node
 */
export function extractValue(node: TSNode): ast.ParameterValue {
  console.log(`[extractValue] Attempting to extract from node: type='${node.type}', text='${node.text.substring(0,50)}'`);

  switch (node.type) {
    case 'expression':
      console.log(`[extractValue] Unwrapping 'expression', calling extractValue on child: type='${node.child(0)?.type}', text='${node.child(0)?.text.substring(0,50)}'`);
      // Unwrap the expression and extract from its first child
      return node.childCount > 0 ? extractValue(node.child(0)!) : undefined;
    case 'number': {
      const numValue = parseFloat(node.text);
      console.log(`[extractValue] Extracted number: ${numValue}`);
      return numValue;
    }
    case 'string_literal': {
      // Remove quotes from string literals
      const stringValue = node.text.substring(1, node.text.length - 1);
      console.log(`[extractValue] Extracted string: "${stringValue}"`);
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
      console.log(`[extractValue] Calling extractVector for array_literal: ${node.text.substring(0,20)}`); // DEBUG
      return extractVector(node);
    case 'unary_expression': {
      if (node.childCount === 2) {
        const operatorNode = node.child(0);
        const operandNode = node.child(1);
        if (operatorNode && operandNode) {
          const operator = operatorNode.text;
          const operandValue = extractValue(operandNode);
          if (operator === '-' && typeof operandValue === 'number') return -operandValue;
          if (operator === '+' && typeof operandValue === 'number') return operandValue;
        }
      }
      console.warn(`[extractValue] Unhandled unary_expression: ${node.text.substring(0,30)}`);
      return undefined;
    }
    case 'logical_or_expression':
    case 'logical_and_expression':
    case 'equality_expression':
    case 'relational_expression':
    case 'additive_expression':
    case 'multiplicative_expression':
    case 'exponentiation_expression': {
      // For now, just try to parse as a number if it's a simple expression
      const potentialNumText = node.text.trim();
      const num = parseFloat(potentialNumText);
      if (!isNaN(num)) {
        console.log(`[extractValue] Default case parsed text '${potentialNumText}' as number: ${num}`);
        return num;
      }
      console.warn(`[extractValue] Default case for node type: '${node.type}', text: '${node.text.substring(0,30)}'`);
      // Fallback for complex expressions or expressions that evaluate to strings not yet handled.
      // This might need to be an actual expression object in the AST later.
      console.warn(`[extractValue] Complex 'expression' node text '${node.text.substring(0,30)}' returned as string or undefined. Consider specific handlers.`);
      // Returning node.text might be appropriate if the expression is a variable name not caught by 'identifier'.
      // However, for something like '1+2', it should ideally be an expression node or evaluated.
      // For now, returning undefined as a safer default for unhandled complex expressions.
      return undefined;
    }
    case 'identifier': {
      if (node.text === 'true') return true;
      if (node.text === 'false') return false;
      return {
        type: 'expression',
        expressionType: 'variable',
        name: node.text,
        location: getLocation(node)
      } as ast.VariableNode;
    }
    case 'conditional_expression': {
      console.log(`[extractValue] Processing conditional_expression: '${node.text.substring(0,30)}'`);
      // Check if this is a wrapper for an array_literal
      if (node.text.startsWith('[') && node.text.endsWith(']')) {
        // Try to find an array_literal in the descendants
        const arrayLiteralNode = findDescendantOfType(node, 'array_literal');
        if (arrayLiteralNode) {
          console.log(`[extractValue] Found array_literal in conditional_expression: '${arrayLiteralNode.text.substring(0,30)}'`);
          return extractVector(arrayLiteralNode);
        }
      }

      // If not an array literal, try to extract from the first child
      if (node.childCount > 0) {
        const firstChild = node.child(0);
        if (firstChild) {
          console.log(`[extractValue] Trying to extract from first child of conditional_expression: '${firstChild.type}'`);
          return extractValue(firstChild);
        }
      }

      // Fallback to parsing as number or returning text
      const potentialCondExprText = node.text.trim();
      const condExprNum = parseFloat(potentialCondExprText);
      if (!isNaN(condExprNum)) {
        console.log(`[extractValue] Parsed conditional_expression text '${potentialCondExprText}' as number: ${condExprNum}`);
        return condExprNum;
      }
      console.warn(`[extractValue] Returning raw text for conditional_expression: '${node.text.substring(0,30)}'`);
      return node.text;
    }
    default:
      console.warn(`[extractValue] Unhandled node type: '${node.type}', text: '${node.text.substring(0,30)}'`);
      return undefined;
  }
}
