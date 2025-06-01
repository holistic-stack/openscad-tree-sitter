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
    [$.if_statement],
    [$.statement],
    [$.conditional_expression, $.range_expression],
    [$.index_expression, $.let_expression],
    [$.member_expression, $.let_expression],
    [$.range_expression],
    [$._value, $.primary_expression],
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
        field('name', $.identifier),
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
        prec(2, $.module_instantiation_simple),
        prec(2, $.module_instantiation_with_body)
      ),

    module_instantiation_simple: ($) =>
      seq(
        optional($.modifier),
        field('name', $.identifier),
        field('arguments', $.argument_list),
        ';'
      ),

    module_instantiation_with_body: ($) =>
      seq(
        optional($.modifier),
        field('name', $.identifier),
        field('arguments', $.argument_list),
        $.block
      ),

    modifier: ($) => choice('#', '!', '%', '*'),

    argument_list: ($) => seq('(', optional($.arguments), ')'),

    argument: ($) =>
      choice(
        $._value,
        seq(field('name', $.identifier), '=', field('value', $._value))
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
          field('consequence', $.statement),
          optional(
            seq(
              'else',
              field('alternative', choice($.if_statement, $.statement))
            )
          )
        )
      ),

    for_statement: ($) =>
      prec(
        1,
        seq(
          'for',
          '(',
          field('iterator', $.identifier),
          '=',
          field('range', $._value),
          ')',
          field('body', $.statement)
        )
      ),

    // Action statements
    echo_statement: ($) =>
      seq('echo', '(', optional($.arguments), ')', optional(';')),

    assert_statement: ($) =>
      seq('assert', '(', $.arguments, ')', optional(';')),

    // Arguments list for function calls
    arguments: ($) => commaSep1($.argument),

    // Primary expressions for binary expression operands (only basic literals)
    primary_expression: ($) =>
      choice(
        $.identifier,
        $.number,
        $.string,
        $.boolean,
        $.undef,
        $.vector_expression
      ),

    // Unified value rule that can be any expression or literal
    _value: ($) =>
      choice(
        $.identifier,
        $.number,
        $.string,
        $.boolean,
        $.undef,
        $.vector_expression,
        $.binary_expression,
        $.unary_expression,
        $.conditional_expression,
        $.call_expression,
        $.index_expression,
        $.member_expression,
        $.parenthesized_expression,
        $.let_expression,
        $.range_expression
      ),

    binary_expression: ($) =>
      choice(
        // Logical operators
        prec.left(
          1,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('||', $.logical_or_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          2,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('&&', $.logical_and_operator)),
            field('right', $.primary_expression)
          )
        ),

        // Equality operators
        prec.left(
          3,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('==', $.equality_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          3,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('!=', $.inequality_operator)),
            field('right', $.primary_expression)
          )
        ),

        // Relational operators
        prec.left(
          4,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('<', $.less_than_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('<=', $.less_equal_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('>', $.greater_than_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          4,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('>=', $.greater_equal_operator)),
            field('right', $.primary_expression)
          )
        ),

        // Additive operators
        prec.left(
          5,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('+', $.addition_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          5,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('-', $.subtraction_operator)),
            field('right', $.primary_expression)
          )
        ),

        // Multiplicative operators
        prec.left(
          6,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('*', $.multiplication_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          6,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('/', $.division_operator)),
            field('right', $.primary_expression)
          )
        ),
        prec.left(
          6,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('%', $.modulo_operator)),
            field('right', $.primary_expression)
          )
        ),

        // Exponentiation
        prec.right(
          7,
          seq(
            field('left', $.primary_expression),
            field('operator', alias('^', $.exponentiation_operator)),
            field('right', $.primary_expression)
          )
        )
      ),

    unary_expression: ($) =>
      choice(
        prec.right(
          8,
          seq(
            field('operator', alias('!', $.logical_not_operator)),
            field('operand', $.primary_expression)
          )
        ),
        prec.right(
          8,
          seq(
            field('operator', alias('-', $.unary_minus_operator)),
            field('operand', $.primary_expression)
          )
        )
      ),

    conditional_expression: ($) =>
      prec.right(
        10,
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
      prec.right(
        15,
        seq(
          'let',
          '(',
          commaSep1($.let_assignment),
          ')',
          field('body', $._value)
        )
      ),

    let_assignment: ($) =>
      seq(field('name', $.identifier), '=', field('value', $._value)),

    range_expression: ($) =>
      prec.left(
        5,
        seq(
          field('start', $._value),
          ':',
          field('end', $._value),
          optional(seq(':', field('step', $._value)))
        )
      ),

    vector_expression: ($) => seq('[', commaSep($._value), ']'),

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

    comment: ($) => choice(seq('//', /.*/), seq('/*', /([^*]|\*[^\/])*/, '*/')),
  },
});
