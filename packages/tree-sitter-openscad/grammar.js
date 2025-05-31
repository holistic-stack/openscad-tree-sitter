/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 *
 * CHANGELOG:
 * ----------
 * 2024-07-XX - Optimized grammar to remove unnecessary conflicts
 *            - Fixed precedence issues between expressions and module instantiations
 *            - Improved error recovery for various syntax errors
 *            - Enhanced support for list comprehensions and object literals
 *            - Added proper precedence handling for let expressions
 *            - Fixed conflicts between modifiers and unary expressions
 *            - Added comprehensive comments for better maintainability
 */

// Helper function for comma-separated lists
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

// Helper function for optional comma-separated lists
function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: 'openscad',

  precedences: $ => [
    ['conditional_exp_ternary'],
    ['logical_or'],
    ['logical_and'],
    ['equality'],
    ['relational'],
    ['additive'],
    ['multiplicative'],
    ['exponentiation'],
    // ['call_member_index'] moved below unary_exp
    ['unary_exp'],         // Unary operators have higher precedence
    ['call_member_index'], // Precedence for call, member, index operations
  ],

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.comment,
    $.error_sentinel, // Add error sentinel for better recovery
  ],

  /**
   * Conflicts section
   *
   * We've removed most unnecessary conflicts by using proper precedence rules.
   * The remaining conflicts are necessary for handling ambiguous syntax in OpenSCAD.
   */
  conflicts: $ => [
    // Statement vs if_statement conflict is needed because an if_statement can be a statement
    // but also needs special handling for the else clause
    [$.statement, $.if_statement],

    // if_statement self-conflict is needed for nested if-else statements
    [$.if_statement],

    // module_child conflict is needed for proper handling of the children() syntax
    [$.module_child],

    // module_instantiation conflict is needed for handling blocks after module calls
    // This also implies module_instantiation is a defined rule.
    // [$.module_instantiation], // REMOVED as unnecessary (2024-07-XX based on previous warnings)

    // range_expression conflict is needed for handling nested range expressions
    // [$.range_expression], // REMOVED as unnecessary (2024-07-XX based on previous warnings)

    // range_expression vs array_literal conflict is needed for handling ambiguous bracket syntax
    // [0:5] could be parsed as either a range_expression or array_literal
    [$.range_expression, $.array_literal],

    // primary_expression and object_field conflict is needed for handling string literals
    // that could be either a string value or an object key
    [$.primary_expression, $.object_field],

    // array_literal and list_comprehension_for conflict is needed for handling list comprehensions
     [$.array_literal, $.list_comprehension_for],

    // Declare a conflict between a module_instantiation_with_body
    // and an expression. This is the core of our issue:
    // `translate()` could be an expression, or it could be the start
    // of `translate() cube();`
    // [$._module_instantiation_with_body, $.expression], // REMOVED as unnecessary (2024-07-XX based on previous warnings)

    // Added to resolve conflict: `module_instantiation block • next_statement_token`
    // This allows `statement` to be ambiguous with itself in this specific sequence.
    // [$.statement], // REMOVED as unnecessary (2024-07-XX based on previous warnings)

    // Added to resolve: accessor_expression argument_list block • next_token
    // [$.statement, $._module_instantiation_with_body], // REMOVED as unnecessary (2024-07-XX based on previous warnings)

    // Added to resolve: for (for_header) block • next_token
    [$.statement, $.for_statement],

    // Reduced conflicts - from original grammar, may or may not be needed now
    [$.binary_expression, $.let_expression],
    [$._vector_element, $.array_literal],
    [$.module_instantiation, $.call_expression], // Critical conflict - KEEP (this is a pair)
    [$.call_expression, $.let_expression],

    // Conflicts between statement-specific expressions and regular expressions - from original
    [$.unary_expression, $.primary_expression],
    [$.binary_expression, $.primary_expression],

    // Conflict for simple literals in object_field vs primary_expression - from original
    // [$.object_field, $.primary_expression], // Duplicate of [primary_expression, object_field] above, removed
    // Conflict for binary expressions in object_field vs expression - from original
    [$.object_field, $.expression],
    // Conflict for simple literals in call_expression vs primary_expression - from original
    [$.call_expression, $.primary_expression],
    // Conflict for binary expressions in call_expression vs expression - from original
    [$.call_expression, $.expression],

    // [$._instantiation_statements, $._module_instantiation_with_body], // REMOVED as unnecessary (2024-07-XX based on previous warnings)
    [$._control_flow_statements, $.if_statement],
    [$.function_definition, $.primary_expression],
    [$.assignment_statement, $.primary_expression],
    [$.parameter_declaration, $.primary_expression],
    [$.argument, $.primary_expression],
    [$.index_expression, $.let_expression],
    [$.member_expression, $.let_expression],
    [$.conditional_expression, $.let_expression],
    [$.expression, $._operand_restricted] // KEEPING this one as per subtask hypothesis
  ],

  inline: $ => [
    $._literal,
    $._value
  ],

  rules: {
    source_file: $ => repeat($.statement),

    _literal: $ => choice(
      $.number,
      $.string,
      $.boolean,
      $.identifier,
      $.special_variable
    ),

    _value: $ => choice(
      $._literal,
      $.vector_expression,
      $.primary_expression
    ),

    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//)
    ),

    error_sentinel: $ => token(prec(-1, /[^\s]+/)),
    _error_recovery: $ => token(prec(-1, /[^;{}()\[\]\s]+/)),

    statement: $ => choice(
      $._declaration_statements,
      $._import_statements,
      $._assignment_statements,
      $._control_flow_statements,
      $._action_statements,
      prec(10, $._instantiation_statements),
      $.block
    ),

    _declaration_statements: $ => choice(
      $.module_definition,
      $.function_definition
    ),

    _import_statements: $ => choice(
      $.include_statement,
      $.use_statement
    ),

    _assignment_statements: $ => choice(
      $.assignment_statement,
      $.assign_statement
    ),

    _control_flow_statements: $ => choice(
      $.if_statement,
      $.for_statement
    ),

    _action_statements: $ => choice(
      $.echo_statement,
      $.assert_statement
    ),

    _instantiation_statements: $ => choice(
      $.module_instantiation
    ),

    _module_body_statement: $ => choice(
      $._declaration_statements,
      $._import_statements,
      $._assignment_statements,
      $._control_flow_statements,
      $._action_statements,
      alias(seq($._instantiation_statements), $.statement)
    ),

    include_statement: $ => seq(
      'include',
      $._file_path,
      optional(';')
    ),

    use_statement: $ => seq(
      'use',
      $._file_path,
      optional(';')
    ),

    _file_path: $ => choice(
      $.string,
      $.angle_bracket_string
    ),

    angle_bracket_string: $ => seq(
      '<',
      token.immediate(/[^>]*/),
      '>'
    ),

    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    function_definition: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      '=',
      field('value', $._value),
      optional(';')
    ),

    _function_binary_expression: $ => choice(
      prec.left(1, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', '||'), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.left(2, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', '&&'), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.left(3, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', choice('==', '!=')), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.left(4, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', choice('<', '<=', '>', '>=')), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.left(5, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', choice('+', '-')), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.left(6, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', choice('*', '/', '%')), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)))),
      prec.right(7, seq(field('left', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression)), field('operator', '^'), field('right', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression))))
    ),

    _function_unary_expression: $ => prec.right(8, seq(
      field('operator', choice('!', '-')),
      field('operand', choice($.number, $.string, $.boolean, $.identifier, $.special_variable, $.vector_expression))
    )),

    parameter_list: $ => seq(
      '(',
      optional($.parameter_declarations),
      choice(')', token.immediate(prec(-1, /[;{]/)))
    ),

    parameter_declarations: $ => seq(
      $.parameter_declaration,
      repeat(seq(',', $.parameter_declaration)),
      optional(',')
    ),

    parameter_declaration: $ => choice(
      $.identifier,
      $.special_variable,
      seq($.identifier, '=', $._value),
      seq($.special_variable, '=', $._value)
    ),

    assignment_statement: $ => seq(
      field('name', choice($.special_variable, $.identifier)),
      '=',
      field('value', $._value),
      optional(';')
    ),

    assign_statement: $ => prec(2, seq(
      'assign',
      '(',
      optional(commaSep1($.assign_assignment)),
      choice(')', token.immediate(prec(-1, /[{]/))),
      choice($.block, $.statement)
    )),

    assign_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      choice('}', token.immediate(prec(-1, /[^\s;]/)))
    ),

    _module_instantiation_with_body: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      choice($.block, $._module_body_statement)
    ),

    _module_instantiation_simple: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      ';'
    ),

    module_instantiation: $ => choice(
      prec(15, $._module_instantiation_with_body),
      prec(15, $._module_instantiation_simple)
    ),

    argument_list: $ => seq(
      '(',
      optional($.arguments),
      choice(')', token.immediate(prec(-1, /[;{]/)))
    ),

    arguments: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
      optional(',')
    ),

    argument: $ => choice(
      $._value,
      seq(field('name', $.special_variable), '=', field('value', $._value)),
      seq(field('name', $.identifier), '=', field('value', $._value))
    ),

    module_child: $ => seq(
      'children',
      optional(seq('(', optional($.expression), choice(')', token.immediate(prec(-1, /[;]/))))),
      optional(';')
    ),

    modifier: $ => prec(10, choice('#', '!', '%', '*')),

    if_statement: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(')', token.immediate(prec(-1, /[{]/))),
      field('consequence', choice($.block, $.statement)),
      optional(seq('else', field('alternative', choice($.if_statement, $.block, $.statement))))
    ),

    for_statement: $ => seq(
      'for',
      '(',
      field('header', $.for_header),
      choice(')', token.immediate(prec(-1, /[{]/))),
      field('body', choice($.block, $.statement))
    ),

    for_header: $ => prec(3, seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice(prec(3, $.range_expression), $.expression))
    )),

    range_expression: $ => seq(
      '[',
      choice(
        seq(field('start', $._range_value), ':', field('end', $._range_value)),
        seq(field('start', $._range_value), ':', field('step', $._range_value), ':', field('end', $._range_value))
      ),
      choice(']', token.immediate(prec(-1, /[;,){}]/)))
    ),

    _range_value: $ => choice(
      prec(5, $.number),
      prec(5, $.identifier),
      prec(5, $.special_variable),
      prec(1, $.expression)
    ),

    echo_statement: $ => prec(20, seq(
      'echo',
      '(',
      optional($.arguments),
      choice(')', token.immediate(prec(-1, /[;]/))),
      optional(';')
    )),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      choice(')', token.immediate(prec(-1, /[;]/))),
      optional(';')
    ),

    expression: $ => choice(
      $.conditional_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.primary_expression
    ),

    binary_expression: $ => choice(
      prec.left('logical_or', seq(field('left', $._operand_restricted), field('operator', alias('||', $.logical_or_operator)), field('right', $._operand_restricted))),
      prec.left('logical_and', seq(field('left', $._operand_restricted), field('operator', alias('&&', $.logical_and_operator)), field('right', $._operand_restricted))),
      prec.left('equality', seq(field('left', $._operand_restricted), field('operator', alias('==', $.equality_operator)), field('right', $._operand_restricted))),
      prec.left('equality', seq(field('left', $._operand_restricted), field('operator', alias('!=', $.inequality_operator)), field('right', $._operand_restricted))),
      prec.left('relational', seq(field('left', $._operand_restricted), field('operator', alias('<', $.less_than_operator)), field('right', $._operand_restricted))),
      prec.left('relational', seq(field('left', $._operand_restricted), field('operator', alias('<=', $.less_equal_operator)), field('right', $._operand_restricted))),
      prec.left('relational', seq(field('left', $._operand_restricted), field('operator', alias('>', $.greater_than_operator)), field('right', $._operand_restricted))),
      prec.left('relational', seq(field('left', $._operand_restricted), field('operator', alias('>=', $.greater_equal_operator)), field('right', $._operand_restricted))),
      prec.left('additive', seq(field('left', $._operand_restricted), field('operator', alias('+', $.addition_operator)), field('right', $._operand_restricted))),
      prec.left('additive', seq(field('left', $._operand_restricted), field('operator', alias('-', $.subtraction_operator)), field('right', $._operand_restricted))),
      prec.left('multiplicative', seq(field('left', $._operand_restricted), field('operator', alias('*', $.multiplication_operator)), field('right', $._operand_restricted))),
      prec.left('multiplicative', seq(field('left', $._operand_restricted), field('operator', alias('/', $.division_operator)), field('right', $._operand_restricted))),
      prec.left('multiplicative', seq(field('left', $._operand_restricted), field('operator', alias('%', $.modulo_operator)), field('right', $._operand_restricted))),
      prec.right('exponentiation', seq(field('left', $._operand_restricted), field('operator', alias('^', $.exponentiation_operator)), field('right', $._operand_restricted)))
    ),

    _operand_restricted: $ => choice(
      $.primary_expression,
      $.parenthesized_expression,
      prec('call_member_index', $.call_expression),
      prec('call_member_index', $.member_expression),
      prec('call_member_index', $.index_expression),
      $.let_expression,
      $.conditional_expression
    ),

    unary_expression: $ => choice(
      prec.right('unary_exp', seq(field('operator', alias('!', $.logical_not_operator)), field('operand', $._operand_restricted))),
      prec.right('unary_exp', seq(field('operator', alias('-', $.unary_minus_operator)), field('operand', $._operand_restricted)))
    ),

    call_expression: $ => prec('call_member_index', seq(
      field('function', choice(
        $.identifier,
        $.special_variable,
        $.member_expression,
        $.parenthesized_expression
      )),
      field('arguments', $.argument_list)
    )),

    index_expression: $ => prec.left('call_member_index', seq(
      field('array', $.expression),
      '[',
      field('index', $.expression),
      choice(']', token.immediate(prec(-1, /[;,){}]/)))
    )),

    member_expression: $ => prec.left('call_member_index', seq(
      field('object', $.expression),
      '.',
      field('property', $.identifier)
    )),

    conditional_expression: $ => prec.right('conditional_exp_ternary', seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression)
    )),

    primary_expression: $ => choice(
      $.special_variable,
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.range_expression,
      $.vector_expression,
      $.array_literal,
      $.list_comprehension,
      $.object_literal
    ),

    vector_expression: $ => prec(10, seq('[',
      optional(commaSep1($._vector_element)),
      choice(']', token.immediate(prec(-1, /[;,){}]/)))
    )),

    _vector_element: $ => choice(
      prec(5, $.number),
      prec(5, $.string),
      prec(5, $.boolean),
      prec(5, $.identifier),
      prec(5, $.special_variable),
      prec(4, $.vector_expression),
      prec(1, $.expression)
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      choice(')', token.immediate(prec(-1, /[;,{}\[]/)))
    ),

    array_literal: $ => seq('[',
      optional(commaSep1($.expression)),
      choice(']', token.immediate(prec(-1, /[;,){}]/)))
    ),

    list_comprehension: $ => prec(3, seq(
      '[',
      choice(
        seq(field('element', $.expression), field('for_clause', $.list_comprehension_for), optional(field('if_clause', $.list_comprehension_if))),
        seq(field('for_clause', $.list_comprehension_for_block), optional(field('if_clause', $.list_comprehension_if_block)), field('element', $.expression))
      ),
      choice(']', token.immediate(prec(-1, /[;,){}]/)))
    )),

    list_comprehension_for: $ => prec(1, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(')', token.immediate(prec(-1, /[;,\[\]{}]/)))
    )),

    list_comprehension_if: $ => prec(1, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(')', token.immediate(prec(-1, /[;,\[\]{}]/)))
    )),

    list_comprehension_for_block: $ => prec(4, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(')', token.immediate(prec(-1, /[;,\[\]{}]/)))
    )),

    list_comprehension_if_block: $ => prec(4, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(')', token.immediate(prec(-1, /[;,\[\]{}]/)))
    )),

    object_literal: $ => prec(1, seq(
      '{',
      optional(seq(commaSep1($.object_field), optional(','))),
      choice('}', token.immediate(prec(-1, /[;,)\[]/)))
    )),

    object_field: $ => seq(
      field('key', $.string),
      ':',
      field('value', choice(
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        prec(1, $.expression)
      ))
    ),

    let_expression: $ => prec(6, seq(
      'let',
      '(',
      commaSep1($.let_assignment),
      choice(')', token.immediate(prec(-1, /[;,{}\[]/))),
      field('body', $.expression)
    )),

    let_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    special_variable: $ => token(/\$[\p{L}_][\p{L}\p{N}_]*/u),

    string: $ => choice(
      prec(2, seq('"', optional(token.immediate(/(?:[^"\\]|\\.)*/)), '"')),
      prec(2, seq('\'', optional(token.immediate(/(?:[^'\\]|\\.)*/)), '\'')),
      prec(1, seq('"', token.immediate(/(?:[^"\\]|\\.)*/)))
    ),

    number: $ => {
      const decimal = /[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/;
      const integer = /[0-9]+([eE][-+]?[0-9]+)?/;
      return token(choice(decimal, integer));
    },

    boolean: $ => choice('true', 'false'),
    undef: $ => 'undef',
    identifier: $ => /[\p{L}_][\p{L}\p{N}_]*/u,

    logical_or_operator: $ => '||',
    logical_and_operator: $ => '&&',
    equality_operator: $ => '==',
    inequality_operator: $ => '!=',
    less_than_operator: $ => '<',
    less_equal_operator: $ => '<=',
    greater_than_operator: $ => '>',
    greater_equal_operator: $ => '>=',
    addition_operator: $ => '+',
    subtraction_operator: $ => '-',
    multiplication_operator: $ => '*',
    division_operator: $ => '/',
    modulo_operator: $ => '%',
    exponentiation_operator: $ => '^',
    logical_not_operator: $ => '!',
    unary_minus_operator: $ => '-'
  }
});

function sepBy(delimiter, rule) {
  return optional(sepBy1(delimiter, rule));
}

function sepBy1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)));
}
