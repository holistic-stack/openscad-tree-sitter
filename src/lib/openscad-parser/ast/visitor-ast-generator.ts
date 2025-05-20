import { Tree, Node as TSNode } from 'web-tree-sitter';
import * as ast from './ast-types';
import { ASTVisitor } from './visitors/ast-visitor';
import { CompositeVisitor } from './visitors/composite-visitor';
import { PrimitiveVisitor } from './visitors/primitive-visitor';
import { TransformVisitor } from './visitors/transform-visitor';
import { CSGVisitor } from './visitors/csg-visitor';

/**
 * Converts a Tree-sitter CST to an OpenSCAD AST using the visitor pattern
 * 
 * @file Defines the VisitorASTGenerator class that uses the visitor pattern to generate an AST
 */
export class VisitorASTGenerator {
  private visitor: ASTVisitor;
  
  /**
   * Create a new VisitorASTGenerator
   * @param tree The Tree-sitter tree
   * @param source The source code
   */
  constructor(private tree: Tree, private source: string) {
    // Create a composite visitor that delegates to specialized visitors
    this.visitor = new CompositeVisitor([
      new PrimitiveVisitor(source),
      new TransformVisitor(source),
      new CSGVisitor(source)
    ]);
  }
  
  /**
   * Generate the AST from the CST
   * @returns An array of AST nodes
   */
  public generate(): ast.ASTNode[] {
    console.log('[VisitorASTGenerator.generate] Starting AST generation.');
    const rootNode = this.tree.rootNode;
    if (!rootNode) {
      console.log('[VisitorASTGenerator.generate] No root node found. Returning empty array.');
      return [];
    }
    
    console.log(`[VisitorASTGenerator.generate] Root node type: ${rootNode.type}, Text: ${rootNode.text.substring(0, 50)}`);
    console.log(`[VisitorASTGenerator.generate] Root node childCount: ${rootNode.childCount}, namedChildCount: ${rootNode.namedChildCount}`);
    
    // Visit all children of the root node
    const statements: ast.ASTNode[] = [];
    for (let i = 0; i < rootNode.childCount; i++) {
      const child = rootNode.child(i);
      if (!child) continue;
      
      const astNode = this.visitor.visitNode(child);
      if (astNode) {
        statements.push(astNode);
      }
    }
    
    console.log(`[VisitorASTGenerator.generate] Finished processing. Statements count: ${statements.length}`);
    return statements;
  }
}