/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 */

module.exports = grammar({
  name: 'openscad',

  // Use 'word' to properly handle identifiers and keywords
  word: $ => $.identifier,

  // Use this for error recovery on common delimiters
  extras: $ => [
    /\s/,
    $.comment,
  ],

  // Handle conflicts
  conflicts: $ => [
    [$.expression, $.call_expression],
  ],

  rules: {
    // Program is the root rule
    source_file: $ => repeat($.statement),

    // Comments
    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    ),

    // Statements
    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      $.module_definition,
      $.function_definition,
      $.assignment_statement,
      $.module_instantiation,
      seq($.expression, ';')
    ),

    // Include and Use statements
    include_statement: $ => seq(
      'include',
      $.string,
      ';'
    ),

    use_statement: $ => seq(
      'use',
      $.string,
      ';'
    ),

    // Module definition
    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    // Function definition
    function_definition: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      '=',
      field('value', $.expression),
      ';'
    ),

    // Parameter list
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
      seq($.identifier, '=', $.expression)
    ),

    // Assignment statement
    assignment_statement: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';'
    ),

    // Blocks
    block: $ => seq(
      '{',
      repeat($.statement),
      '}'
    ),

    // Module instantiation
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

    // Arguments
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
      seq($.identifier, '=', $.expression)
    ),

    // Module children
    module_child: $ => seq(
      'children',
      optional(seq(
        '(',
        optional($.expression),
        ')'
      )),
      ';'
    ),

    // Modifiers for module instantiation
    modifier: $ => choice(
      '#', // debug
      '!', // root
      '%', // background
      '*', // disable
    ),

    // Expressions with precedence handling
    expression: $ => choice(
      $.number,
      $.boolean,
      $.string,
      $.vector_expression,
      $.range_expression,
      $.identifier,
      $.call_expression,
      $.unary_expression,
      $.binary_expression,
      $.conditional_expression,
      $.let_expression,
      $.index_expression,
      $.parenthesized_expression
    ),

    // Primitive types
    number: $ => /[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/,

    boolean: $ => choice('true', 'false'),

    string: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'")
    ),

    // Vector expressions
    vector_expression: $ => seq(
      '[',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression)),
        optional(',')
      )),
      ']'
    ),

    // Range expressions
    range_expression: $ => choice(
      seq('[', $.expression, ':', $.expression, ']'),
      seq('[', $.expression, ':', $.expression, ':', $.expression, ']')
    ),

    // Function call expressions
    call_expression: $ => seq(
      field('function', $.identifier),
      field('arguments', $.argument_list)
    ),

    // Unary expressions
    unary_expression: $ => prec.left(6, choice(
      seq('-', $.expression),
      seq('+', $.expression),
      seq('!', $.expression)
    )),

    // Binary expressions with precedence
    binary_expression: $ => choice(
      ...[
        ['*', 5], ['/', 5], ['%', 5],
        ['+', 4], ['-', 4],
        ['<', 3], ['<=', 3], ['>', 3], ['>=', 3],
        ['==', 2], ['!=', 2],
        ['&&', 1],
        ['||', 0],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $.expression),
          field('operator', operator),
          field('right', $.expression)
        ))
      )
    ),

    // Conditional expression
    conditional_expression: $ => prec.right(0, seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression)
    )),

    // Let expression
    let_expression: $ => seq(
      'let',
      '(',
      $.let_clause,
      repeat(seq(',', $.let_clause)),
      optional(','),
      ')',
      $.expression
    ),

    let_clause: $ => seq(
      $.identifier,
      '=',
      $.expression
    ),

    // Index expression
    index_expression: $ => prec.left(7, seq(
      field('array', $.expression),
      '[',
      field('index', $.expression),
      ']'
    )),

    // Parenthesized expressions
    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    // Identifier
    identifier: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  }
}); 