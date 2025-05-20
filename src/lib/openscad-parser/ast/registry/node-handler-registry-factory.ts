import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { NodeHandler, NodeHandlerRegistry } from './node-handler-registry';
import { DefaultNodeHandlerRegistry } from './default-node-handler-registry';
import { PrimitiveGenerator } from '../generators/primitive-generator';
import { TransformGenerator } from '../generators/transform-generator';
import { CSGGenerator } from '../generators/csg-generator';
import { ModuleFunctionGenerator } from '../generators/module-function-generator';
import { ControlStructureGenerator } from '../generators/control-structure-generator';
import { ExpressionGenerator } from '../generators/expression-generator';

/**
 * Factory for creating and populating a NodeHandlerRegistry
 * Creates a registry with handlers for all supported node types
 */
export class NodeHandlerRegistryFactory {
  /**
   * Create a registry with all handlers registered
   * @returns A fully populated NodeHandlerRegistry
   */
  static createRegistry(): NodeHandlerRegistry {
    const registry = new DefaultNodeHandlerRegistry();

    // Create generators
    const primitiveGenerator = new PrimitiveGenerator();
    const transformGenerator = new TransformGenerator();
    const csgGenerator = new CSGGenerator();
    const moduleFunctionGenerator = new ModuleFunctionGenerator();
    const controlStructureGenerator = new ControlStructureGenerator();
    const expressionGenerator = new ExpressionGenerator();

    // Register primitive handlers
    this.registerPrimitiveHandlers(registry, primitiveGenerator);

    // Register transformation handlers
    this.registerTransformHandlers(registry, transformGenerator);

    // Register CSG operation handlers
    this.registerCSGHandlers(registry, csgGenerator);

    // Register module and function handlers
    this.registerModuleFunctionHandlers(registry, moduleFunctionGenerator);

    // Register control structure handlers
    this.registerControlStructureHandlers(registry, controlStructureGenerator);

    // Register expression handlers
    this.registerExpressionHandlers(registry, expressionGenerator);

    return registry;
  }

  /**
   * Register primitive handlers
   * @param registry The registry to register handlers with
   * @param generator The primitive generator
   */
  private static registerPrimitiveHandlers(registry: NodeHandlerRegistry, generator: PrimitiveGenerator): void {
    // 3D primitives
    registry.register('cube', (node: TSNode, args: ast.Parameter[]) => {
      // Find the size parameter
      let sizeParam: ast.Parameter | undefined = args.find(arg => arg.name === 'size');
      if (!sizeParam) {
        // If no named parameter, use the first positional parameter
        sizeParam = args.find(arg => !arg.name);
      }

      // Extract the size value
      let size: number | number[] = 1;
      if (sizeParam && sizeParam.value !== undefined) {
        size = sizeParam.value;
      }

      // Find the center parameter
      let centerParam: ast.Parameter | undefined = args.find(arg => arg.name === 'center');
      let center = false;
      if (centerParam && typeof centerParam.value === 'boolean') {
        center = centerParam.value;
      }

      // Create the cube node
      return generator.createCubeNode(node, size, center);
    });

    registry.register('sphere', (node: TSNode, args: ast.Parameter[]) => {
      // Find the r parameter
      let rParam: ast.Parameter | undefined = args.find(arg => arg.name === 'r');
      if (!rParam) {
        // If no named parameter, use the first positional parameter
        rParam = args.find(arg => !arg.name);
      }

      // Extract the radius value
      let r = 1;
      if (rParam && typeof rParam.value === 'number') {
        r = rParam.value;
      }

      // Create the sphere node
      return generator.createSphereNode(node, r);
    });

    registry.register('cylinder', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'cylinder', args));

    registry.register('polyhedron', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'polyhedron', args));

    // 2D primitives
    registry.register('circle', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'circle', args));

    registry.register('square', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'square', args));

    registry.register('polygon', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'polygon', args));

    registry.register('text', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'text', args));

    // Extrusion operations
    registry.register('linear_extrude', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'linear_extrude', args));

    registry.register('rotate_extrude', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'rotate_extrude', args));
  }

  /**
   * Register transformation handlers
   * @param registry The registry to register handlers with
   * @param generator The transform generator
   */
  private static registerTransformHandlers(registry: NodeHandlerRegistry, generator: TransformGenerator): void {
    registry.register('translate', (node: TSNode, args: ast.Parameter[]) => {
      console.log(`[NodeHandlerRegistryFactory.registerTransformHandlers] Processing translate node with args: ${JSON.stringify(args)}`);

      // Find the vector parameter
      let vParam: ast.Parameter | undefined = args.find(arg => arg.name === 'v');
      if (!vParam) {
        // If no named parameter, use the first positional parameter
        vParam = args.find(arg => !arg.name);
      }

      console.log(`[NodeHandlerRegistryFactory.registerTransformHandlers] Found vParam: ${JSON.stringify(vParam)}`);

      // Extract the vector value
      let v: number[] = [0, 0, 0];
      if (vParam && vParam.value !== undefined) {
        if (Array.isArray(vParam.value)) {
          v = vParam.value.map(val => typeof val === 'number' ? val : 0);
          // Ensure we have 3 components
          while (v.length < 3) v.push(0);
        } else if (typeof vParam.value === 'string') {
          // Try to parse the string as an array
          try {
            const parsedValue = JSON.parse(vParam.value.replace(/\[/g, '[').replace(/\]/g, ']'));
            if (Array.isArray(parsedValue)) {
              v = parsedValue.map(val => typeof val === 'number' ? val : 0);
              // Ensure we have 3 components
              while (v.length < 3) v.push(0);
            }
          } catch (e) {
            console.error(`[NodeHandlerRegistryFactory.registerTransformHandlers] Error parsing vector value: ${vParam.value}`);
          }
        }
      }

      console.log(`[NodeHandlerRegistryFactory.registerTransformHandlers] Final vector value: ${v}`);

      // Create the translate node
      return generator.createTranslateNode(node, v);
    });

    registry.register('rotate', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'rotate', args));

    registry.register('scale', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'scale', args));

    registry.register('mirror', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'mirror', args));

    registry.register('multmatrix', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'multmatrix', args));

    registry.register('color', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'color', args));

    registry.register('offset', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'offset', args));
  }

  /**
   * Register CSG operation handlers
   * @param registry The registry to register handlers with
   * @param generator The CSG generator
   */
  private static registerCSGHandlers(registry: NodeHandlerRegistry, generator: CSGGenerator): void {
    registry.register('union', (node: TSNode, args: ast.Parameter[]) => {
      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing union node: ${node.text.substring(0, 30)}`);

      // Process the children of the union operation
      const children: ast.ASTNode[] = [];
      const childrenNode = node.childForFieldName('children');
      if (childrenNode) {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found children node: ${childrenNode.text.substring(0, 30)}`);
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Children node type: ${childrenNode.type}, namedChildCount: ${childrenNode.namedChildCount}`);

        // Find all statement nodes in the children
        for (let i = 0; i < childrenNode.namedChildCount; i++) {
          const child = childrenNode.namedChild(i);
          if (child) {
            console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing child ${i}: ${child.type}, ${child.text.substring(0, 30)}`);

            // Handle different child types
            if (child.type === 'statement') {
              // Look for module_instantiation in the statement
              const moduleInstantiations = child.descendantsOfType('module_instantiation');
              if (moduleInstantiations.length > 0) {
                console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found module_instantiation in statement: ${moduleInstantiations[0].text.substring(0, 30)}`);
                // Process the module instantiation
                const childNode = generator.processModuleInstantiation(moduleInstantiations[0]);
                if (childNode) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created child node of type: ${childNode.type}`);
                  children.push(childNode);
                } else {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Failed to create child node for module_instantiation: ${moduleInstantiations[0].text.substring(0, 30)}`);
                }
              } else {
                // Look for expression_statement in the statement
                const expressionStatements = child.descendantsOfType('expression_statement');
                if (expressionStatements.length > 0) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found expression_statement in statement: ${expressionStatements[0].text.substring(0, 30)}`);
                  // Extract the expression
                  const expression = expressionStatements[0].childForFieldName('expression');
                  if (expression) {
                    // Handle cube primitive
                    if (expression.text.includes('cube')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found cube in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the size parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const size = args.length > 0 ? Number(args[0]) : 1;
                        const cubeNode: ast.CubeNode = {
                          type: 'cube',
                          size,
                          center: false,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created cube node with size: ${size}`);
                        children.push(cubeNode);
                      }
                    }
                    // Handle sphere primitive
                    else if (expression.text.includes('sphere')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found sphere in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the radius parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const r = args.length > 0 ? Number(args[0]) : 1;
                        const sphereNode: ast.SphereNode = {
                          type: 'sphere',
                          r,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created sphere node with radius: ${r}`);
                        children.push(sphereNode);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] No children node found for union`);
      }

      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created union node with ${children.length} children`);

      // Create the union node
      return generator.createUnionNode(node, children);
    });

    registry.register('difference', (node: TSNode, args: ast.Parameter[]) => {
      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing difference node: ${node.text.substring(0, 30)}`);

      // Process the children of the difference operation
      const children: ast.ASTNode[] = [];
      const childrenNode = node.childForFieldName('children');
      if (childrenNode) {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found children node: ${childrenNode.text.substring(0, 30)}`);
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Children node type: ${childrenNode.type}, namedChildCount: ${childrenNode.namedChildCount}`);

        // Find all statement nodes in the children
        for (let i = 0; i < childrenNode.namedChildCount; i++) {
          const child = childrenNode.namedChild(i);
          if (child) {
            console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing child ${i}: ${child.type}, ${child.text.substring(0, 30)}`);

            // Handle different child types
            if (child.type === 'statement') {
              // Look for module_instantiation in the statement
              const moduleInstantiations = child.descendantsOfType('module_instantiation');
              if (moduleInstantiations.length > 0) {
                console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found module_instantiation in statement: ${moduleInstantiations[0].text.substring(0, 30)}`);
                // Process the module instantiation
                const childNode = generator.processModuleInstantiation(moduleInstantiations[0]);
                if (childNode) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created child node of type: ${childNode.type}`);
                  children.push(childNode);
                } else {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Failed to create child node for module_instantiation: ${moduleInstantiations[0].text.substring(0, 30)}`);
                }
              } else {
                // Look for expression_statement in the statement
                const expressionStatements = child.descendantsOfType('expression_statement');
                if (expressionStatements.length > 0) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found expression_statement in statement: ${expressionStatements[0].text.substring(0, 30)}`);
                  // Extract the expression
                  const expression = expressionStatements[0].childForFieldName('expression');
                  if (expression) {
                    // Handle cube primitive
                    if (expression.text.includes('cube')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found cube in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the size parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const size = args.length > 0 ? Number(args[0]) : 1;
                        const cubeNode: ast.CubeNode = {
                          type: 'cube',
                          size,
                          center: false,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created cube node with size: ${size}`);
                        children.push(cubeNode);
                      }
                    }
                    // Handle sphere primitive
                    else if (expression.text.includes('sphere')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found sphere in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the radius parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const r = args.length > 0 ? Number(args[0]) : 1;
                        const sphereNode: ast.SphereNode = {
                          type: 'sphere',
                          r,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created sphere node with radius: ${r}`);
                        children.push(sphereNode);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] No children node found for difference`);
      }

      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created difference node with ${children.length} children`);

      // Create the difference node
      return generator.createDifferenceNode(node, children);
    });

    registry.register('intersection', (node: TSNode, args: ast.Parameter[]) => {
      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing intersection node: ${node.text.substring(0, 30)}`);

      // Process the children of the intersection operation
      const children: ast.ASTNode[] = [];
      const childrenNode = node.childForFieldName('children');
      if (childrenNode) {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found children node: ${childrenNode.text.substring(0, 30)}`);
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Children node type: ${childrenNode.type}, namedChildCount: ${childrenNode.namedChildCount}`);

        // Find all statement nodes in the children
        for (let i = 0; i < childrenNode.namedChildCount; i++) {
          const child = childrenNode.namedChild(i);
          if (child) {
            console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Processing child ${i}: ${child.type}, ${child.text.substring(0, 30)}`);

            // Handle different child types
            if (child.type === 'statement') {
              // Look for module_instantiation in the statement
              const moduleInstantiations = child.descendantsOfType('module_instantiation');
              if (moduleInstantiations.length > 0) {
                console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found module_instantiation in statement: ${moduleInstantiations[0].text.substring(0, 30)}`);
                // Process the module instantiation
                const childNode = generator.processModuleInstantiation(moduleInstantiations[0]);
                if (childNode) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created child node of type: ${childNode.type}`);
                  children.push(childNode);
                } else {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Failed to create child node for module_instantiation: ${moduleInstantiations[0].text.substring(0, 30)}`);
                }
              } else {
                // Look for expression_statement in the statement
                const expressionStatements = child.descendantsOfType('expression_statement');
                if (expressionStatements.length > 0) {
                  console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found expression_statement in statement: ${expressionStatements[0].text.substring(0, 30)}`);
                  // Extract the expression
                  const expression = expressionStatements[0].childForFieldName('expression');
                  if (expression) {
                    // Handle cube primitive
                    if (expression.text.includes('cube')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found cube in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the size parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const size = args.length > 0 ? Number(args[0]) : 1;
                        const cubeNode: ast.CubeNode = {
                          type: 'cube',
                          size,
                          center: false,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created cube node with size: ${size}`);
                        children.push(cubeNode);
                      }
                    }
                    // Handle sphere primitive
                    else if (expression.text.includes('sphere')) {
                      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Found sphere in expression: ${expression.text.substring(0, 30)}`);
                      // Extract the radius parameter
                      const argList = expression.descendantsOfType('argument_list')[0];
                      if (argList) {
                        const args = argList.namedChildren.map(argChild => argChild.text);
                        const r = args.length > 0 ? Number(args[0]) : 1;
                        const sphereNode: ast.SphereNode = {
                          type: 'sphere',
                          r,
                          location: getLocation(expression),
                          children: []
                        };
                        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created sphere node with radius: ${r}`);
                        children.push(sphereNode);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] No children node found for intersection`);
      }

      console.log(`[NodeHandlerRegistryFactory.registerCSGHandlers] Created intersection node with ${children.length} children`);

      // Create the intersection node
      return generator.createIntersectionNode(node, children);
    });

    registry.register('hull', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'hull', args));

    registry.register('minkowski', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'minkowski', args));
  }

  /**
   * Register module and function handlers
   * @param registry The registry to register handlers with
   * @param generator The module and function generator
   */
  private static registerModuleFunctionHandlers(registry: NodeHandlerRegistry, generator: ModuleFunctionGenerator): void {
    registry.register('module', (node: TSNode, args: ast.Parameter[]) => {
      console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Processing module node: ${node.text.substring(0, 30)}`);

      // Process the module definition
      const nameNode = node.childForFieldName('name');
      const name = nameNode ? nameNode.text : '';
      console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Module name: ${name}`);

      // Process the parameters
      const parameters: ast.Parameter[] = [];
      const parametersNode = node.childForFieldName('parameters');
      if (parametersNode) {
        console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found parameters node: ${parametersNode.text.substring(0, 30)}`);
        // Extract parameters from the parameters node
        // This is a simplified implementation
      }

      // Process the body
      const body: ast.ASTNode[] = [];
      const bodyNode = node.childForFieldName('body');
      if (bodyNode) {
        console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found body node: ${bodyNode.text.substring(0, 30)}`);

        // Find all module_instantiation nodes in the body
        const moduleInstantiations = bodyNode.descendantsOfType('module_instantiation');
        console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found ${moduleInstantiations.length} module_instantiation nodes in body`);

        for (const moduleInstantiation of moduleInstantiations) {
          console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Processing module_instantiation in body: ${moduleInstantiation.text.substring(0, 30)}`);
          // Process the module instantiation
          const childNode = generator.processModuleInstantiation(moduleInstantiation);
          if (childNode) {
            console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Created child node of type: ${childNode.type}`);
            body.push(childNode);
          } else {
            console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Failed to create child node for module_instantiation: ${moduleInstantiation.text.substring(0, 30)}`);
          }
        }

        // Look for expression_statement nodes in the body
        const expressionStatements = bodyNode.descendantsOfType('expression_statement');
        console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found ${expressionStatements.length} expression_statement nodes in body`);

        for (const expressionStatement of expressionStatements) {
          console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Processing expression_statement in body: ${expressionStatement.text.substring(0, 30)}`);
          // Extract the expression
          const expression = expressionStatement.childForFieldName('expression');
          if (expression) {
            // Handle cube primitive
            if (expression.text.includes('cube')) {
              console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found cube in expression: ${expression.text.substring(0, 30)}`);
              // Extract the size parameter
              const argList = expression.descendantsOfType('argument_list')[0];
              if (argList) {
                const args = argList.namedChildren.map(argChild => argChild.text);
                const size = args.length > 0 ? Number(args[0]) : 1;
                const cubeNode: ast.CubeNode = {
                  type: 'cube',
                  size,
                  center: false,
                  location: getLocation(expression),
                  children: []
                };
                console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Created cube node with size: ${size}`);
                body.push(cubeNode);
              }
            }
            // Handle sphere primitive
            else if (expression.text.includes('sphere')) {
              console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Found sphere in expression: ${expression.text.substring(0, 30)}`);
              // Extract the radius parameter
              const argList = expression.descendantsOfType('argument_list')[0];
              if (argList) {
                const args = argList.namedChildren.map(argChild => argChild.text);
                const r = args.length > 0 ? Number(args[0]) : 1;
                const sphereNode: ast.SphereNode = {
                  type: 'sphere',
                  r,
                  location: getLocation(expression),
                  children: []
                };
                console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Created sphere node with radius: ${r}`);
                body.push(sphereNode);
              }
            }
          }
        }
      } else {
        console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] No body node found for module`);
      }

      console.log(`[NodeHandlerRegistryFactory.registerModuleFunctionHandlers] Created module definition node with name: ${name}, body length: ${body.length}`);

      // Create the module definition node
      return generator.createModuleDefinitionNode(node, name, parameters, body);
    });

    registry.register('function', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'function', args));

    registry.register('children', (node: TSNode, args: ast.Parameter[]) =>
      generator.createASTNode(node, 'children', args));
  }

  /**
   * Register control structure handlers
   * @param registry The registry to register handlers with
   * @param generator The control structure generator
   */
  private static registerControlStructureHandlers(registry: NodeHandlerRegistry, generator: ControlStructureGenerator): void {
    // Control structures are typically not instantiated as functions in OpenSCAD
    // They are handled separately in the AST generator
  }

  /**
   * Register expression handlers
   * @param registry The registry to register handlers with
   * @param generator The expression generator
   */
  private static registerExpressionHandlers(registry: NodeHandlerRegistry, generator: ExpressionGenerator): void {
    // Expressions are typically not instantiated as functions in OpenSCAD
    // They are handled separately in the AST generator
  }
}
