/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 */

module.exports = grammar({
  name: 'openscad',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.comment,
  ],

  conflicts: $ => [
    [$.module_instantiation, $.primary_expression],
    [$.statement, $.if_statement],
    [$.modifier, $.unary_expression],
    [$.module_instantiation, $.call_expression],
    [$.for_header, $.array_literal],
    [$.if_statement],
    [$.list_comprehension_for, $.list_comprehension_for_block],
    [$.list_comprehension_if, $.list_comprehension_if_block],
    [$.array_literal, $.list_comprehension],
  ],

  rules: {
    source_file: $ => repeat($.statement),

    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//)
    ),

    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      $.module_definition,
      $.function_definition,
      $.assignment_statement,
      $.module_instantiation,
      $.if_statement,
      $.for_statement,
      $.echo_statement,
      $.assert_statement,
      seq($.expression, ';')
    ),

    include_statement: $ => seq(
      'include',
      $.string,
      optional(';')
    ),

    use_statement: $ => seq(
      'use',
      $.string,
      optional(';')
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
      field('value', $.expression),
      ';'
    ),

    parameter_list: $ => seq(
      '(',
      optional($.parameter_declarations),
      ')'
    ),

    parameter_declarations: $ => seq(
      $.parameter_declaration,
      repeat(seq(',', $.parameter_declaration)),
      optional(',')
    ),

    parameter_declaration: $ => choice(
      $.identifier,
      $.special_variable,
      seq($.identifier, '=', $.expression),
      seq($.special_variable, '=', $.expression)
    ),

    assignment_statement: $ => seq(
      field('name', choice($.special_variable, $.identifier)),
      '=',
      field('value', $.expression),
      ';'
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      '}'
    ),

    module_instantiation: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      choice(
        ';',
        $.block,
        $.module_child
      )
    ),

    argument_list: $ => seq(
      '(',
      optional($.arguments),
      ')'
    ),

    arguments: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
      optional(',')
    ),

    argument: $ => choice(
      $.expression,
      seq($.special_variable, '=', $.expression),
      seq($.identifier, '=', $.expression)
    ),

    module_child: $ => seq(
      'children',
      optional(seq(
        '(',
        optional($.expression),
        ')'
      )),
      ';'
    ),

    modifier: $ => choice(
      '#',
      '!',
      '%',
      '*',
    ),

    if_statement: $ => seq(
      'if',
      '(',
      $.expression,
      ')',
      choice(
        $.block,
        $.statement
      ),
      optional(seq(
        'else',
        choice(
          $.if_statement,
          $.block,
          $.statement
        )
      ))
    ),

    for_statement: $ => seq(
      'for',
      '(',
      $.for_header,
      ')',
      choice(
        $.block,
        $.statement
      )
    ),

    for_header: $ => seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      choice($.range_expression, $.expression)
    ),

    range_expression: $ => choice(
      seq(
        field('start', $.expression),
        ':',
        field('end', $.expression)
      ),
      seq(
        field('start', $.expression),
        ':',
        field('step', $.expression),
        ':',
        field('end', $.expression)
      )
    ),

    echo_statement: $ => seq(
      'echo',
      '(',
      optional($.arguments),
      ')',
      ';'
    ),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      ')',
      ';'
    ),

    expression: $ => $.conditional_expression,

    conditional_expression: $ => choice(
      seq(
        field('condition', $.logical_or_expression),
        '?',
        field('consequence', $.expression),
        ':',
        field('alternative', $.expression)
      ),
      $.logical_or_expression
    ),

    logical_or_expression: $ => choice(
      seq(
        field('left', $.logical_or_expression),
        '||',
        field('right', $.logical_and_expression)
      ),
      $.logical_and_expression
    ),

    logical_and_expression: $ => choice(
      seq(
        field('left', $.logical_and_expression),
        '&&',
        field('right', $.equality_expression)
      ),
      $.equality_expression
    ),

    equality_expression: $ => choice(
      seq(
        field('left', $.equality_expression),
        field('operator', choice('==', '!=')),
        field('right', $.relational_expression)
      ),
      $.relational_expression
    ),

    relational_expression: $ => choice(
      seq(
        field('left', $.relational_expression),
        field('operator', choice('<', '<=', '>', '>=')),
        field('right', $.additive_expression)
      ),
      $.additive_expression
    ),

    additive_expression: $ => choice(
      seq(
        field('left', $.additive_expression),
        field('operator', choice('+', '-')),
        field('right', $.multiplicative_expression)
      ),
      $.multiplicative_expression
    ),

    multiplicative_expression: $ => choice(
      seq(
        field('left', $.multiplicative_expression),
        field('operator', choice('*', '/', '%')),
        field('right', $.exponentiation_expression)
      ),
      $.exponentiation_expression
    ),

    exponentiation_expression: $ => choice(
      seq(
        field('left', $.unary_expression),
        field('operator', '^'),
        field('right', $.exponentiation_expression)
      ),
      $.unary_expression
    ),

    unary_expression: $ => choice(
      seq(
        field('operator', choice('!', '-')),
        field('operand', $.primary_expression)
      ),
      $.primary_expression
    ),

    primary_expression: $ => choice(
      $.parenthesized_expression,
      $.special_variable,
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.array_literal,
      $.list_comprehension,
      $.call_expression
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    call_expression: $ => seq(
      field('function', $.identifier),
      field('arguments', $.argument_list)
    ),

    array_literal: $ => prec(1, choice(
      $.range_expression,
      seq('[', optional(commaSep1($.expression)), ']')
    )),

    // List comprehension - [expr for (var=list) if (cond)]
    list_comprehension: $ => prec(2, seq(
      '[',
      choice(
        // Traditional syntax: [expr for (var=list) if (cond)]
        seq(
          field('element', $.expression),
          field('for_clause', $.list_comprehension_for),
          optional(field('if_clause', $.list_comprehension_if))
        ),
        // OpenSCAD syntax: [for (var=list) if (cond) expr]
        seq(
          field('for_clause', $.list_comprehension_for_block),
          optional(field('if_clause', $.list_comprehension_if_block)),
          field('element', $.expression)
        )
      ),
      ']'
    )),

    // Traditional syntax: for (var=list)
    list_comprehension_for: $ => seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      ')'
    ),

    // Traditional syntax: if (cond)
    list_comprehension_if: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')'
    ),

    // OpenSCAD syntax: for (var=list)
    list_comprehension_for_block: $ => prec(3, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      ')'
    )),

    // OpenSCAD syntax: if (cond)
    list_comprehension_if_block: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')'
    ),

    range_expression: $ => choice(
      seq('[', $.expression, ':', $.expression, ']'),
      seq('[', $.expression, ':', $.expression, ':', $.expression, ']')
    ),

    special_variable: $ => token(/\$[\p{L}_][\p{L}\p{N}_]*/u),

    string: $ => choice(
      seq('"', optional(token.immediate(/[^\"]*/)), '"'),
      seq("'", optional(token.immediate(/[^']*/)), "'")
    ),

    number: $ => {
      const decimal = /-?[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/;
      const integer = /-?[0-9]+([eE][-+]?[0-9]+)?/;
      return token(choice(
        decimal,
        integer
      ));
    },

    boolean: $ => choice(
      'true',
      'false'
    ),

    undef: $ => 'undef',

    identifier: $ => /[\p{L}_][\p{L}\p{N}_]*/u,
  }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
