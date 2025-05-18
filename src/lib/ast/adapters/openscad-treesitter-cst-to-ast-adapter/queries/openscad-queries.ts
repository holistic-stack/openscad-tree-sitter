/**
 * Tree-sitter queries for OpenSCAD patterns
 * 
 * These queries help efficiently find specific patterns in the syntax tree
 * using tree-sitter's built-in query language.
 */

// Find all 2D primitive calls
export const PRIMITIVE_2D_QUERY = `
(call_expression
  (identifier) @primitive_name
  (#match? @primitive_name "^(circle|square|polygon|text)$"))
`;

// Find all 3D primitive calls
export const PRIMITIVE_3D_QUERY = `
(call_expression
  (identifier) @primitive_name
  (#match? @primitive_name "^(cube|sphere|cylinder|polyhedron)$"))
`;

// Find all transformation calls
export const TRANSFORMATION_QUERY = `
(call_expression
  (identifier) @transform_name
  (#match? @transform_name "^(translate|rotate|scale|mirror|resize|multmatrix|color|offset|linear_extrude|rotate_extrude|projection)$"))
`;

// Find all operation calls
export const OPERATION_QUERY = `
(call_expression
  (identifier) @operation_name
  (#match? @operation_name "^(union|difference|intersection|minkowski|hull)$"))
`;

// Find all special variables
export const SPECIAL_VARIABLE_QUERY = `
(identifier) @special_var
(#match? @special_var "^\\$(fn|fa|fs|t|preview|vpr|vpt|vpd)$")
`;

// Find all module declarations
export const MODULE_DECLARATION_QUERY = `
(module_declaration
  name: (identifier) @module_name)
`;

// Find all function declarations
export const FUNCTION_DECLARATION_QUERY = `
(function_declaration
  name: (identifier) @function_name)
`;

// Find all module instantiations (calls)
export const MODULE_INSTANTIATION_QUERY = `
(call_expression
  (identifier) @module_name)
`;

// Find all control flow statements
export const CONTROL_FLOW_QUERY = `
(if_statement) @if_statement
(for_statement) @for_statement
(each_statement) @each_statement
`;

// Find all arguments with named parameters
export const NAMED_ARGUMENT_QUERY = `
(argument
  name: (identifier) @param_name
  value: (_) @param_value)
`;

// Find all arguments without named parameters (positional)
export const POSITIONAL_ARGUMENT_QUERY = `
(argument
  value: (_) @param_value)
`;

// Find all include and use statements
export const INCLUDE_USE_QUERY = `
(include_statement) @include_statement
(use_statement) @use_statement
`;

// Find all import statements
export const IMPORT_QUERY = `
(call_expression
  (identifier) @import_name
  (#match? @import_name "^(import|surface)$"))
`;
