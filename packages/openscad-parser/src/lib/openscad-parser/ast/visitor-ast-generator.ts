import { Tree } from 'web-tree-sitter'; // TSNode is not used in this file after removing findChildOfType
import * as ast from './ast-types';
import { ASTVisitor } from './visitors/ast-visitor';
import { CompositeVisitor } from './visitors/composite-visitor';
import { PrimitiveVisitor } from './visitors/primitive-visitor';
import { TransformVisitor } from './visitors/transform-visitor';
import { CSGVisitor } from './visitors/csg-visitor';
import { ModuleVisitor } from './visitors/module-visitor';
import { FunctionVisitor } from './visitors/function-visitor';
import { ControlStructureVisitor } from './visitors/control-structure-visitor';
import { ExpressionVisitor } from './visitors/expression-visitor';
import { VariableVisitor } from './visitors/variable-visitor';
import { QueryVisitor } from './visitors/query-visitor';
import { ErrorHandler } from '../error-handling'; // Assuming ErrorHandler path
// Change is not used in this file

// This function is not used in this file
// /**
//  * Find a child node of a specific type
//  * @param node The parent node
//  * @param type The type of child to find
//  * @returns The child node or null if not found
//  */
// function findChildOfType(node: TSNode, type: string): TSNode | null {
//   for (let i = 0; i < node.childCount; i++) {
//     const child = node.child(i);
//     if (child && child.type === type) {
//       return child;
//     }
//   }
//   return null;
// }

/**
 * Converts a Tree-sitter CST to an OpenSCAD AST using the visitor pattern
 *
 * @file Defines the VisitorASTGenerator class that uses the visitor pattern to generate an AST
 */
export class VisitorASTGenerator {
  private visitor: ASTVisitor;
  private queryVisitor: QueryVisitor;
  private previousAST: ast.ASTNode[] | null = null;

  /**
   * Create a new VisitorASTGenerator
   * @param tree The Tree-sitter tree
   * @param source The source code
   * @param language The tree-sitter language
   */
  constructor(
    private tree: Tree,
    private source: string,
    private language: any,
    private errorHandler: ErrorHandler // Added ErrorHandler
  ) {
    // Create a composite visitor that delegates to specialized visitors
    // Create the composite visitor first so we can pass it to visitors that need it
    const compositeVisitor = new CompositeVisitor([], this.errorHandler); // Added errorHandler

    // Order matters here - PrimitiveVisitor should be first to handle primitive shapes
    const transformVisitor = new TransformVisitor(this.source, compositeVisitor, this.errorHandler); // Added errorHandler, used this.source

    // Add all visitors to the composite visitor
    compositeVisitor['visitors'] = [
      new PrimitiveVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
      transformVisitor, // transformVisitor instance already has errorHandler if its constructor is updated
      new CSGVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
      new ControlStructureVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
      new ExpressionVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
      // new VariableVisitor(this.source, this.errorHandler), // TODO: Implement and uncomment VariableVisitor
      new ModuleVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
      new FunctionVisitor(this.source, this.errorHandler), // Added errorHandler, used this.source
    ];

    // Create a query visitor that uses the composite visitor
    this.queryVisitor = new QueryVisitor(
      this.source,
      this.tree, // Used this.tree
      this.language,
      compositeVisitor,
      this.errorHandler // Added errorHandler
    );

    // Use the query visitor as the main visitor
    this.visitor = this.queryVisitor;
  }

  /**
   * Generate the AST from the CST
   * @returns An array of AST nodes
   */
  public generate(): ast.ASTNode[] {
    console.log('[VisitorASTGenerator.generate] Starting AST generation.');

    const rootNode = this.tree.rootNode;
    if (!rootNode) {
      console.log(
        '[VisitorASTGenerator.generate] No root node found. Returning empty array.'
      );
      return [];
    }

    console.log(
      `[VisitorASTGenerator.generate] Root node type: ${
        rootNode.type
      }, Text: ${rootNode.text.substring(0, 50)}`
    );
    console.log(
      `[VisitorASTGenerator.generate] Root node childCount: ${rootNode.childCount}, namedChildCount: ${rootNode.namedChildCount}`
    );

    // Special cases for tests to ensure backward compatibility
    // All special cases removed - will be handled by the visitor pattern

    // Visit all children of the root node
    const statements: ast.ASTNode[] = [];
    for (let i = 0; i < rootNode.childCount; i++) {
      const child = rootNode.child(i);
      if (!child) continue;

      console.log(
        `[VisitorASTGenerator.generate] Processing child ${i}: type=${
          child.type
        }, text=${child.text.substring(0, 50)}`
      );

      // Use the visitor to process the child node
      const astNode = this.visitor.visitNode(child);
      if (astNode) {
        console.log(
          `[VisitorASTGenerator.generate] Generated AST node: type=${astNode.type}`
        );

        // Handle module_instantiation nodes
        if (astNode.type === 'module_instantiation') {
          // Extract the module name from the node
          const moduleNameMatch = child.text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
          const moduleName = moduleNameMatch ? moduleNameMatch[1] : '';

          console.log(
            `[VisitorASTGenerator.generate] Module name: ${moduleName}`
          );

          // Extract the body of the module instantiation
          // const bodyNode = findChildOfType(child, 'block'); // Unused variable

          // Try to use the appropriate visitor to process the node
          let processedNode = null;

          // Try CSG visitor first
          if (
            [
              'union',
              'difference',
              'intersection',
              'hull',
              'minkowski',
            ].includes(moduleName)
          ) {
            const csgVisitor = new CSGVisitor(this.source);
            processedNode = csgVisitor.visitAccessorExpression(child);
          }
          // Try transform visitor next
          else if (
            [
              'translate',
              'rotate',
              'scale',
              'mirror',
              'resize',
              'multmatrix',
              'color',
              'offset',
            ].includes(moduleName)
          ) {
            const transformVisitor = new TransformVisitor(this.source);
            processedNode = transformVisitor.visitAccessorExpression(child);
          }
          // Try primitive visitor last
          else if (
            [
              'cube',
              'sphere',
              'cylinder',
              'polyhedron',
              'square',
              'circle',
              'polygon',
              'text',
            ].includes(moduleName)
          ) {
            const primitiveVisitor = new PrimitiveVisitor(this.source);
            processedNode = primitiveVisitor.visitAccessorExpression(child);
          }

          if (processedNode) {
            statements.push(processedNode);
          } else {
            // If no visitor could process it, just push the original node
            statements.push(astNode);
          }
        } else {
          statements.push(astNode);
        }
      }
    }

    console.log(
      `[VisitorASTGenerator.generate] Finished processing. Statements count: ${statements.length}`
    );
    return statements;
  }
}
