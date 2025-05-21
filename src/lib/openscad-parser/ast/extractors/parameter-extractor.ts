import * as ast from '../ast-types';

/**
 * Extract a number parameter from a parameter object
 * @param param The parameter object
 * @returns The number value or null if the parameter is not a number
 */
export function extractNumberParameter(param: ast.Parameter): number | null {
  if (!param || !param.value) return null;

  // Handle direct number type
  if (param.value.type === 'number') {
    return parseFloat(param.value.value);
  }

  // Handle number as raw value
  if (typeof param.value === 'number') {
    return param.value;
  }

  // Handle expression that evaluates to a number
  if (param.value.type === 'expression' && typeof param.value.value === 'number') {
    return param.value.value;
  }

  // Handle unary expression (e.g., -5)
  if (param.value.type === 'unary_expression') {
    const operator = param.value.operator;
    const operand = param.value.operand;

    if (operand && typeof operand === 'number') {
      if (operator === '-') {
        return -operand;
      } else if (operator === '+') {
        return operand;
      }
    }
  }

  // Try to parse the value as a number if it's a string
  if (typeof param.value === 'string') {
    const num = parseFloat(param.value);
    if (!isNaN(num)) {
      return num;
    }
  }

  return null;
}

/**
 * Extract a boolean parameter from a parameter object
 * @param param The parameter object
 * @returns The boolean value or null if the parameter is not a boolean
 */
export function extractBooleanParameter(param: ast.Parameter): boolean | null {
  if (!param || !param.value) return null;

  // Handle direct boolean type
  if (param.value.type === 'boolean') {
    return param.value.value === 'true';
  }

  // Handle boolean as raw value
  if (typeof param.value === 'boolean') {
    return param.value;
  }

  // Handle string representation of boolean
  if (typeof param.value === 'string') {
    if (param.value.toLowerCase() === 'true') return true;
    if (param.value.toLowerCase() === 'false') return false;
  }

  // Handle expression that evaluates to a boolean
  if (param.value.type === 'expression' && typeof param.value.value === 'boolean') {
    return param.value.value;
  }

  return null;
}

/**
 * Extract a string parameter from a parameter object
 * @param param The parameter object
 * @returns The string value or null if the parameter is not a string
 */
export function extractStringParameter(param: ast.Parameter): string | null {
  if (!param || !param.value) return null;

  // Handle direct string type
  if (param.value.type === 'string') {
    return param.value.value;
  }

  // Handle string as raw value
  if (typeof param.value === 'string') {
    return param.value;
  }

  // Handle expression that evaluates to a string
  if (param.value.type === 'expression' && typeof param.value.value === 'string') {
    return param.value.value;
  }

  return null;
}

/**
 * Extract a vector parameter from a parameter object
 * @param param The parameter object
 * @returns The vector values as an array of numbers or null if the parameter is not a vector
 */
export function extractVectorParameter(param: ast.Parameter): number[] | null {
  if (!param || !param.value) return null;

  // Handle direct vector type
  if (param.value.type === 'vector') {
    return param.value.value.map(v => {
      if (v.type === 'number') {
        return parseFloat(v.value);
      } else if (typeof v === 'number') {
        return v;
      }
      return 0;
    });
  }

  // Handle array as raw value
  if (Array.isArray(param.value) && param.value.every(v => typeof v === 'number')) {
    return param.value as number[];
  }

  // Handle expression that evaluates to a vector
  if (param.value.type === 'expression' && Array.isArray(param.value.value)) {
    return param.value.value.map(v => typeof v === 'number' ? v : 0);
  }

  // Try to parse the value as a vector if it's a string
  if (typeof param.value === 'string') {
    const matches = param.value.match(/\[\s*([\d\.\-\+]+)\s*,\s*([\d\.\-\+]+)\s*,\s*([\d\.\-\+]+)\s*\]/);
    if (matches && matches.length === 4) {
      return [parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3])];
    }

    const matches2D = param.value.match(/\[\s*([\d\.\-\+]+)\s*,\s*([\d\.\-\+]+)\s*\]/);
    if (matches2D && matches2D.length === 3) {
      return [parseFloat(matches2D[1]), parseFloat(matches2D[2])];
    }
  }

  return null;
}

/**
 * Extract a range parameter from a parameter object
 * @param param The parameter object
 * @returns The range values as an array of numbers or null if the parameter is not a range
 */
export function extractRangeParameter(param: ast.Parameter): [number, number, number] | null {
  if (!param || !param.value) return null;

  // Handle direct range type
  if (param.value.type === 'range') {
    const start = param.value.start ? parseFloat(param.value.start) : 0;
    const end = param.value.end ? parseFloat(param.value.end) : 0;
    const step = param.value.step ? parseFloat(param.value.step) : 1;
    return [start, end, step];
  }

  // Handle array as raw value with 2 or 3 elements
  if (Array.isArray(param.value) && param.value.length >= 2 && param.value.every(v => typeof v === 'number')) {
    if (param.value.length === 2) {
      return [param.value[0], param.value[1], 1];
    } else if (param.value.length >= 3) {
      return [param.value[0], param.value[2], param.value[1]];
    }
  }

  // Try to parse the value as a range if it's a string
  if (typeof param.value === 'string') {
    const matches = param.value.match(/\[\s*([\d\.\-\+]+)\s*:\s*([\d\.\-\+]+)\s*:\s*([\d\.\-\+]+)\s*\]/);
    if (matches && matches.length === 4) {
      return [parseFloat(matches[1]), parseFloat(matches[3]), parseFloat(matches[2])];
    }

    const matches2 = param.value.match(/\[\s*([\d\.\-\+]+)\s*:\s*([\d\.\-\+]+)\s*\]/);
    if (matches2 && matches2.length === 3) {
      return [parseFloat(matches2[1]), parseFloat(matches2[2]), 1];
    }
  }

  return null;
}

/**
 * Extract an identifier parameter from a parameter object
 * @param param The parameter object
 * @returns The identifier value or null if the parameter is not an identifier
 */
export function extractIdentifierParameter(param: ast.Parameter): string | null {
  if (!param || !param.value) return null;

  // Handle direct identifier type
  if (param.value.type === 'identifier') {
    return param.value.value;
  }

  // Handle string as identifier
  if (typeof param.value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param.value)) {
    return param.value;
  }

  return null;
}
