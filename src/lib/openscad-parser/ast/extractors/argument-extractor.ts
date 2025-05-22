import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Extract arguments from an arguments node
 * @param argsNode The arguments node
 * @returns An array of parameters
 */
export function extractArguments(argsNode: TSNode): ast.Parameter[] {
  console.log(`[extractArguments] Processing arguments node: ${argsNode.text}`);
  const args: ast.Parameter[] = [];

  // Process each argument
  for (let i = 0; i < argsNode.namedChildCount; i++) {
    const argNode = argsNode.namedChild(i);
    if (!argNode) continue;

    console.log(`[extractArguments] Processing child ${i}: type=${argNode.type}, text=${argNode.text}`);

    if (argNode.type === 'argument') {
      const param = extractArgument(argNode);
      if (param) {
        console.log(`[extractArguments] Extracted parameter: ${JSON.stringify(param)}`);
        args.push(param);
      }
    }
  }

  // If we didn't find any arguments or we need to handle special arguments with $ prefix, try to parse the text directly
  if (argsNode.text) {
    console.log(`[extractArguments] Trying to parse text directly: ${argsNode.text}`);

    // Split the text by commas
    const argTexts = argsNode.text.split(',');

    for (const argText of argTexts) {
      console.log(`[extractArguments] Processing argument text: ${argText}`);

      // Check if this is a named argument
      const match = argText.trim().match(/^([^=]+)=(.*)$/);
      if (match) {
        const name = match[1].trim();
        const valueText = match[2].trim();
        console.log(`[extractArguments] Found named argument: ${name}=${valueText}`);

        // Try to parse the value
        let value: ast.Value | null = null;

        // Check if it's a number
        if (!isNaN(Number(valueText))) {
          value = { type: 'number', value: valueText };
        } else if (valueText === 'true' || valueText === 'false') {
          value = { type: 'boolean', value: valueText };
        } else if (valueText.startsWith('"') && valueText.endsWith('"')) {
          value = { type: 'string', value: valueText.substring(1, valueText.length - 1) };
        }

        if (value) {
          console.log(`[extractArguments] Extracted value: ${JSON.stringify(value)}`);

          // Check if this argument already exists in the args array
          const existingArgIndex = args.findIndex(arg => arg.name === name);
          if (existingArgIndex >= 0) {
            console.log(`[extractArguments] Argument ${name} already exists, skipping`);
            continue;
          }

          args.push({ name, value });
        }
      } else {
        // This is a positional argument
        const valueText = argText.trim();
        console.log(`[extractArguments] Found positional argument: ${valueText}`);

        // Try to parse the value
        let value: ast.Value | null = null;

        // Check if it's a number
        if (!isNaN(Number(valueText))) {
          value = { type: 'number', value: valueText };
        } else if (valueText === 'true' || valueText === 'false') {
          value = { type: 'boolean', value: valueText };
        } else if (valueText.startsWith('"') && valueText.endsWith('"')) {
          value = { type: 'string', value: valueText.substring(1, valueText.length - 1) };
        }

        if (value) {
          console.log(`[extractArguments] Extracted value: ${JSON.stringify(value)}`);
          args.push({ value });
        }
      }
    }
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
    return { name, value };
  } else if (argNode.namedChildCount === 1 && argNode.namedChild(0)) {
    // This is a positional argument
    const valueNode = argNode.namedChild(0);
    console.log(`[extractArgument] Found positional argument: ${valueNode.text}`);

    // Extract the value
    const value = extractValue(valueNode);
    if (!value) {
      console.log(`[extractArgument] Failed to extract value from node: ${valueNode.text}`);
      return null;
    }

    console.log(`[extractArgument] Extracted value: ${JSON.stringify(value)}`);
    return { value };
  }

  console.log(`[extractArgument] Failed to extract argument from node: ${argNode.text}`);
  return null;
}

/**
 * Extract a value from a value node
 * @param valueNode The value node
 * @returns A value object or null if the value is invalid
 */
function extractValue(valueNode: TSNode): ast.Value | null {
  console.log(`[extractValue] Processing value node: type=${valueNode.type}, text=${valueNode.text}`);

  switch (valueNode.type) {
    case 'expression': {
      // Unwrap the expression and extract from its first child
      const expressionChild = valueNode.namedChild(0);
      if (expressionChild) {
        console.log(`[extractValue] Unwrapping expression, processing child: type=${expressionChild.type}, text=${expressionChild.text}`);
        return extractValue(expressionChild);
      }
      return null;
    }

    case 'conditional_expression':
    case 'logical_or_expression':
    case 'logical_and_expression':
    case 'equality_expression':
    case 'relational_expression':
    case 'additive_expression':
    case 'multiplicative_expression':
    case 'exponentiation_expression':
    case 'unary_expression': {
      // Unwrap nested expressions
      const child = valueNode.namedChild(0);
      if (child) {
        console.log(`[extractValue] Unwrapping ${valueNode.type}, processing child: type=${child.type}, text=${child.text}`);
        return extractValue(child);
      }
      return null;
    }

    case 'accessor_expression': {
      // Handle accessor expressions (e.g., primary_expression)
      const primaryExpression = valueNode.namedChild(0);
      if (primaryExpression) {
        console.log(`[extractValue] Processing accessor_expression child: type=${primaryExpression.type}, text=${primaryExpression.text}`);
        return extractValue(primaryExpression);
      }
      return null;
    }

    case 'primary_expression': {
      // Handle primary expressions (e.g., number, string, etc.)
      const primaryChild = valueNode.namedChild(0);
      if (primaryChild) {
        console.log(`[extractValue] Processing primary_expression child: type=${primaryChild.type}, text=${primaryChild.text}`);
        return extractValue(primaryChild);
      }
      return null;
    }

    case 'number':
      console.log(`[extractValue] Extracted number: ${valueNode.text}`);
      return { type: 'number', value: valueNode.text };

    case 'string_literal': {
      // Remove quotes from string
      const stringValue = valueNode.text.substring(1, valueNode.text.length - 1);
      console.log(`[extractValue] Extracted string: ${stringValue}`);
      return { type: 'string', value: stringValue };
    }

    case 'boolean_literal':
    case 'true':
    case 'false': {
      const boolValue = valueNode.text === 'true';
      console.log(`[extractValue] Extracted boolean: ${boolValue}`);
      return { type: 'boolean', value: valueNode.text };
    }

    case 'identifier':
      console.log(`[extractValue] Extracted identifier: ${valueNode.text}`);
      return { type: 'identifier', value: valueNode.text };

    case 'vector_literal':
      return extractVectorLiteral(valueNode);

    case 'range_literal':
      return extractRangeLiteral(valueNode);

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
