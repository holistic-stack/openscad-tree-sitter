import { DefaultNodeHandlerRegistry } from './default-node-handler-registry';
import { NodeHandler, NodeHandlerRegistry } from './node-handler-registry';
import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Factory for creating and configuring NodeHandlerRegistry instances.
 */
export class NodeHandlerRegistryFactory {
  /**
   * Creates a fully configured NodeHandlerRegistry with all handlers registered.
   * @returns A NodeHandlerRegistry with all handlers registered.
   */
  public static createRegistry(): NodeHandlerRegistry {
    const registry = new DefaultNodeHandlerRegistry();
    
    // Register primitive handlers
    this.registerPrimitiveHandlers(registry);
    
    // Register transformation handlers
    this.registerTransformationHandlers(registry);
    
    // Register CSG operation handlers
    this.registerCSGOperationHandlers(registry);
    
    // Register module and function handlers
    this.registerModuleAndFunctionHandlers(registry);
    
    return registry;
  }
  
  /**
   * Registers handlers for primitive shapes.
   * @param registry The registry to register handlers with.
   */
  private static registerPrimitiveHandlers(registry: NodeHandlerRegistry): void {
    // 3D primitives
    registry.register('cube', (node: TSNode) => {
      return { type: 'cube', size: 1, center: false };
    });
    
    registry.register('sphere', (node: TSNode) => {
      return { type: 'sphere', r: 1 };
    });
    
    registry.register('cylinder', (node: TSNode) => {
      return { type: 'cylinder', h: 1, r: 1, center: false };
    });
    
    registry.register('polyhedron', (node: TSNode) => {
      return { type: 'polyhedron', points: [], faces: [] };
    });
    
    // 2D primitives
    registry.register('circle', (node: TSNode) => {
      return { type: 'circle', r: 1 };
    });
    
    registry.register('square', (node: TSNode) => {
      return { type: 'square', size: 1, center: false };
    });
    
    registry.register('polygon', (node: TSNode) => {
      return { type: 'polygon', points: [] };
    });
    
    registry.register('text', (node: TSNode) => {
      return { type: 'text', text: '' };
    });
    
    // Extrusions
    registry.register('linear_extrude', (node: TSNode) => {
      return { type: 'linear_extrude', height: 1, center: false, children: [] };
    });
    
    registry.register('rotate_extrude', (node: TSNode) => {
      return { type: 'rotate_extrude', angle: 360, children: [] };
    });
  }
  
  /**
   * Registers handlers for transformations.
   * @param registry The registry to register handlers with.
   */
  private static registerTransformationHandlers(registry: NodeHandlerRegistry): void {
    registry.register('translate', (node: TSNode) => {
      return { type: 'translate', vector: [0, 0, 0], children: [] };
    });
    
    registry.register('rotate', (node: TSNode) => {
      return { type: 'rotate', angle: 0, children: [] };
    });
    
    registry.register('scale', (node: TSNode) => {
      return { type: 'scale', vector: [1, 1, 1], children: [] };
    });
    
    registry.register('mirror', (node: TSNode) => {
      return { type: 'mirror', vector: [0, 0, 0], children: [] };
    });
    
    registry.register('multmatrix', (node: TSNode) => {
      return { 
        type: 'multmatrix', 
        matrix: [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ], 
        children: [] 
      };
    });
    
    registry.register('color', (node: TSNode) => {
      return { type: 'color', color: [1, 1, 1, 1], children: [] };
    });
    
    registry.register('offset', (node: TSNode) => {
      return { type: 'offset', radius: 0, delta: 0, chamfer: false, children: [] };
    });
  }
  
  /**
   * Registers handlers for CSG operations.
   * @param registry The registry to register handlers with.
   */
  private static registerCSGOperationHandlers(registry: NodeHandlerRegistry): void {
    registry.register('union', (node: TSNode) => {
      return { type: 'union', children: [] };
    });
    
    registry.register('difference', (node: TSNode) => {
      return { type: 'difference', children: [] };
    });
    
    registry.register('intersection', (node: TSNode) => {
      return { type: 'intersection', children: [] };
    });
    
    registry.register('hull', (node: TSNode) => {
      return { type: 'hull', children: [] };
    });
    
    registry.register('minkowski', (node: TSNode) => {
      return { type: 'minkowski', children: [] };
    });
  }
  
  /**
   * Registers handlers for modules and functions.
   * @param registry The registry to register handlers with.
   */
  private static registerModuleAndFunctionHandlers(registry: NodeHandlerRegistry): void {
    registry.register('module', (node: TSNode) => {
      return { type: 'module_definition', name: '', parameters: [], body: [] };
    });
    
    registry.register('function', (node: TSNode) => {
      return { type: 'function_definition', name: '', parameters: [], expression: null };
    });
    
    registry.register('children', (node: TSNode) => {
      return { type: 'children', index: -1 };
    });
  }
}
