import { Tree, Node } from 'web-tree-sitter';
import * as ast from './ast-types';
import {
  BaseGenerator,
  PrimitiveGenerator,
  TransformGenerator,
  ExpressionGenerator
} from './generators';
import { CSGGenerator } from './generators/csg-generator';
import { findDescendantOfType } from './utils/node-utils';

// Type alias for web-tree-sitter's Node type
type TSNode = Node;

/**
 * Converts a Tree-sitter CST to an OpenSCAD AST using a modular approach
 * with specialized generators for different node types.
 */
export class ModularASTGenerator {
  private primitiveGenerator: PrimitiveGenerator;
  private transformGenerator: TransformGenerator;
  private csgGenerator: CSGGenerator;
  private expressionGenerator: ExpressionGenerator;
  private source: string;

  constructor(private tree: Tree, source: string) {
    this.source = source;
    this.primitiveGenerator = new PrimitiveGenerator();
    this.transformGenerator = new TransformGenerator();
    this.csgGenerator = new CSGGenerator();
    this.expressionGenerator = new ExpressionGenerator();
  }

  /**
   * Generate the AST from the CST
   */
  public generate(): ast.ASTNode[] {
    const statements: ast.ASTNode[] = [];

    console.log('[ModularASTGenerator.generate] Starting AST generation.');
    const rootNode = this.tree.rootNode;
    if (!rootNode) {
      console.log('[ModularASTGenerator.generate] No root node found. Returning empty array.');
      return statements;
    }
    console.log(`[ModularASTGenerator.generate] Root node type: ${rootNode.type}, Text: ${rootNode.text.substring(0, 50)}`);
    console.log(`[ModularASTGenerator.generate] Root node childCount: ${rootNode.childCount}, namedChildCount: ${rootNode.namedChildCount}`);

    // Log a few children for debugging
    for(let i = 0; i < Math.min(rootNode.namedChildCount, 5); i++) {
      const child = rootNode.namedChild(i);
      if (child) {
        console.log(`[ModularASTGenerator.generate] Root named child ${i}: type=${child.type}, text=${child.text.substring(0,30)}`);
      }
    }

    // Process the entire tree recursively to find all module instantiations
    this.processNode(rootNode, statements);
    console.log(`[ModularASTGenerator.generate] Finished processing. Statements count: ${statements.length}`);
    return statements;
  }

  /**
   * Process a node and its children recursively
   */
  private processNode(node: TSNode, statements: ast.ASTNode[]): void {
    console.log(`[ModularASTGenerator.processNode] Processing node - Type: ${node.type}, Text: ${node.text.substring(0, 50)}`);

    // Check if this node is a module instantiation
    if (node.type === 'module_instantiation') {
      console.log(`[ModularASTGenerator.processNode] Found module_instantiation: ${node.text.substring(0,30)}`);
      const astNode = this.processModuleInstantiation(node);
      if (astNode) {
        statements.push(astNode);
        return; // Don't process children of processed module instantiations further here
      }
      console.log(`[ModularASTGenerator.processNode] processModuleInstantiation returned null for: ${node.text.substring(0,30)}`);
    }

    // Special case for expression_statement containing a function call
    if (node.type === 'expression_statement') {
      const expression = node.childForFieldName('expression');
      if (expression && expression.type === 'expression') {
        // Look for function calls in the expression
        const functionCall = findDescendantOfType(expression, 'accessor_expression');
        if (functionCall && functionCall.text.includes('sphere') || functionCall.text.includes('cube') || functionCall.text.includes('cylinder')) {
          console.log(`[ModularASTGenerator.processNode] Found function call in expression: ${functionCall.text.substring(0,30)}`);
          // Create a fake module_instantiation node for the function call
          const astNode = this.processModuleInstantiation(functionCall.parent);
          if (astNode) {
            statements.push(astNode);
            return;
          }
        }
      }
    }

    // Process all children recursively
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.processNode(child, statements);
      }
    }
  }

  /**
   * Process a module_instantiation node
   */
  private processModuleInstantiation(node: TSNode): ast.ASTNode | null {
    // Ensure we have a function name from the 'name' field
    const nameFieldNode = node.childForFieldName('name');
    console.log('[ModularASTGenerator.processModuleInstantiation] Processing node:', node.type, node.text.substring(0, 40));

    if (!nameFieldNode) {
      console.error('[ModularASTGenerator.processModuleInstantiation] No nameFieldNode found for:', node.text.substring(0, 40));
      return null;
    }

    console.log('[ModularASTGenerator.processModuleInstantiation] nameFieldNode:', nameFieldNode.type, nameFieldNode.text);

    // Assuming the name field contains an identifier or an accessor_expression whose text is the name
    const functionName = nameFieldNode?.text;
    if (!functionName) {
      console.error('[ModularASTGenerator.processModuleInstantiation] functionName is null or empty from nameFieldNode.text for:', nameFieldNode.text);
      return null;
    }

    console.log('[ModularASTGenerator.processModuleInstantiation] Extracted functionName:', functionName);

    // Try each generator in order of specificity
    let astNode: ast.ASTNode | null = null;

    // First try the primitive generator
    astNode = this.primitiveGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] PrimitiveGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Then try the transform generator
    astNode = this.transformGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] TransformGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Then try the CSG generator
    astNode = this.csgGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] CSGGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    // Finally, fall back to the expression generator for generic function calls
    astNode = this.expressionGenerator.processModuleInstantiation(node);
    if (astNode) {
      console.log(`[ModularASTGenerator.processModuleInstantiation] ExpressionGenerator created node of type: ${astNode.type}`);
      return astNode;
    }

    console.warn(`[ModularASTGenerator.processModuleInstantiation] No generator could process module: ${functionName}`);
    return null;
  }
}
