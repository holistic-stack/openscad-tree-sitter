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
    [$.statement, $.if_statement], // For nested if-else statements
    [$.if_statement], // Self-conflict for nested if-else
    [$.index_expression, $.expression],
    [$.range_expression, $.expression], // For range expressions
    [$.index_expression, $.array_literal], // For multidimensional arrays
    [$.member_expression, $.expression],
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
    expression: $ => $.conditional_expression,

    primary_expression: $ => choice(
      $.parenthesized_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.identifier,
      $.special_variable,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.array_literal,
      $.list_comprehension,
      $.range_expression
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    // Operator Precedence Rules (highest to lowest)
    // Level 2: Unary Operators (right-associative)
    unary_expression: $ => prec.right(2, choice(
      seq(choice('!', '-'), $.exponentiation_expression),
      $.primary_expression
    )),

    // Level 3: Exponentiation (right-associative) - if we support ^
    // Reverting diagnostic change back to right-associative
    exponentiation_expression: $ => prec.right(3, choice(
      seq(field('left', $.unary_expression), '^', field('right', $.exponentiation_expression)),
      $.unary_expression
    )),

    // Level 4: Multiplicative (left-associative)
    multiplicative_expression: $ => prec.left(4, choice(
      seq(field('left', $.exponentiation_expression), choice('*', '/', '%'), field('right', $.exponentiation_expression)),
      $.exponentiation_expression
    )),

    // Level 5: Additive (left-associative)
    additive_expression: $ => prec.left(5, choice(
      seq(field('left', $.multiplicative_expression), choice('+', '-'), field('right', $.multiplicative_expression)),
      $.multiplicative_expression
    )),

    // Level 6: Relational (left-associative)
    relational_expression: $ => prec.left(6, choice(
      seq(field('left', $.additive_expression), choice('<', ' <=', '>', '>='), field('right', $.additive_expression)),
      $.additive_expression
    )),

    // Level 7: Equality (left-associative)
    equality_expression: $ => prec.left(7, choice(
      seq(field('left', $.relational_expression), choice('==', '!='), field('right', $.relational_expression)),
      $.relational_expression
    )),

    // Level 8: Logical AND (left-associative)
    logical_and_expression: $ => prec.left(8, choice(
      seq(field('left', $.equality_expression), '&&', field('right', $.equality_expression)),
      $.equality_expression
    )),

    // Level 9: Logical OR (left-associative)
    logical_or_expression: $ => prec.left(9, choice(
      seq(field('left', $.logical_and_expression), '||', field('right', $.logical_and_expression)),
      $.logical_and_expression
    )),

    // Level 10: Conditional (Ternary) Operator (right-associative)
    conditional_expression: $ => prec.right(10, choice(
      seq(
        field('condition', $.logical_or_expression),
        '?',
        field('consequence', $.expression),
        ':',
        field('alternative', $.conditional_expression)
      ),
      $.logical_or_expression
    )),

    // Call expression (function calls)
    call_expression: $ => prec.left(1, seq(
      field('function', $.primary_expression),
      $.argument_list
    )),

    // Index expression (array indexing)
    index_expression: $ => prec.left(1, seq(
      field('array', $.primary_expression),
      '[',
      field('index', $.expression),
      ']'
    )),

    // Member access expression (e.g., v.x, p.y)
    member_expression: $ => prec.left(1, seq(
      field('object', $.primary_expression),
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

    // List comprehension - aiming for [expr for (var=list)] and [expr for (var=list) if (cond)]
    list_comprehension: $ => prec(1, seq(
      '[',
      field('element', $.expression),
      field('for_clause', $.list_comprehension_for_block),
      optional(field('if_clause', $.list_comprehension_if_block)),
      ']'
    )),

    list_comprehension_for_block: $ => seq(
      'for',
      '(',
      field('iterator', $.identifier), // Single identifier for now
      '=',
      field('list', $.expression),
      ')'
    ),

    list_comprehension_if_block: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')'
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
      optional(commaSep1($.expression)),
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