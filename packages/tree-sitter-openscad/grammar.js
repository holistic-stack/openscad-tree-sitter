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
    [$.module_instantiation],

    // range_expression conflict is needed for handling nested range expressions
    [$.range_expression],

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
    [$._module_instantiation_with_body, $.expression],

    // Added to resolve conflict: `module_instantiation block • next_statement_token`
    // This allows `statement` to be ambiguous with itself in this specific sequence.
    [$.statement],

    // Added to resolve: accessor_expression argument_list block • next_token
    [$.statement, $._module_instantiation_with_body],

    // Added to resolve: for (for_header) block • next_token
    [$.statement, $.for_statement],

    // New conflicts for simplified grammar
    [$._module_instantiation_with_body, $._module_instantiation_simple, $.call_expression],
    [$.primary_expression, $.call_expression],
    [$.expression, $.call_expression],
    [$._module_instantiation_with_body, $._module_instantiation_simple, $.primary_expression],
    [$.binary_expression, $.let_expression],
    [$.primary_expression, $._vector_element],
    [$.primary_expression, $._argument_value],
    [$.primary_expression, $._assignment_value],
    [$.primary_expression, $._range_value],
    [$._vector_element, $.array_literal],
    [$._module_instantiation_with_body, $.module_instantiation],

    // Conflict for simple literals in expression_statement vs primary_expression
    [$.expression_statement, $.primary_expression],
    // Conflict for binary expressions in expression_statement vs expression
    [$.expression_statement, $.expression],
    // Conflict for simple literals in function_value vs primary_expression
    [$._function_value, $.primary_expression],
    // Conflict for simple literals in parameter_default_value vs primary_expression
    [$._parameter_default_value, $.primary_expression],
    // Conflict for binary expressions in function_value vs expression
    [$._function_value, $.expression],
    // Conflict for binary expressions in parameter_default_value vs expression
    [$._parameter_default_value, $.expression],
    // Conflict for simple literals in object_field vs primary_expression
    [$.object_field, $.primary_expression],
    // Conflict for binary expressions in object_field vs expression
    [$.object_field, $.expression],
    // Conflict for simple literals in call_expression vs primary_expression
    [$.call_expression, $.primary_expression],
    // Conflict for binary expressions in call_expression vs expression
    [$.call_expression, $.expression]
  ],

  rules: {
    source_file: $ => repeat($.statement),

    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//)
    ),

    // Error sentinel for better recovery
    error_sentinel: $ => token(prec(-1, /[^\s]+/)),

    // Error recovery helper
    _error_recovery: $ => token(prec(-1, /[^;{}()\[\]\s]+/)),

    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      $.module_definition,
      $.function_definition,
      $.assignment_statement,
      $.assign_statement,
      prec(2, $.module_instantiation), // Higher precedence than expression_statement
      $.if_statement,
      $.for_statement,
      $.echo_statement,
      $.assert_statement,
      prec(1, $.expression_statement), // Lower precedence than module_instantiation
      $.block
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

    // File path - can be quoted string or angle bracket string (hidden rule, DRY principle)
    _file_path: $ => choice(
      $.string,
      $.angle_bracket_string
    ),

    // Angle bracket string for include/use statements
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
      field('value', $._function_value),
      optional(';') // Make semicolon optional for error recovery
    ),

    // Function value - can be a simple value or complex expression (hidden rule, DRY principle)
    _function_value: $ => choice(
      // Simple literals can be parsed directly without expression wrapper (higher precedence)
      prec.dynamic(10, $.number),
      prec.dynamic(10, $.string),
      prec.dynamic(10, $.boolean),
      prec.dynamic(10, $.identifier),
      prec.dynamic(10, $.special_variable),
      prec.dynamic(10, $.vector_expression),
      // Binary expressions can be parsed directly without expression wrapper (higher precedence)
      prec.dynamic(10, $.binary_expression),
      prec.dynamic(10, $.unary_expression),
      // Complex expressions need the full expression hierarchy (lower precedence)
      prec(1, $.expression)
    ),

    parameter_list: $ => seq(
      '(',
      optional($.parameter_declarations),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;{]/)) // Match semicolon or opening brace
      )
    ),

    parameter_declarations: $ => seq(
      $.parameter_declaration,
      repeat(seq(',', $.parameter_declaration)),
      optional(',')
    ),

    parameter_declaration: $ => choice(
      $.identifier,
      $.special_variable,
      seq($.identifier, '=', $._parameter_default_value),
      seq($.special_variable, '=', $._parameter_default_value)
    ),

    // Parameter default value - can be a simple value or complex expression (hidden rule, DRY principle)
    _parameter_default_value: $ => choice(
      // Simple literals can be parsed directly without expression wrapper (higher precedence)
      prec.dynamic(10, $.number),
      prec.dynamic(10, $.string),
      prec.dynamic(10, $.boolean),
      prec.dynamic(10, $.identifier),
      prec.dynamic(10, $.special_variable),
      prec.dynamic(10, $.vector_expression),
      // Binary expressions can be parsed directly without expression wrapper (higher precedence)
      prec.dynamic(10, $.binary_expression),
      prec.dynamic(10, $.unary_expression),
      // Complex expressions need the full expression hierarchy (lower precedence)
      prec(1, $.expression)
    ),

    assignment_statement: $ => seq(
      field('name', choice($.special_variable, $.identifier)),
      '=',
      field('value', $._assignment_value),
      optional(';') // Make semicolon optional for error recovery
    ),

    // Assignment value - can be a simple value or complex expression (hidden rule)
    _assignment_value: $ => choice(
      $.number,
      $.string,
      $.boolean,
      $.identifier,
      $.special_variable,
      $.vector_expression,
      $.expression
    ),

    /**
     * Assign statement rule (deprecated in OpenSCAD but still supported for legacy code)
     *
     * This rule handles assign statements in OpenSCAD which follow the pattern:
     * assign(var1 = value1, var2 = value2, ...) { statements }
     *
     * We use precedence 2 to resolve conflicts with expression statements.
     *
     * Examples:
     *   assign(x = 5, y = 10) cube([x, y, 1]);
     *   assign(r = 10) { sphere(r); translate([r*2, 0, 0]) sphere(r); }
     */
    assign_statement: $ => prec(2, seq(
      'assign',
      '(',
      optional(commaSep1($.assign_assignment)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[{]/)) // Match opening brace
      ),
      choice(
        $.block,
        $.statement
      )
    )),

    assign_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      choice(
        '}',
        // Error recovery for missing closing brace
        token.immediate(prec(-1, /[^\s;]/)) // Match any non-whitespace, non-semicolon character
      )
    ),

    _module_instantiation_with_body: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      choice(
        $.block,
        prec.dynamic(10, $.module_instantiation), // Direct module instantiation without statement wrapping - DRY principle applied
        $.statement // A full statement, which will handle its own termination (e.g., semicolon for an inner module_instantiation_simple)
      )
    ),

    _module_instantiation_simple: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      ';'
    ),

    module_instantiation: $ => choice(
      prec(10, $._module_instantiation_with_body), // Higher precedence than call_expression (9)
      prec(10, $._module_instantiation_simple) // Higher precedence than call_expression (9)
    ),

    argument_list: $ => seq(
      '(',
      optional($.arguments),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;{]/)) // Match semicolon or opening brace
      )
    ),

    arguments: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
      optional(',')
    ),

    argument: $ => choice(
      $._argument_value,
      seq(field('name', $.special_variable), '=', field('value', $._argument_value)),
      seq(field('name', $.identifier), '=', field('value', $._argument_value))
    ),

    // Argument value - can be a simple value or complex expression (hidden rule)
    _argument_value: $ => choice(
      prec(5, $.number),
      prec(5, $.string),
      prec(5, $.boolean),
      prec(5, $.identifier),
      prec(5, $.special_variable),
      prec(4, $.vector_expression),
      prec(1, $.expression)
    ),

    module_child: $ => seq(
      'children',
      optional(seq(
        '(',
        optional($.expression),
        choice(
          ')',
          // Error recovery for missing closing parenthesis
          token.immediate(prec(-1, /[;]/)) // Match semicolon
        )
      )),
      optional(';') // Make semicolon optional for error recovery
    ),

    /**
     * Modifier rule for OpenSCAD modifiers (#, !, %, *)
     *
     * We use precedence 10 to resolve conflicts with unary_expression which uses
     * precedence 9. This ensures that modifiers like '!' are properly distinguished
     * from the logical NOT operator in expressions.
     *
     * Example: !cube(10) vs. !true
     */
    modifier: $ => prec(10, choice(
      '#', // Highlight/debug modifier
      '!', // Difference modifier
      '%', // Background modifier (not rendered)
      '*', // Disable modifier
    )),

    if_statement: $ => seq(
      'if',
      '(',
      $.expression,
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[{]/)) // Match opening brace
      ),
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

    /**
     * For loop rule
     *
     * This rule handles for loops in OpenSCAD.
     *
     * Examples:
     *   for(i = [0:10]) cube(i);
     *   for(i = [1,2,3]) translate([i,0,0]) sphere(i);
     */
    for_statement: $ => seq(
      'for',
      '(',
      $.for_header,
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[{]/)) // Match opening brace
      ),
      choice(
        $.block,
        $.statement
      )
    ),

    /**
     * For loop header rule
     *
     * This rule handles the iterator part of for loops: for(i = [0:10])
     * We use precedence 2 for the overall rule and precedence 2 for range_expression
     * to resolve conflicts with array_literal.
     *
     * Examples:
     *   for(i = [0:10])       // Range-based iteration
     *   for(i = [0:2:10])     // Range with step
     *   for(i = [1,2,3,4])    // Array-based iteration
     *   for($fn = 36)         // Special variable iteration
     */
    for_header: $ => prec(3, seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      // Use higher precedence for range_expression to resolve conflict with array_literal
      field('range', choice(prec(3, $.range_expression), $.expression))
    )),

    range_expression: $ => seq(
      '[',
      choice(
        seq(
          field('start', $._range_value),
          ':',
          field('end', $._range_value)
        ),
        seq(
          field('start', $._range_value),
          ':',
          field('step', $._range_value),
          ':',
          field('end', $._range_value)
        )
      ),
      choice(
        ']',
        // Error recovery for missing closing bracket
        token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
      )
    ),

    // Range value - can be a simple value or complex expression (hidden rule)
    _range_value: $ => choice(
      prec(5, $.number),
      prec(5, $.identifier),
      prec(5, $.special_variable),
      prec(1, $.expression)
    ),

    echo_statement: $ => seq(
      'echo',
      '(',
      optional($.arguments),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;]/)) // Match semicolon
      ),
      optional(';') // Make semicolon optional for error recovery
    ),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;]/)) // Match semicolon
      ),
      optional(';') // Make semicolon optional for error recovery
    ),

    expression_statement: $ => seq(
      choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      ),
      ';'
    ),

    // Simplified expression hierarchy - allow direct access to simple expressions
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

    // Simplified binary expression that handles all operators with proper precedence
    binary_expression: $ => choice(
      // Logical OR (lowest precedence)
      prec.left(1, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', '||'),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Logical AND
      prec.left(2, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', '&&'),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Equality
      prec.left(3, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', choice('==', '!=')),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Relational
      prec.left(4, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', choice('<', '<=', '>', '>=')),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Additive
      prec.left(5, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', choice('+', '-')),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Multiplicative
      prec.left(6, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', choice('*', '/', '%')),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      )),
      // Exponentiation (right associative)
      prec.right(7, seq(
        field('left', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        )),
        field('operator', '^'),
        field('right', choice(
          prec.dynamic(10, $.number),
          prec.dynamic(10, $.string),
          prec.dynamic(10, $.boolean),
          prec.dynamic(10, $.identifier),
          prec.dynamic(10, $.special_variable),
          prec.dynamic(10, $.vector_expression),
          prec(1, $.expression)
        ))
      ))
    ),

    // Simplified unary expression
    unary_expression: $ => prec.right(8, seq(
      field('operator', choice('!', '-')),
      field('operand', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      ))
    )),

    // Function call expression
    call_expression: $ => prec.left(9, seq(
      field('function', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      )),
      field('arguments', $.argument_list)
    )),

    // Array index expression
    index_expression: $ => prec.left(10, seq(
      field('array', $.expression),
      '[',
      field('index', $.expression),
      choice(
        ']',
        token.immediate(prec(-1, /[;,){}]/))
      )
    )),

    // Member access expression
    member_expression: $ => prec.left(10, seq(
      field('object', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      )),
      '.',
      field('property', $.identifier)
    )),

    // Simplified conditional expression
    conditional_expression: $ => prec.right(1, seq(
      field('condition', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      )),
      '?',
      field('consequence', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      )),
      ':',
      field('alternative', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      ))
    )),





    primary_expression: $ => choice(
      $.special_variable,
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      prec.dynamic(10, $.range_expression),
      $.vector_expression,
      $.array_literal,
      $.list_comprehension,
      $.object_literal,
      $.let_expression
    ),

    // OpenSCAD vector expression [x, y, z] - much higher precedence than array_literal
    vector_expression: $ => prec(10, seq('[',
      optional(commaSep1($._vector_element)),
      choice(
        ']',
        // Error recovery for missing closing bracket
        token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
      )
    )),

    // Vector element - can be a simple value, nested vector, or complex expression (hidden rule)
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
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,{}\[]/)) // Match semicolon, comma, braces, or opening bracket
      )
    ),

    array_literal: $ => seq('[',
      optional(commaSep1($.expression)),
      choice(
        ']',
        // Error recovery for missing closing bracket
        token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
      )
    ),

    /**
     * List comprehension rule
     *
     * This rule handles list comprehensions in two different syntaxes:
     * 1. Traditional syntax: [expr for (var=list) if (cond)]
     * 2. OpenSCAD syntax: [for (var=list) if (cond) expr]
     *
     * We use precedence 3 (higher than array_literal's precedence 1) to resolve
     * conflicts between list comprehensions and array literals.
     *
     * Examples:
     *   [x*x for (x = [1:5])]              // Traditional syntax
     *   [for (x = [1:5]) if (x % 2 == 0) x] // OpenSCAD syntax
     */
    list_comprehension: $ => prec(3, seq(
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
      choice(
        ']',
        // Error recovery for missing closing bracket
        token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
      )
    )),

    // Traditional syntax: for (var=list)
    list_comprehension_for: $ => prec(1, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // Traditional syntax: if (cond)
    list_comprehension_if: $ => prec(1, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // OpenSCAD syntax: for (var=list)
    // Higher precedence than traditional syntax to resolve conflict
    list_comprehension_for_block: $ => prec(4, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // OpenSCAD syntax: if (cond)
    // Higher precedence than traditional syntax to resolve conflict
    list_comprehension_if_block: $ => prec(4, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    /**
     * Object literal rule
     *
     * This rule handles object literals, which are key-value pairs enclosed in braces.
     * In OpenSCAD, object literals are used for various purposes including configuration
     * objects and data structures.
     *
     * We use precedence 1 to match the precedence of array_literal.
     *
     * Examples:
     *   {"size": 10, "center": true}
     *   {"x": 1, "y": 2, "z": 3}
     */
    object_literal: $ => prec(1, seq(
      '{',
      optional(seq(
        commaSep1($.object_field),
        optional(',')
      )),
      choice(
        '}',
        // Error recovery for missing closing brace
        token.immediate(prec(-1, /[;,)\[]/)) // Match semicolon, comma, closing parenthesis, or opening bracket
      )
    )),

    object_field: $ => seq(
      field('key', $.string),
      ':',
      field('value', choice(
        // Simple literals can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.number),
        prec.dynamic(10, $.string),
        prec.dynamic(10, $.boolean),
        prec.dynamic(10, $.identifier),
        prec.dynamic(10, $.special_variable),
        prec.dynamic(10, $.vector_expression),
        // Binary expressions can be parsed directly without expression wrapper (higher precedence)
        prec.dynamic(10, $.binary_expression),
        prec.dynamic(10, $.unary_expression),
        // Complex expressions need the full expression hierarchy (lower precedence)
        prec(1, $.expression)
      ))
    ),

    /**
     * Let expression rule
     *
     * This rule handles let expressions, which allow defining local variables
     * within an expression context.
     *
     * We use precedence 5 (higher than conditional_expression's precedence 1) to resolve
     * conflicts between let expressions and other expressions.
     *
     * Examples:
     *   let(x = 10, y = 20) x + y
     *   let(r = 5) circle(r)
     */
    let_expression: $ => prec(5, seq(
      'let',
      '(',
      commaSep1($.let_assignment),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,{}\[]/)) // Match semicolon, comma, braces, or opening bracket
      ),
      field('body', $.expression)
    )),

    let_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    special_variable: $ => token(/\$[\p{L}_][\p{L}\p{N}_]*/u),

    string: $ => choice(
      // Double-quoted strings with proper termination
      seq('"', optional(token.immediate(/[^"]*/)), '"'),
      // Single-quoted strings with proper termination
      seq('\'', optional(token.immediate(/[^']*/)), '\''),
      // Error recovery for unterminated double-quoted strings
      seq('"', token.immediate(/[^"\n]*/)),
      // Error recovery for unterminated single-quoted strings
      seq('\'', token.immediate(/[^'\n]*/)),
    ),

    number: $ => {
      const decimal = /[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/;
      const integer = /[0-9]+([eE][-+]?[0-9]+)?/;
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

// Helper function for sequences separated by a delimiter
function sepBy(delimiter, rule) {
  return optional(sepBy1(delimiter, rule));
}

function sepBy1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)));
}
