import * as ast from '../ast-types';

/**
 * Extract a number parameter from a parameter object
 * @param param The parameter object
 * @returns The number value or null if the parameter is not a number
 */
export function extractNumberParameter(param: ast.Parameter): number | null {
  if (param.value.type === 'number') {
    return parseFloat(param.value.value);
  }
  return null;
}

/**
 * Extract a boolean parameter from a parameter object
 * @param param The parameter object
 * @returns The boolean value or null if the parameter is not a boolean
 */
export function extractBooleanParameter(param: ast.Parameter): boolean | null {
  if (param.value.type === 'boolean') {
    return param.value.value === 'true';
  }
  return null;
}

/**
 * Extract a string parameter from a parameter object
 * @param param The parameter object
 * @returns The string value or null if the parameter is not a string
 */
export function extractStringParameter(param: ast.Parameter): string | null {
  if (param.value.type === 'string') {
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
  if (param.value.type === 'vector') {
    return param.value.value.map(v => {
      if (v.type === 'number') {
        return parseFloat(v.value);
      }
      return 0;
    });
  }
  return null;
}

/**
 * Extract a range parameter from a parameter object
 * @param param The parameter object
 * @returns The range values as an array of numbers or null if the parameter is not a range
 */
export function extractRangeParameter(param: ast.Parameter): [number, number, number] | null {
  if (param.value.type === 'range') {
    const start = param.value.start ? parseFloat(param.value.start) : 0;
    const end = param.value.end ? parseFloat(param.value.end) : 0;
    const step = param.value.step ? parseFloat(param.value.step) : 1;
    return [start, end, step];
  }
  return null;
}

/**
 * Extract an identifier parameter from a parameter object
 * @param param The parameter object
 * @returns The identifier value or null if the parameter is not an identifier
 */
export function extractIdentifierParameter(param: ast.Parameter): string | null {
  if (param.value.type === 'identifier') {
    return param.value.value;
  }
  return null;
}
