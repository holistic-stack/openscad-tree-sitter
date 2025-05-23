import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Convert a Value to a ParameterValue
 * @param value The Value object to convert
 * @returns A ParameterValue object
 */
function convertValueToParameterValue(value: ast.Value): ast.ParameterValue {
  if (value.type === 'number') {
    return parseFloat(value.value as string);
  } else if (value.type === 'boolean') {
    return value.value === 'true';
  } else if (value.type === 'string') {
    return value.value as string;
  } else if (value.type === 'identifier') {
    return value.value as string;
  } else if (value.type === 'vector') {
    const vectorValues = (value.value as ast.Value[]).map(v => {
      if (v.type === 'number') {
        return parseFloat(v.value as string);
      }
      return 0;
    });

    if (vectorValues.length === 2) {
      return vectorValues as ast.Vector2D;
    } else if (vectorValues.length >= 3) {
      return [vectorValues[0], vectorValues[1], vectorValues[2]] as ast.Vector3D;
    }
    return 0; // Default fallback
  } else if (value.type === 'range') {
    // Create an expression node for range
    return {
      type: 'expression',
      expressionType: 'range',
      location: undefined
    };
  }

  // Default fallback - create a literal expression
  return {
    type: 'expression',
    expressionType: 'literal',
    value: typeof value.value === 'string' ? value.value : '',
    location: undefined
  } as ast.LiteralNode;
}

/**
 * Convert a node to a ParameterValue
 * @param node The node to convert
 * @returns A ParameterValue object or undefined if the conversion fails
 */
function convertNodeToParameterValue(node: TSNode): ast.ParameterValue | undefined {
  const value = extractValue(node);
  if (!value) return undefined;
  return convertValueToParameterValue(value);
}

/**
 * Extract arguments from an arguments node
 * @param argsNode The arguments node
 * @returns An array of parameters
 */
export function extractArguments(argsNode: TSNode): ast.Parameter[] {
  console.log(`[extractArguments] Processing arguments node: type=${argsNode.type}, text=${argsNode.text}`);
  const args: ast.Parameter[] = [];

  // Process each argument based on named children (structured parsing)
  for (let i = 0; i < argsNode.namedChildCount; i++) {
    const argNode = argsNode.namedChild(i);
    if (!argNode) continue;

    console.log(`[extractArguments] Processing structured child ${i}: type=${argNode.type}, text=${argNode.text}`);

    // Expecting 'argument' nodes which contain either 'named_argument' or an expression directly
    if (argNode.type === 'argument') {
      const param = extractArgument(argNode); // extractArgument should handle named vs positional within 'argument'
      if (param) {
        console.log(`[extractArguments] Extracted parameter from structured child: ${JSON.stringify(param)}`);
        args.push(param);
      }
    } else {
      // Handle cases where the child of argument_list is directly an expression (e.g. a single array_literal)
      // This might be needed if 'argument' nodes are not always present for single, unnamed arguments.
      console.log(`[extractArguments] Child is not of type 'argument', attempting to process as direct value: type=${argNode.type}`);
      const value = convertNodeToParameterValue(argNode);
      if (value !== undefined) {
        args.push({ value }); // Positional argument
        console.log(`[extractArguments] Extracted direct value as positional argument: ${JSON.stringify({value})}`);
      }
    }
  }

  // Fallback: If no arguments were extracted via structured parsing AND argsNode.text is non-empty and not just whitespace,
  // then consider the old text-based parsing. For now, this is commented out to isolate issues.
  /*
  if (args.length === 0 && argsNode.text && argsNode.text.trim() !== '') {
    console.log(`[extractArguments] No structured args found, trying to parse text directly: ${argsNode.text}`);

    // Split the text by commas
{{ ... }}
    }
  }
  */

  // If after all attempts, args is empty and argsNode.text is also empty or whitespace (e.g. for `translate()`), ensure we return empty.
  if (args.length === 0 && (!argsNode.text || argsNode.text.trim() === '')) {
    console.log('[extractArguments] No arguments found and text is empty, returning empty array.');
    return [];
  }

  console.log(`[extractArguments] Extracted ${args.length} arguments: ${JSON.stringify(args)}`);
  return args;
}

/**
 * Extract a parameter from an argument node
 * @param argNode The argument node
 * @returns A parameter object or null if the argument is invalid
 */
function extractArgument(argNode: TSNode): ast.Parameter | null {
  console.log(`[extractArgument] Processing argument node: ${argNode.text}`);

  // Check if this is a named argument (has identifier and '=' as children)
  const identifierNode = argNode.namedChild(0);
  const expressionNode = argNode.namedChild(1);

  if (identifierNode && identifierNode.type === 'identifier' && expressionNode) {
    // This is a named argument
    const name = identifierNode.text;
    console.log(`[extractArgument] Found named argument: ${name}`);

    // Extract the value from the expression
    const value = extractValue(expressionNode);
    if (!value) {
      console.log(`[extractArgument] Failed to extract value from expression: ${expressionNode.text}`);
      return null;
    }

    console.log(`[extractArgument] Extracted value: ${JSON.stringify(value)}`);
    // Convert Value to ParameterValue
    const paramValue = convertValueToParameterValue(value);
    return { name, value: paramValue };
  } else if (argNode.namedChildCount === 1 && argNode.namedChild(0)) {
    // This is a positional argument
    const valueNode = argNode.namedChild(0);
    if (valueNode) {
      console.log(`[extractArgument] Found positional argument: ${valueNode.text}`);

      // Extract the value
      const value = extractValue(valueNode);
      if (!value) {
        console.log(`[extractArgument] Failed to extract value from node: ${valueNode.text}`);
        return null;
      }

      console.log(`[extractArgument] Extracted value: ${JSON.stringify(value)}`);
      // Convert Value to ParameterValue
      const paramValue = convertValueToParameterValue(value);
      return { value: paramValue };
    }
  }

  console.log(`[extractArgument] Failed to extract argument from node: ${argNode.text}`);
  return null;
}

/**
 * Extract a value from a value node
 * @param valueNode The value node
 * @returns A value object or null if the value is invalid
 */
export function extractValue(valueNode: TSNode): ast.Value | null {
  // --- BEGIN DIAGNOSTIC LOGGING ---
  // console.log(`[extractValue ENTRY] Node Type: '${valueNode.type}', Text: '${valueNode.text.replace(/\n/g, '\\n')}', isNamed: ${valueNode.isNamed}`);
  // --- END DIAGNOSTIC LOGGING ---

  console.log(`[extractValue] Processing value node: type=${valueNode.type}, text='${valueNode.text}'`);
  switch (valueNode.type) {
    case 'expression': {
      const expressionChild = valueNode.namedChild(0); // Or child(0) if expressions can be anonymous
      if (expressionChild) {
        console.log(`[extractValue] Expression child: type=${expressionChild.type}, text='${expressionChild.text}'`);
        return extractValue(expressionChild);
      }
      console.log('[extractValue] Expression node has no processable child.');
      return null;
    }
    case 'arguments': { // Added case for 'arguments'
      // This case handles when a single, unnamed argument is passed,
      // and it's wrapped in an 'arguments' node by the parser.
      // e.g., translate([1,2,3]) -> argument_list has child 'arguments' (text: [1,2,3])
      // We expect the actual value (e.g., array_literal) to be the first child of this 'arguments' node.
      const firstChild = valueNode.child(0); // Or namedChild(0) if it's always named
      if (firstChild) {
        console.log(`[extractValue] 'arguments' node found. Processing its first child: type=${firstChild.type}, text='${firstChild.text}'`);
        return extractValue(firstChild);
      }
      console.log('[extractValue] \'arguments\' node has no processable child.');
      return null;
    }
    case 'argument': { // Added case for 'argument'
      // This handles the case where an 'arguments' node contains an 'argument' node,
      // which in turn contains the actual value node (e.g., array_literal).
      const firstChild = valueNode.child(0); // Or namedChild(0)
      if (firstChild) {
        console.log(`[extractValue] 'argument' node found. Processing its first child: type=${firstChild.type}, text='${firstChild.text}'`);
        return extractValue(firstChild);
      }
      console.log('[extractValue] \'argument\' node has no processable child.');
      return null;
    }
    case 'number': // Changed from 'number_literal'
      console.log(`[extractValue] Matched number. Value: ${valueNode.text}`);
      return { type: 'number', value: valueNode.text };

    case 'string_literal': { // Reverted to previous correct logic
      // Remove quotes from string
      const stringValue = valueNode.text.substring(1, valueNode.text.length - 1);
      console.log(`[extractValue] Extracted string: ${stringValue}`);
      return { type: 'string', value: stringValue };
    }

    case 'boolean_literal': // Reverted to previous correct logic
    case 'true':            // Reverted to previous correct logic
    case 'false': {         // Reverted to previous correct logic
      // const boolValue = valueNode.text === 'true'; // Not strictly needed as value is string 'true'/'false'
      console.log(`[extractValue] Extracted boolean: ${valueNode.text}`);
      return { type: 'boolean', value: valueNode.text };
    }

    case 'identifier':
      console.log(`[extractValue] Extracted identifier: ${valueNode.text}`);
      return { type: 'identifier', value: valueNode.text };

    case 'vector_literal': // Fallthrough
    case 'array_literal':
      return extractVectorLiteral(valueNode);

    case 'range_literal':
      return extractRangeLiteral(valueNode);

    // Handle expression hierarchy - these nodes typically have a single child that contains the actual value
    case 'conditional_expression':
    case 'logical_or_expression':
    case 'logical_and_expression':
    case 'equality_expression':
    case 'relational_expression':
    case 'additive_expression':
    case 'multiplicative_expression':
    case 'exponentiation_expression':
    case 'unary_expression':
    case 'postfix_expression':
    case 'accessor_expression':
    case 'primary_expression': {
      // These expression types typically have a single child that contains the actual value
      // Traverse down the expression hierarchy to find the leaf value
      console.log(`[extractValue] Processing expression hierarchy node: ${valueNode.type}`);

      // Try to find the first named child that contains a value
      for (let i = 0; i < valueNode.namedChildCount; i++) {
        const child = valueNode.namedChild(i);
        if (child) {
          console.log(`[extractValue] Trying child ${i}: type=${child.type}, text='${child.text}'`);
          const result = extractValue(child);
          if (result) {
            console.log(`[extractValue] Successfully extracted from ${valueNode.type} via child ${i}`);
            return result;
          }
        }
      }

      // If no named children worked, try all children
      for (let i = 0; i < valueNode.childCount; i++) {
        const child = valueNode.child(i);
        if (child && child.isNamed) {
          console.log(`[extractValue] Trying unnamed child ${i}: type=${child.type}, text='${child.text}'`);
          const result = extractValue(child);
          if (result) {
            console.log(`[extractValue] Successfully extracted from ${valueNode.type} via unnamed child ${i}`);
            return result;
          }
        }
      }

      console.log(`[extractValue] Could not extract value from expression hierarchy node: ${valueNode.type}`);
      return null;
    }

    default:
      console.log(`[extractValue] Unsupported value type: ${valueNode.type}`);
      return null;
  }
}

/**
 * Extract a vector literal from a vector_literal node
 * @param vectorNode The vector_literal node
 * @returns A vector value object or null if the vector is invalid
 */
function extractVectorLiteral(vectorNode: TSNode): ast.VectorValue | null {
  console.log(`[extractVectorLiteral] Processing vector/array node: type=${vectorNode.type}, text='${vectorNode.text}'`);
  const values: ast.Value[] = [];

  // Iterate over all children, including syntax tokens like ',', '[', ']'
  // extractValue should filter out non-value tokens by returning null.
  for (let i = 0; i < vectorNode.childCount; i++) {
    const elementNode = vectorNode.child(i);
    if (elementNode) { // Ensure child exists
      // --- BEGIN DIAGNOSTIC LOGGING ---
      console.log(`[extractVectorLiteral BEFORE extractValue] Child node: Type='${elementNode.type}', Text='${elementNode.text.replace(/\n/g, '\\n')}', isNamed=${elementNode.isNamed}`);
      // --- END DIAGNOSTIC LOGGING ---
      const value = extractValue(elementNode);
      if (value) {
        console.log('[extractVectorLiteral] Successfully extracted value for child:', JSON.stringify(value));
        values.push(value);
      }
    }
  }

  // It's possible for an array like `[,,]` to parse with no actual values.
  // Or if extractValue fails for all children. Default OpenSCAD behavior might be relevant here.
  // For now, if values is empty but the text wasn't just '[]', it might indicate a parsing problem for its elements.
  if (values.length === 0 && vectorNode.text.trim() !== '[]' && vectorNode.text.trim() !== '') {
    console.warn(`[extractVectorLiteral] Parsed an empty vector from non-empty text: '${vectorNode.text}'. This might indicate issues extracting its elements.`);
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

  return {
    type: 'range',
    start,
    end,
    step,
    value: rangeNode.text // Add the required value property
  };
}

export interface ExtractedNamedArgument {
  name: string;
  value: ast.Value;
}

export type ExtractedParameter = ExtractedNamedArgument | ast.Value;
