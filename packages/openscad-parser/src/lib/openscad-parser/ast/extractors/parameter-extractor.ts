import * as ast from '../ast-types';

/**
 * Check if a value is an expression node
 * @param value The value to check
 * @returns True if the value is an expression node
 */
function isExpressionNode(value: ast.ParameterValue): value is ast.ExpressionNode {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'expression';
}

/**
 * Extract a number parameter from a parameter object
 * @param param The parameter object
 * @returns The number value or null if the parameter is not a number
 */
export function extractNumberParameter(param: ast.Parameter): number | null {
  if (!param || !param.value) return null;

  // Handle number as raw value
  if (typeof param.value === 'number') {
    return param.value;
  }

  // Handle expression node
  if (isExpressionNode(param.value)) {
    if (param.value.expressionType === 'literal' && typeof (param.value as ast.LiteralNode).value === 'number') {
      return (param.value as ast.LiteralNode).value as number;
    }

    if (param.value.expressionType === 'unary') {
      const unaryExpr = param.value as ast.UnaryExpressionNode;
      if (unaryExpr.operator === '-' &&
          unaryExpr.operand.expressionType === 'literal' &&
          typeof (unaryExpr.operand as ast.LiteralNode).value === 'number') {
        return -(unaryExpr.operand as ast.LiteralNode).value as number;
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

  // Handle boolean as raw value
  if (typeof param.value === 'boolean') {
    return param.value;
  }

  // Handle string representation of boolean
  if (typeof param.value === 'string') {
    if (param.value.toLowerCase() === 'true') return true;
    if (param.value.toLowerCase() === 'false') return false;
  }

  // Handle expression node
  if (isExpressionNode(param.value)) {
    if (param.value.expressionType === 'literal' && typeof (param.value as ast.LiteralNode).value === 'boolean') {
      return (param.value as ast.LiteralNode).value as boolean;
    }
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

  // Handle string as raw value
  if (typeof param.value === 'string') {
    return param.value;
  }

  // Handle expression node
  if (isExpressionNode(param.value)) {
    if (param.value.expressionType === 'literal' && typeof (param.value as ast.LiteralNode).value === 'string') {
      return (param.value as ast.LiteralNode).value as string;
    }
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

  // Handle Vector2D or Vector3D as raw value
  if (Array.isArray(param.value) && param.value.every(v => typeof v === 'number')) {
    return param.value as number[];
  }

  // Handle expression node
  if (isExpressionNode(param.value)) {
    if (param.value.expressionType === 'array') {
      const arrayExpr = param.value as ast.ArrayExpressionNode;
      const values: number[] = [];

      for (const item of arrayExpr.items) {
        if (item.expressionType === 'literal' && typeof (item as ast.LiteralNode).value === 'number') {
          values.push((item as ast.LiteralNode).value as number);
        }
      }

      if (values.length > 0) {
        return values;
      }
    }
  }

  // Try to parse the value as a vector if it's a string
  if (typeof param.value === 'string') {
    const matches = param.value.match(/\[\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\]/);
    if (matches && matches.length === 4) {
      return [parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3])];
    }

    const matches2D = param.value.match(/\[\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\]/);
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

  // Handle array as raw value with 2 or 3 elements
  if (Array.isArray(param.value) && param.value.length >= 2 && param.value.every(v => typeof v === 'number')) {
    if (param.value.length === 2) {
      return [param.value[0], param.value[1], 1];
    } else if (param.value.length >= 3) {
      return [param.value[0], param.value[2], param.value[1]];
    }
  }

  // Handle expression node
  if (isExpressionNode(param.value) && param.value.expressionType === 'range') {
    // This is a placeholder for range expressions
    // In a real implementation, we would extract the start, end, and step values
    return [0, 10, 1]; // Default range
  }

  // Try to parse the value as a range if it's a string
  if (typeof param.value === 'string') {
    const matches = param.value.match(/\[\s*([\d.+-]+)\s*:\s*([\d.+-]+)\s*:\s*([\d.+-]+)\s*\]/);
    if (matches && matches.length === 4) {
      return [parseFloat(matches[1]), parseFloat(matches[3]), parseFloat(matches[2])];
    }

    const matches2 = param.value.match(/\[\s*([\d.+-]+)\s*:\s*([\d.+-]+)\s*\]/);
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

  // Handle string as identifier
  if (typeof param.value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param.value)) {
    return param.value;
  }

  // Handle expression node
  if (isExpressionNode(param.value) && param.value.expressionType === 'variable') {
    return (param.value as ast.VariableNode).name;
  }

  return null;
}
