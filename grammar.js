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
    [$.module_instantiation, $.call_expression],
    [$.if_statement, $.module_instantiation], // For else-if chains
    [$.for_statement, $.list_comprehension], // For list comprehensions
    [$.statement, $.if_statement], // For nested if-else statements
    [$.if_statement], // Self-conflict for nested if-else
    [$.expression, $.list_comprehension_for], // For list comprehension for loop
    [$.expression, $.index_expression], // For array indexing
    [$.range_expression, $.expression], // For range expressions
    [$.index_expression, $.array_literal], // For multidimensional arrays
    [$.member_expression, $.expression], // For member access
  ],

  rules: {
    // Program is the root rule
    source_file: $ => repeat($.statement),

    // Comments
    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//) // Fixed to handle nested comments correctly
    ),

    // Statements
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

    // Include and Use statements
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
      $.special_variable,
      seq($.identifier, '=', $.expression),
      seq($.special_variable, '=', $.expression)
    ),

    // Assignment statement
    assignment_statement: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
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
      seq($.identifier, '=', $.expression),
      seq($.special_variable, '=', $.expression)
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

    // Control Structures
    if_statement: $ => prec.right(0, seq(
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
          $.if_statement, // else if
          $.block,
          $.statement
        )
      ))
    )),

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
      field('range', choice($.expression, $.range_expression))
    ),

    // Range expression (for for loops)
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

    // Echo and Assert
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

    // Expression
    expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.conditional_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.let_expression,
      $.list_comprehension,
      $.special_variable,
      $.parenthesized_expression,
      $.vector_expression,
      $.array_literal,
      $.object_literal,
      $.string,
      $.number,
      $.boolean,
      $.undef,
      $.identifier
    ),

    // Parenthesized expression
    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    // Binary expressions
    binary_expression: $ => {
      const operators = [
        ['||', 1], // logical OR
        ['&&', 2], // logical AND
        [['<', '<=', '>', '>=', '==', '!='], 3], // comparison
        [['|'], 4], // bitwise OR
        [['~'], 5], // bitwise XOR
        [['&'], 6], // bitwise AND
        [['<<', '>>'], 7], // bit shift
        [['+', '-'], 8], // addition/subtraction
        [['*', '/', '%'], 9], // multiplication/division/modulo
        [['^'], 10], // exponentiation
      ];

      return buildBinaryExpression(operators, 0);

      function buildBinaryExpression(operatorGroups, index) {
        if (index === operatorGroups.length) {
          return $.expression;
        }

        const [operators, precedence] = operatorGroups[index];
        const higherPrecedence = buildBinaryExpression(operatorGroups, index + 1);

        return prec.left(precedence, seq(
          field('left', $.expression),
          field('operator', choice(...[].concat(operators).map(operator => token(operator)))),
          field('right', higherPrecedence)
        ));
      }
    },

    // Unary expressions
    unary_expression: $ => prec(11, seq(
      field('operator', choice(
        '+', '-', '!', '~'
      )),
      field('argument', $.expression)
    )),

    // Conditional expression (ternary)
    conditional_expression: $ => prec.right(0, seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression)
    )),

    // Call expression (function calls)
    call_expression: $ => seq(
      field('function', $.identifier),
      field('arguments', $.argument_list)
    ),

    // Index expression (array indexing)
    index_expression: $ => prec.left(12, seq(
      field('array', $.expression),
      '[',
      field('index', choice(
        $.expression,
        $.range_expression
      )),
      ']'
    )),

    // Member access expression (e.g., v.x, p.y)
    member_expression: $ => prec.left(12, seq(
      field('object', $.expression),
      '.',
      field('property', $.identifier)
    )),

    // Let expression
    let_expression: $ => seq(
      'let',
      '(',
      optional($.let_assignments),
      ')',
      $.expression
    ),

    let_assignments: $ => seq(
      $.let_assignment,
      repeat(seq(',', $.let_assignment)),
      optional(',')
    ),

    let_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    // List comprehension
    list_comprehension: $ => seq(
      '[',
      field('expr', $.expression),
      'for',
      '(',
      $.list_comprehension_for,
      ')',
      optional(seq(
        'if',
        '(',
        field('condition', $.expression),
        ')'
      )),
      ']'
    ),

    list_comprehension_for: $ => seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.expression, $.range_expression))
    ),

    // Data types
    vector_expression: $ => seq(
      '[',
      optional(seq(
        commaSep1($.expression),
        optional(',')
      )),
      ']'
    ),

    array_literal: $ => seq(
      '[',
      optional(seq(
        commaSep1(choice($.expression, $.array_literal)),
        optional(',')
      )),
      ']'
    ),

    object_literal: $ => seq(
      '{',
      optional(seq(
        commaSep1($.object_field),
        optional(',')
      )),
      '}'
    ),

    object_field: $ => seq(
      field('key', $.string),
      ':',
      field('value', $.expression)
    ),

    // Special variables - updated to use regex pattern
    special_variable: $ => token(/\$[a-zA-Z_][a-zA-Z0-9_]*/),

    // Primitives
    string: $ => choice(
      seq('"', optional(/[^"]*/), '"'),
      seq("'", optional(/[^']*/), "'")
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

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    operator: $ => choice(
      '+', '-', '*', '/', '%', '^',
      '&&', '||', '!',
      '==', '!=', '<', '<=', '>', '>=',
      '&', '|', '~', '<<', '>>'
    ),
  }
});

// Helper functions
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
} 