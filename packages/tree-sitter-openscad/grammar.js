/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 *
 * CHANGELOG:
 * ----------
 * 2025-05-XX - Fixed grammar generation panic issues
 *            - Created working minimal grammar as foundation
 *            - Incrementally building features without panic-inducing patterns
 *            - Avoided undefined externals and complex error recovery
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

  word: ($) => $.identifier,
  extras: ($) => [/\s/, $.comment],

  conflicts: ($) => [
    [$.module_instantiation, $.call_expression],
    [$.conditional_expression, $.range_expression],
    [$.index_expression, $.let_expression],
    [$.member_expression, $.let_expression],
    [$.range_expression],
    [$.range_expression, $.vector_expression],
    [$.conditional_expression, $.let_expression],
    [$.vector_expression, $.list_comprehension],
    [$.range_expression_non_recursive],
  ],

  rules: {
    source_file: ($) => repeat($.statement),

    statement: ($) =>
      choice(
        $.assignment_statement,
        $.module_definition,
        $.function_definition,
        $.module_instantiation,
        $.include_statement,
        $.use_statement,
        $.if_statement,
        $.for_statement,
        $.echo_statement,
        $.assert_statement,
        $.block
      ),

    // Basic statements
    assignment_statement: ($) =>
      seq(
        field('name', choice($.identifier, $.special_variable)),
        '=',
        field('value', $._value),
        optional(';')
      ),

    module_definition: ($) =>
      seq(
        'module',
        field('name', $.identifier),
        field('parameters', $.parameter_list),
        field('body', $.block)
      ),

    function_definition: ($) =>
      seq(
        'function',
        field('name', $.identifier),
        field('parameters', $.parameter_list),
        '=',
        field('value', $._value),
        optional(';')
      ),

    parameter_list: ($) => seq('(', optional($.parameter_declarations), ')'),

    parameter_declarations: ($) => commaSep1($.parameter_declaration),

    parameter_declaration: ($) =>
      choice($.identifier, seq($.identifier, '=', $._value)),

    block: ($) => seq('{', repeat($.statement), '}'),

    // Module instantiation with precedence
    module_instantiation: ($) =>
      choice(
        prec(
          2,
          seq(
            optional($.modifier),
            field('name', $.identifier),
            field('arguments', $.argument_list),
            ';'
          )
        ),
        prec(
          2,
          seq(
            optional($.modifier),
            field('name', $.identifier),
            field('arguments', $.argument_list),
            $.block
          )
        ),
        prec(
          1,
          seq(
            optional($.modifier),
            field('name', $.identifier),
            field('arguments', $.argument_list),
            $.statement
          )
        )
      ),

    modifier: ($) => choice('#', '!', '%', '*'),

    argument_list: ($) => seq('(', optional($.arguments), ')'),

    argument: ($) =>
      choice(
        $._value,
        seq(field('name', $.identifier), '=', field('value', $._value)),
        seq(field('name', $.special_variable), '=', field('value', $._value))
      ),

    // Import statements
    include_statement: ($) =>
      seq('include', choice($.string, $.angle_bracket_string), optional(';')),
    use_statement: ($) =>
      seq('use', choice($.string, $.angle_bracket_string), optional(';')),

    // Control flow
    if_statement: ($) =>
      prec.right(
        1,
        seq(
          'if',
          '(',
          field('condition', $._value),
          ')',
          field('consequence', choice($.block, $.statement)),
          optional(
            seq(
              'else',
              field('alternative', choice($.if_statement, $.block, $.statement))
            )
          )
        )
      ),

    for_statement: ($) =>
      prec(1, seq(
        'for',
        '(',
        field('iterator', $.identifier),
        '=',
        field('range', $._value),
        ')',
        choice($.block, $.statement)
      )),

    // Action statements
    echo_statement: ($) =>
      seq('echo', '(', optional($.arguments), ')', optional(';')),

    assert_statement: ($) =>
      choice(
        seq(
          'assert',
          '(',
          field('condition', $._value),
          ',',
          field('message', $._value),
          ')',
          optional(';')
        ),
        seq(
          'assert',
          '(',
          field('condition', $._value),
          ')',
          optional(';')
        )
      ),

    // Arguments list for function calls
    arguments: ($) => commaSep1($.argument),

    // Primary expressions for the most basic literals and identifiers
    primary_expression: ($) =>
      choice(
        $.identifier,
        $.special_variable,
        $.number,
        $.string,
        $.boolean,
        $.undef,
        $.vector_expression,
        $.parenthesized_expression
      ),

    // Expression rule that includes all expression types
    expression: ($) =>
      choice(
        $.primary_expression,
        $.binary_expression,
        $.unary_expression,
        $.conditional_expression,
        $.call_expression,
        $.index_expression,
        $.member_expression,
        $.let_expression,
        $.range_expression,
        $.list_comprehension
      ),

    // Unified value rule with direct access strategy (no expression wrapping)
    _value: ($) => choice(
      // Literals - direct access
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.identifier,
      $.special_variable,

      // Complex expressions - direct access
      $.vector_expression,
      $.binary_expression,
      $.unary_expression,
      $.conditional_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.let_expression,
      $.range_expression,
      $.list_comprehension,
      $.parenthesized_expression
    ),

    // Non-recursive value rule for list comprehension expressions
    // Completely separate expression rules to prevent ANY recursion back to list_comprehension
    _non_list_comprehension_value: ($) => choice(
      // Literals - direct access
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.identifier,
      $.special_variable,

      // Non-recursive expressions - use separate rules that don't reference $._value
      $.vector_expression_non_recursive,
      $.binary_expression_non_recursive,
      $.unary_expression_non_recursive,
      $.conditional_expression_non_recursive,
      $.call_expression_non_recursive,
      $.index_expression_non_recursive,
      $.member_expression_non_recursive,
      $.range_expression_non_recursive,
      $.parenthesized_expression_non_recursive
    ),

    binary_expression: ($) =>
      choice(
        // Logical operators
        prec.left(
          1,
          seq(
            field('left', $._value),
            field('operator', alias('||', $.logical_or_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          2,
          seq(
            field('left', $._value),
            field('operator', alias('&&', $.logical_and_operator)),
            field('right', $._value)
          )
        ),

        // Equality operators
        prec.left(
          3,
          seq(
            field('left', $._value),
            field('operator', alias('==', $.equality_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          3,
          seq(
            field('left', $._value),
            field('operator', alias('!=', $.inequality_operator)),
            field('right', $._value)
          )
        ),

        // Relational operators
        prec.left(
          4,
          seq(
            field('left', $._value),
            field('operator', alias('<', $.less_than_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $._value),
            field('operator', alias('<=', $.less_equal_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $._value),
            field('operator', alias('>', $.greater_than_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $._value),
            field('operator', alias('>=', $.greater_equal_operator)),
            field('right', $._value)
          )
        ),

        // Additive operators
        prec.left(
          5,
          seq(
            field('left', $._value),
            field('operator', alias('+', $.addition_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          5,
          seq(
            field('left', $._value),
            field('operator', alias('-', $.subtraction_operator)),
            field('right', $._value)
          )
        ),

        // Multiplicative operators
        prec.left(
          6,
          seq(
            field('left', $._value),
            field('operator', alias('*', $.multiplication_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          6,
          seq(
            field('left', $._value),
            field('operator', alias('/', $.division_operator)),
            field('right', $._value)
          )
        ),
        prec.left(
          6,
          seq(
            field('left', $._value),
            field('operator', alias('%', $.modulo_operator)),
            field('right', $._value)
          )
        ),

        // Exponentiation
        prec.right(
          7,
          seq(
            field('left', $._value),
            field('operator', alias('^', $.exponentiation_operator)),
            field('right', $._value)
          )
        )
      ),

    unary_expression: ($) =>
      choice(
        prec.right(
          8,
          seq(
            field('operator', alias('!', $.logical_not_operator)),
            field('operand', $._value)
          )
        ),
        prec.right(
          8,
          seq(
            field('operator', alias('-', $.unary_minus_operator)),
            field('operand', $._value)
          )
        )
      ),

    conditional_expression: ($) =>
      prec.right(
        0,
        seq(
          field('condition', $._value),
          '?',
          field('consequence', $._value),
          ':',
          field('alternative', $._value)
        )
      ),

    call_expression: ($) =>
      prec.left(
        12,
        seq(
          field('function', $.identifier),
          field('arguments', $.argument_list)
        )
      ),

    index_expression: ($) =>
      prec.left(
        12,
        seq(field('array', $._value), '[', field('index', $._value), ']')
      ),

    member_expression: ($) =>
      prec.left(
        12,
        seq(field('object', $._value), '.', field('property', $.identifier))
      ),

    parenthesized_expression: ($) => seq('(', $._value, ')'),

    let_expression: ($) =>
      prec.dynamic(
        100,
        seq('let', '(', commaSep1($.let_clause), ')', $._value)
      ),

    let_clause: ($) =>
      seq($.identifier, '=', $._value),

    range_expression: ($) =>
      choice(
        // Bracketed range expressions [start:end] or [start:step:end] - higher precedence
        prec(10, seq(
          '[',
          field('start', $._value),
          ':',
          field('end', $._value),
          ']'
        )),
        prec(10, seq(
          '[',
          field('start', $._value),
          ':',
          field('step', $._value),
          ':',
          field('end', $._value),
          ']'
        )),
        // Bare range expressions (for use in other contexts)
        prec.left(5, seq(
          field('start', $._value),
          ':',
          field('end', $._value)
        )),
        prec.left(5, seq(
          field('start', $._value),
          ':',
          field('step', $._value),
          ':',
          field('end', $._value)
        ))
      ),

    vector_expression: ($) => prec(1, seq('[', commaSep($._value), ']')),

    // List comprehension with correct syntax order
    // Syntax: [for (i = range) expr] or [for (i = range) if (condition) expr]
    // Uses non-recursive value rule to prevent recursion in expr field
    list_comprehension: ($) =>
      prec.dynamic(100, seq(
        '[',
        $.list_comprehension_for,
        optional(seq('if', '(', field('condition', $._non_list_comprehension_value), ')')),
        field('expr', $._non_list_comprehension_value),
        ']'
      )),

    list_comprehension_for: ($) =>
      seq(
        'for',
        '(',
        field('iterator', $.identifier),
        '=',
        field('range', $._non_list_comprehension_value),
        ')'
      ),





    // Literals
    identifier: ($) => /[A-Za-z_][A-Za-z0-9_]*/,

    number: ($) => {
      const decimal = /[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/;
      const integer = /[0-9]+([eE][-+]?[0-9]+)?/;
      return token(choice(decimal, integer));
    },

    string: ($) =>
      choice(
        seq('"', optional(/[^"]*/), '"'),
        seq("'", optional(/[^']*/), "'")
      ),

    angle_bracket_string: ($) => seq('<', /[^>]*/, '>'),

    boolean: ($) => choice('true', 'false'),

    undef: ($) => 'undef',

    special_variable: ($) => /\$[A-Za-z_][A-Za-z0-9_]*/,

    comment: ($) => choice(seq('//', /.*/), seq('/*', /([^*]|\*[^\/])*/, '*/')),

    // Non-recursive expression rules for list comprehensions
    // These rules use _non_list_comprehension_value instead of $._value to prevent recursion

    vector_expression_non_recursive: ($) =>
      prec(1, seq('[', commaSep($._non_list_comprehension_value), ']')),

    binary_expression_non_recursive: ($) =>
      choice(
        // Logical operators
        prec.left(1, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('||', $.logical_or_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(2, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('&&', $.logical_and_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        // Equality operators
        prec.left(3, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('==', $.equality_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(3, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('!=', $.inequality_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        // Relational operators
        prec.left(4, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('<', $.less_than_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(4, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('<=', $.less_equal_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(4, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('>', $.greater_than_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(4, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('>=', $.greater_equal_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        // Additive operators
        prec.left(5, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('+', $.addition_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(5, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('-', $.subtraction_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        // Multiplicative operators
        prec.left(6, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('*', $.multiplication_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(6, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('/', $.division_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        prec.left(6, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('%', $.modulo_operator)),
          field('right', $._non_list_comprehension_value)
        )),
        // Exponentiation
        prec.right(7, seq(
          field('left', $._non_list_comprehension_value),
          field('operator', alias('^', $.exponentiation_operator)),
          field('right', $._non_list_comprehension_value)
        ))
      ),

    unary_expression_non_recursive: ($) =>
      choice(
        prec.right(8, seq(
          field('operator', alias('!', $.logical_not_operator)),
          field('operand', $._non_list_comprehension_value)
        )),
        prec.right(8, seq(
          field('operator', alias('-', $.unary_minus_operator)),
          field('operand', $._non_list_comprehension_value)
        ))
      ),

    conditional_expression_non_recursive: ($) =>
      prec.right(0, seq(
        field('condition', $._non_list_comprehension_value),
        '?',
        field('consequence', $._non_list_comprehension_value),
        ':',
        field('alternative', $._non_list_comprehension_value)
      )),

    call_expression_non_recursive: ($) =>
      prec.left(12, seq(
        field('function', $.identifier),
        field('arguments', $.argument_list)
      )),

    index_expression_non_recursive: ($) =>
      prec.left(12, seq(
        field('array', $._non_list_comprehension_value),
        '[',
        field('index', $._non_list_comprehension_value),
        ']'
      )),

    member_expression_non_recursive: ($) =>
      prec.left(12, seq(
        field('object', $._non_list_comprehension_value),
        '.',
        field('property', $.identifier)
      )),

    range_expression_non_recursive: ($) =>
      choice(
        // Bracketed range expressions [start:end] or [start:step:end] - higher precedence
        prec(10, seq(
          '[',
          field('start', $._non_list_comprehension_value),
          ':',
          field('end', $._non_list_comprehension_value),
          ']'
        )),
        prec(10, seq(
          '[',
          field('start', $._non_list_comprehension_value),
          ':',
          field('step', $._non_list_comprehension_value),
          ':',
          field('end', $._non_list_comprehension_value),
          ']'
        )),
        // Bare range expressions (for use in other contexts)
        prec.left(5, seq(
          field('start', $._non_list_comprehension_value),
          ':',
          field('end', $._non_list_comprehension_value)
        )),
        prec.left(5, seq(
          field('start', $._non_list_comprehension_value),
          ':',
          field('step', $._non_list_comprehension_value),
          ':',
          field('end', $._non_list_comprehension_value)
        ))
      ),

    parenthesized_expression_non_recursive: ($) =>
      seq('(', $._non_list_comprehension_value, ')'),
  },
});
