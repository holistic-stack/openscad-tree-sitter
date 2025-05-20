import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';
import { findDescendantOfType } from '../utils/node-utils';
import { PrimitiveGenerator } from './primitive-generator';

/**
 * Generator for CSG operation nodes (union, difference, intersection, hull, minkowski)
 */
export class CSGGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    switch (functionName) {
      case 'union':
        return this.createUnionNode(node, args);
      case 'difference':
        return this.createDifferenceNode(node, args);
      case 'intersection':
        return this.createIntersectionNode(node, args);
      case 'hull':
        return this.createHullNode(node, args);
      case 'minkowski':
        return this.createMinkowskiNode(node, args);
      default:
        return null;
    }
  }

  /**
   * Create a union node
   */
  private createUnionNode(node: TSNode, args: ast.Parameter[]): ast.UnionNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'union',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a difference node
   */
  private createDifferenceNode(node: TSNode, args: ast.Parameter[]): ast.DifferenceNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'difference',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create an intersection node
   */
  private createIntersectionNode(node: TSNode, args: ast.Parameter[]): ast.IntersectionNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'intersection',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a hull node
   */
  private createHullNode(node: TSNode, args: ast.Parameter[]): ast.HullNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'hull',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a minkowski node
   */
  private createMinkowskiNode(node: TSNode, args: ast.Parameter[]): ast.MinkowskiNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'minkowski',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Process child nodes of a CSG operation node
   */
  private processChildNodes(node: TSNode, children: ast.ASTNode[]): void {
    // Check for a statement child directly in the module_instantiation node
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'statement') {
        console.log(`[CSGGenerator.processChildNodes] Found statement child at index ${i}: ${child.text.substring(0,30)}`);
        this.processNode(child, children);
      }
    }

    // Check for a body node
    const bodyNode = node.childForFieldName('body');
    if (bodyNode) {
      if (bodyNode.type === 'block') {
        console.log(`[CSGGenerator.processChildNodes] Found block body for ${node.text.substring(0,30)}`);
        // Process all statements in the block
        for (let i = 0; i < bodyNode.childCount; i++) {
          const child = bodyNode.child(i);
          if (child && child.type === 'statement') {
            console.log(`[CSGGenerator.processChildNodes] Processing statement in block: ${child.text.substring(0,30)}`);
            // Look for module_instantiation in the statement
            const moduleInstantiation = findDescendantOfType(child, 'module_instantiation');
            if (moduleInstantiation) {
              console.log(`[CSGGenerator.processChildNodes] Found module_instantiation in statement: ${moduleInstantiation.text.substring(0,30)}`);
              const astNode = this.processModuleInstantiation(moduleInstantiation);
              if (astNode) {
                children.push(astNode);
              }
            } else {
              // Check if this is a primitive module instantiation
              if (child.text.includes('cube(') || child.text.includes('sphere(') || child.text.includes('cylinder(') ||
                  child.text.includes('circle(') || child.text.includes('square(') || child.text.includes('polygon(')) {
                console.log(`[CSGGenerator.processChildNodes] Found primitive in statement: ${child.text.substring(0,30)}`);
                // Create a primitive node
                const primitiveGenerator = new PrimitiveGenerator();
                const primitiveNode = primitiveGenerator.processNode(child, []);
                if (primitiveNode && primitiveNode.length > 0) {
                  children.push(primitiveNode[0]);
                }
              } else {
                // Process the statement normally
                this.processNode(child, children);
              }
            }
          }
        }
      } else if (bodyNode.type === 'statement') {
        console.log(`[CSGGenerator.processChildNodes] Found statement body for ${node.text.substring(0,30)}: ${bodyNode.text.substring(0,20)}`);
        this.processNode(bodyNode, children);
      }
    } else {
      // No explicit body, check for an immediately following statement
      const nextSibling = node.nextSibling;
      if (nextSibling && nextSibling.type === 'statement') {
        console.log(`[CSGGenerator.processChildNodes] Found next sibling statement for ${node.text.substring(0,30)}: ${nextSibling.text.substring(0,20)}`);
        this.processNode(nextSibling, children);
      } else {
        console.log(`[CSGGenerator.processChildNodes] No body and no next sibling statement found for ${node.text.substring(0,30)}. Next sibling type: ${nextSibling?.type}`);
      }
    }
  }
}
