/**
 * @file mockSyntaxNodes.ts
 * @description Factory functions for creating mock syntax nodes for specific node types
 *
 * This file provides factory functions for creating mock syntax nodes for specific node types
 * with sensible defaults that can be easily customized for specific test cases.
 *
 * The mock factories follow the Builder Pattern, allowing you to create complex objects
 * with a fluent interface. Each factory has sensible defaults that can be overridden
 * as needed for specific test cases.
 *
 * @example
 * // Create a mock assignment statement with default values
 * const assignment = mockAssignmentStatement();
 *
 * // Create a mock assignment statement with custom values
 * const customAssignment = mockAssignmentStatement({ name: 'foo', value: '42' });
 */

import { mockNode, mockTree, MockNodeOptions, SyntaxNode, SyntaxTree } from './mockNodeFactory';

/**
 * Interface for assignment statement options
 */
export interface AssignmentStatementOptions extends Partial<MockNodeOptions> {
  name?: string;
  value?: string;
}

/**
 * Create a mock assignment statement node
 *
 * @param options - Options to customize the node
 * @returns A mock assignment statement node
 *
 * @example
 * // Create a basic assignment statement
 * const assignment = mockAssignmentStatement();
 *
 * // Create an assignment with custom values
 * const customAssignment = mockAssignmentStatement({
 *   name: 'radius',
 *   value: '10'
 * });
 */
export function mockAssignmentStatement(options: AssignmentStatementOptions = {}): SyntaxNode {
  const name = options.name || 'x';
  const value = options.value || 'value';

  return mockNode({
    type: 'assignment_statement',
    text: `${name} = ${value};`,
    childCount: 2,
    children: [
      mockNode({ type: 'identifier', text: name, fieldName: 'name' }),
      mockNode({ type: 'expression', text: value, fieldName: 'value' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'name') return mockNode({ type: 'identifier', text: name });
      if (fieldName === 'value') return mockNode({ type: 'expression', text: value });
      return null;
    },
    ...options
  });
}

/**
 * Create a collection of mock assignment statements
 *
 * @param code - The code being parsed
 * @returns An array of mock assignment statement nodes
 *
 * @example
 * // Get assignment statements for a specific code snippet
 * const assignments = mockAssignmentStatements('x = 10; y = 20; z = x + y;');
 */
export function mockAssignmentStatements(code: string): SyntaxNode[] {
  // Check if this is a test for multiple assignments
  if (code.includes('x = 10') && code.includes('y = 20') && code.includes('z = x + y')) {
    return [
      mockAssignmentStatement({ name: 'x', value: '10' }),
      mockAssignmentStatement({ name: 'y', value: '20' }),
      mockAssignmentStatement({ name: 'z', value: 'x + y' })
    ];
  }

  // Check if this is a test for special variables
  if (code.includes('$fn')) {
    return [mockAssignmentStatement({ name: '$fn', value: '100' })];
  }

  // Default case
  return [mockAssignmentStatement()];
}

/**
 * Interface for module definition options
 */
export interface ModuleDefinitionOptions extends Partial<MockNodeOptions> {
  name?: string;
  body?: string;
  parameters?: string[];
}

/**
 * Create a mock module definition node
 *
 * @param options - Options to customize the node
 * @returns A mock module definition node
 *
 * @example
 * // Create a basic module definition
 * const moduleDef = mockModuleDefinition();
 *
 * // Create a module definition with custom values
 * const customModule = mockModuleDefinition({
 *   name: 'cylinder_with_hole',
 *   parameters: ['radius', 'height'],
 *   body: '{ difference() { cylinder(r=radius, h=height); cylinder(r=radius/2, h=height+1); } }'
 * });
 */
export function mockModuleDefinition(options: ModuleDefinitionOptions = {}): SyntaxNode {
  const name = options.name || 'test';
  const body = options.body || '{ }';
  const parameters = options.parameters || [];
  const paramsText = parameters.length > 0 ? parameters.join(', ') : '';

  return mockNode({
    type: 'module_definition',
    text: `module ${name}(${paramsText}) ${body}`,
    childCount: 2,
    children: [
      mockNode({ type: 'identifier', text: name, fieldName: 'name' }),
      mockNode({ type: 'block', text: body, fieldName: 'body' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'name') return mockNode({ type: 'identifier', text: name });
      if (fieldName === 'body') return mockNode({ type: 'block', text: body });
      return null;
    },
    ...options
  });
}

/**
 * Interface for function definition options
 */
export interface FunctionDefinitionOptions extends Partial<MockNodeOptions> {
  name?: string;
  body?: string;
  parameters?: string[];
}

/**
 * Create a mock function definition node
 *
 * @param options - Options to customize the node
 * @returns A mock function definition node
 *
 * @example
 * // Create a basic function definition
 * const funcDef = mockFunctionDefinition();
 *
 * // Create a function definition with custom values
 * const customFunc = mockFunctionDefinition({
 *   name: 'calculate_volume',
 *   parameters: ['radius', 'height'],
 *   body: '{ return PI * radius * radius * height; }'
 * });
 */
export function mockFunctionDefinition(options: FunctionDefinitionOptions = {}): SyntaxNode {
  const name = options.name || 'add';
  const body = options.body || '{ return a + b; }';
  const parameters = options.parameters || ['a', 'b'];
  const paramsText = parameters.join(', ');

  return mockNode({
    type: 'function_definition',
    text: `function ${name}(${paramsText}) ${body}`,
    childCount: 2,
    children: [
      mockNode({ type: 'identifier', text: name, fieldName: 'name' }),
      mockNode({ type: 'block', text: body, fieldName: 'body' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'name') return mockNode({ type: 'identifier', text: name });
      if (fieldName === 'body') return mockNode({ type: 'block', text: body });
      return null;
    },
    ...options
  });
}

/**
 * Interface for module instantiation options
 */
export interface ModuleInstantiationOptions extends Partial<MockNodeOptions> {
  name?: string;
  args?: string;
  namedArgs?: { [key: string]: string };
}

/**
 * Create a mock module instantiation node
 *
 * @param options - Options to customize the node
 * @returns A mock module instantiation node
 *
 * @example
 * // Create a basic module instantiation
 * const cube = mockModuleInstantiation();
 *
 * // Create a module instantiation with custom values
 * const cylinder = mockModuleInstantiation({
 *   name: 'cylinder',
 *   namedArgs: { r: '5', h: '10' }
 * });
 */
export function mockModuleInstantiation(options: ModuleInstantiationOptions = {}): SyntaxNode {
  const name = options.name || 'cube';
  const namedArgs = options.namedArgs || {};

  // If namedArgs is provided, use it to generate the args string
  let args = options.args;
  if (!args && Object.keys(namedArgs).length > 0) {
    args = Object.entries(namedArgs)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
  } else if (!args) {
    args = '[10, 10, 10]';
  }

  return mockNode({
    type: 'module_instantiation',
    text: `${name}(${args});`,
    childCount: 2,
    children: [
      mockNode({ type: 'identifier', text: name, fieldName: 'name' }),
      mockNode({ type: 'argument_list', text: args, fieldName: 'arguments' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'name') return mockNode({ type: 'identifier', text: name });
      if (fieldName === 'arguments') return mockNode({ type: 'argument_list', text: args });
      return null;
    },
    ...options
  });
}

/**
 * Interface for for statement options
 */
export interface ForStatementOptions extends Partial<MockNodeOptions> {
  iterator?: string;
  range?: string;
  body?: string;
}

/**
 * Create a mock for statement node
 *
 * @param options - Options to customize the node
 * @returns A mock for statement node
 *
 * @example
 * // Create a basic for statement
 * const forStmt = mockForStatement();
 *
 * // Create a for statement with custom values
 * const customFor = mockForStatement({
 *   iterator: 'idx',
 *   range: '[0:2:10]',
 *   body: '{ translate([idx, 0, 0]) cube(1); }'
 * });
 */
export function mockForStatement(options: ForStatementOptions = {}): SyntaxNode {
  const iterator = options.iterator || 'i';
  const range = options.range || '[0:10]';
  const body = options.body || '{ cube(); }';

  return mockNode({
    type: 'for_statement',
    text: `for (${iterator} = ${range}) ${body}`,
    childCount: 3,
    children: [
      mockNode({ type: 'identifier', text: iterator, fieldName: 'iterator' }),
      mockNode({ type: 'range_expression', text: range, fieldName: 'range' }),
      mockNode({ type: 'block', text: body, fieldName: 'body' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'iterator') return mockNode({ type: 'identifier', text: iterator });
      if (fieldName === 'range') return mockNode({ type: 'range_expression', text: range });
      if (fieldName === 'body') return mockNode({ type: 'block', text: body });
      return null;
    },
    ...options
  });
}

/**
 * Interface for index expression options
 */
export interface IndexExpressionOptions extends Partial<MockNodeOptions> {
  array?: string;
  index?: string;
}

/**
 * Create a mock index expression node
 *
 * @param options - Options to customize the node
 * @returns A mock index expression node
 *
 * @example
 * // Create a basic index expression
 * const indexExpr = mockIndexExpression();
 *
 * // Create an index expression with custom values
 * const customIndex = mockIndexExpression({
 *   array: 'points',
 *   index: 'i'
 * });
 */
export function mockIndexExpression(options: IndexExpressionOptions = {}): SyntaxNode {
  const array = options.array || 'arr';
  const index = options.index || '0';

  return mockNode({
    type: 'index_expression',
    text: `${array}[${index}]`,
    childCount: 2,
    children: [
      mockNode({ type: 'identifier', text: array, fieldName: 'array' }),
      mockNode({ type: 'number', text: index, fieldName: 'index' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'array') return mockNode({ type: 'identifier', text: array });
      if (fieldName === 'index') return mockNode({ type: 'number', text: index });
      return null;
    },
    ...options
  });
}

/**
 * Interface for special variable options
 */
export interface SpecialVariableOptions extends Partial<MockNodeOptions> {
  name?: string;
}

/**
 * Create a mock special variable node
 *
 * @param options - Options to customize the node
 * @returns A mock special variable node
 *
 * @example
 * // Create a basic special variable
 * const specialVar = mockSpecialVariable();
 *
 * // Create a special variable with a custom name
 * const customVar = mockSpecialVariable({ name: '$fa' });
 */
export function mockSpecialVariable(options: SpecialVariableOptions = {}): SyntaxNode {
  const name = options.name || '$fn';

  return mockNode({
    type: 'special_variable',
    text: name,
    name,
    childCount: 0,
    children: [],
    childForFieldName: () => mockNode({ type: 'identifier', text: name }),
    ...options
  });
}

/**
 * Interface for list comprehension options
 */
export interface ListComprehensionOptions extends Partial<MockNodeOptions> {
  element?: string;
  forClause?: string;
  ifClause?: string;
  iterator?: string;
  range?: string;
  condition?: string;
}

/**
 * Create a mock list comprehension node
 *
 * @param options - Options to customize the node
 * @returns A mock list comprehension node
 *
 * @example
 * // Create a basic list comprehension
 * const listComp = mockListComprehension();
 *
 * // Create a list comprehension with custom values
 * const customComp = mockListComprehension({
 *   element: 'point * 2',
 *   iterator: 'point',
 *   range: 'points',
 *   condition: 'len(point) > 0'
 * });
 */
export function mockListComprehension(options: ListComprehensionOptions = {}): SyntaxNode {
  const element = options.element || 'i * i';

  // Allow specifying iterator, range, and condition separately for convenience
  let forClause = options.forClause;
  if (!forClause && options.iterator && options.range) {
    forClause = `for (${options.iterator} = ${options.range})`;
  } else {
    forClause = forClause || 'for (i = [1:10])';
  }

  let ifClause = options.ifClause;
  if (!ifClause && options.condition) {
    ifClause = `if (${options.condition})`;
  } else {
    ifClause = ifClause || 'if (i % 2 == 0)';
  }

  return mockNode({
    type: 'list_comprehension',
    text: `[${element} ${forClause} ${ifClause}]`,
    childCount: 3,
    children: [
      mockNode({ type: 'expression', text: element, fieldName: 'element' }),
      mockNode({ type: 'for_clause', text: forClause, fieldName: 'for_clause' }),
      mockNode({ type: 'if_clause', text: ifClause, fieldName: 'if_clause' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'element') return mockNode({ type: 'expression', text: element });
      if (fieldName === 'for_clause') return mockNode({ type: 'for_clause', text: forClause });
      if (fieldName === 'if_clause') return mockNode({ type: 'if_clause', text: ifClause });
      return null;
    },
    ...options
  });
}

/**
 * Create a collection of mock list comprehension nodes and a mock tree
 *
 * @param code - The code being parsed
 * @returns An object with a mock tree and an array of mock list comprehension nodes
 *
 * @example
 * // Get list comprehensions for a specific code snippet
 * const { tree, listComps } = mockListComprehensions('[i * i for (i = [1:10]) if (i % 2 == 0)]');
 */
export function mockListComprehensions(code: string): { tree: SyntaxTree, listComps: SyntaxNode[] } {
  const tree = mockTree(code);

  // Create different list comprehensions based on the code
  let listComps: SyntaxNode[] = [];

  if (code.includes('nested')) {
    // Nested list comprehension
    listComps = [
      mockListComprehension({
        element: 'i+j',
        forClause: 'for (j = [0:2])',
        ifClause: ''
      }),
      mockListComprehension({
        element: '[i+j for (j = [0:2])]',
        forClause: 'for (i = [0:2])',
        ifClause: ''
      })
    ];
  } else if (code.includes('condition')) {
    // List comprehension with condition
    listComps = [
      mockListComprehension({
        element: 'i',
        forClause: 'for (i = [1:20])',
        ifClause: 'if (i % 2 == 0)'
      })
    ];
  } else {
    // Default list comprehension
    listComps = [mockListComprehension()];
  }

  return { tree, listComps };
}

/**
 * Interface for if statement options
 */
export interface IfStatementOptions extends Partial<MockNodeOptions> {
  condition?: string;
  thenBody?: string;
  elseBody?: string;
  hasElse?: boolean;
}

/**
 * Create a mock if statement node
 *
 * @param options - Options to customize the node
 * @returns A mock if statement node
 *
 * @example
 * // Create a basic if statement
 * const ifStmt = mockIfStatement();
 *
 * // Create an if statement with custom values
 * const customIf = mockIfStatement({
 *   condition: 'radius > 10',
 *   thenBody: '{ cylinder(r=radius, h=height); }',
 *   elseBody: '{ cube([radius*2, radius*2, height]); }'
 * });
 *
 * // Create an if statement without an else clause
 * const ifWithoutElse = mockIfStatement({
 *   condition: 'x > 0',
 *   thenBody: '{ cube(); }',
 *   hasElse: false
 * });
 */
export function mockIfStatement(options: IfStatementOptions = {}): SyntaxNode {
  const condition = options.condition || 'x > 0';
  const thenBody = options.thenBody || '{ cube(); }';
  const elseBody = options.elseBody || '{ sphere(); }';
  const hasElse = options.hasElse !== undefined ? options.hasElse : true;

  const text = hasElse
    ? `if (${condition}) ${thenBody} else ${elseBody}`
    : `if (${condition}) ${thenBody}`;

  const children = hasElse
    ? [
        mockNode({ type: 'expression', text: condition, fieldName: 'condition' }),
        mockNode({ type: 'block', text: thenBody, fieldName: 'then_body' }),
        mockNode({ type: 'block', text: elseBody, fieldName: 'else_body' })
      ]
    : [
        mockNode({ type: 'expression', text: condition, fieldName: 'condition' }),
        mockNode({ type: 'block', text: thenBody, fieldName: 'then_body' })
      ];

  return mockNode({
    type: 'if_statement',
    text,
    childCount: hasElse ? 3 : 2,
    children,
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'condition') return mockNode({ type: 'expression', text: condition });
      if (fieldName === 'then_body') return mockNode({ type: 'block', text: thenBody });
      if (fieldName === 'else_body' && hasElse) return mockNode({ type: 'block', text: elseBody });
      return null;
    },
    ...options
  });
}

/**
 * Interface for object literal options
 */
export interface ObjectLiteralOptions extends Partial<MockNodeOptions> {
  properties?: string;
  propertyMap?: { [key: string]: string };
}

/**
 * Create a mock object literal node
 *
 * @param options - Options to customize the node
 * @returns A mock object literal node
 *
 * @example
 * // Create a basic object literal
 * const objLiteral = mockObjectLiteral();
 *
 * // Create an object literal with custom properties
 * const customObj = mockObjectLiteral({
 *   propertyMap: { x: '10', y: '20', z: '30' }
 * });
 */
export function mockObjectLiteral(options: ObjectLiteralOptions = {}): SyntaxNode {
  // If propertyMap is provided, use it to generate the properties string
  let properties = options.properties;
  if (!properties && options.propertyMap) {
    properties = '{ ' + Object.entries(options.propertyMap)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') + ' }';
  } else {
    properties = properties || '{ x: 10, y: 20 }';
  }

  return mockNode({
    type: 'object_literal',
    text: properties,
    childCount: 1,
    children: [
      mockNode({ type: 'object_properties', text: properties, fieldName: 'properties' })
    ],
    childForFieldName: (fieldName: string) => {
      if (fieldName === 'properties') return mockNode({ type: 'object_properties', text: properties });
      return null;
    },
    ...options
  });
}

/**
 * Interface for argument options
 */
export interface ArgumentOptions extends Partial<MockNodeOptions> {
  name?: string;
  value?: string;
  isNamed?: boolean;
}

/**
 * Create a mock argument node
 *
 * @param options - Options to customize the node
 * @returns A mock argument node
 *
 * @example
 * // Create a basic named argument
 * const arg = mockArgument();
 *
 * // Create a named argument with custom values
 * const customArg = mockArgument({
 *   name: 'height',
 *   value: '20'
 * });
 *
 * // Create a positional argument
 * const posArg = mockArgument({
 *   value: '10',
 *   isNamed: false
 * });
 */
export function mockArgument(options: ArgumentOptions = {}): SyntaxNode {
  const name = options.name || 'r';
  const value = options.value || '10';
  const isNamed = options.isNamed !== undefined ? options.isNamed : true;

  if (isNamed) {
    return mockNode({
      type: 'argument',
      text: `${name}=${value}`,
      childCount: 3,
      children: [
        mockNode({ type: 'identifier', text: name }),
        mockNode({ type: '=', text: '=' }),
        mockNode({ type: 'number', text: value })
      ],
      ...options
    });
  } else {
    return mockNode({
      type: 'argument',
      text: value,
      childCount: 1,
      children: [
        mockNode({ type: 'number', text: value })
      ],
      ...options
    });
  }
}

/**
 * Create a collection of mock arguments
 *
 * @param code - The code being parsed
 * @returns An array of mock argument nodes
 *
 * @example
 * // Get arguments for a specific code snippet
 * const args = mockArguments('sphere(r=10, $fn=36);');
 */
export function mockArguments(code: string): SyntaxNode[] {
  if (code.includes('sphere(r=10, $fn=36)')) {
    const args = [
      mockArgument({ name: 'r', value: '10' }),
      mockArgument({ name: '$fn', value: '36' })
    ];

    // Add filter method to the array
    Object.defineProperty(args, 'filter', {
      value: () => args
    });

    return args;
  } else if (code.includes('cube([10, 20, 30])')) {
    // Positional argument
    const args = [
      mockArgument({ value: '[10, 20, 30]', isNamed: false })
    ];

    // Add filter method to the array
    Object.defineProperty(args, 'filter', {
      value: () => args
    });

    return args;
  } else if (code.includes('cylinder(h=10, r1=5, r2=2)')) {
    // Multiple named arguments
    const args = [
      mockArgument({ name: 'h', value: '10' }),
      mockArgument({ name: 'r1', value: '5' }),
      mockArgument({ name: 'r2', value: '2' })
    ];

    // Add filter method to the array
    Object.defineProperty(args, 'filter', {
      value: () => args
    });

    return args;
  }

  // Default case
  return [mockArgument({ name: '$fn', value: '100' })];
}
