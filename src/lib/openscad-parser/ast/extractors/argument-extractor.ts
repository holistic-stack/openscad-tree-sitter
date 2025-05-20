import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Extract arguments from an arguments node
 * @param argsNode The arguments node
 * @returns An array of parameters
 */
export function extractArguments(argsNode: TSNode): ast.Parameter[] {
  const args: ast.Parameter[] = [];
  
  // Process each argument
  for (let i = 0; i < argsNode.namedChildCount; i++) {
    const argNode = argsNode.namedChild(i);
    if (!argNode) continue;
    
    if (argNode.type === 'argument') {
      const param = extractArgument(argNode);
      if (param) {
        args.push(param);
      }
    }
  }
  
  return args;
}

/**
 * Extract a parameter from an argument node
 * @param argNode The argument node
 * @returns A parameter object or null if the argument is invalid
 */
function extractArgument(argNode: TSNode): ast.Parameter | null {
  // Extract name if present
  const nameNode = argNode.childForFieldName('name');
  const name = nameNode ? nameNode.text : undefined;
  
  // Extract value
  const valueNode = argNode.childForFieldName('value');
  if (!valueNode) return null;
  
  const value = extractValue(valueNode);
  if (!value) return null;
  
  return { name, value };
}

/**
 * Extract a value from a value node
 * @param valueNode The value node
 * @returns A value object or null if the value is invalid
 */
function extractValue(valueNode: TSNode): ast.Value | null {
  switch (valueNode.type) {
    case 'number_literal':
      return { type: 'number', value: valueNode.text };
    
    case 'string_literal':
      // Remove quotes from string
      const stringValue = valueNode.text.substring(1, valueNode.text.length - 1);
      return { type: 'string', value: stringValue };
    
    case 'boolean_literal':
      return { type: 'boolean', value: valueNode.text };
    
    case 'identifier':
      return { type: 'identifier', value: valueNode.text };
    
    case 'vector_literal':
      return extractVectorLiteral(valueNode);
    
    case 'range_literal':
      return extractRangeLiteral(valueNode);
    
    default:
      return null;
  }
}

/**
 * Extract a vector literal from a vector_literal node
 * @param vectorNode The vector_literal node
 * @returns A vector value object or null if the vector is invalid
 */
function extractVectorLiteral(vectorNode: TSNode): ast.VectorValue | null {
  const values: ast.Value[] = [];
  
  // Process each element in the vector
  for (let i = 0; i < vectorNode.namedChildCount; i++) {
    const elementNode = vectorNode.namedChild(i);
    if (!elementNode) continue;
    
    const value = extractValue(elementNode);
    if (value) {
      values.push(value);
    }
  }
  
  return { type: 'vector', value: values };
}

/**
 * Extract a range literal from a range_literal node
 * @param rangeNode The range_literal node
 * @returns A range value object or null if the range is invalid
 */
function extractRangeLiteral(rangeNode: TSNode): ast.RangeValue | null {
  const startNode = rangeNode.childForFieldName('start');
  const endNode = rangeNode.childForFieldName('end');
  const stepNode = rangeNode.childForFieldName('step');
  
  const start = startNode ? startNode.text : undefined;
  const end = endNode ? endNode.text : undefined;
  const step = stepNode ? stepNode.text : undefined;
  
  return { type: 'range', start, end, step };
}
