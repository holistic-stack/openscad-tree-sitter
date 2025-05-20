import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DefaultNodeHandlerRegistry } from './default-node-handler-registry';
import { NodeHandlerRegistryFactory } from './node-handler-registry-factory';
import { NodeHandler } from './node-handler-registry';
import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

describe('NodeHandlerRegistry', () => {
  describe('DefaultNodeHandlerRegistry', () => {
    let registry: DefaultNodeHandlerRegistry;
    let mockHandler: NodeHandler;

    beforeEach(() => {
      registry = new DefaultNodeHandlerRegistry();
      mockHandler = vi.fn().mockReturnValue(null);
    });

    test('should register and retrieve a handler', () => {
      // Register a handler
      registry.register('cube', mockHandler);

      // Retrieve the handler
      const handler = registry.getHandler('cube');

      // Verify the handler is the same
      expect(handler).toBe(mockHandler);
    });

    test('should check if a handler exists', () => {
      // Register a handler
      registry.register('cube', mockHandler);

      // Check if the handler exists
      expect(registry.hasHandler('cube')).toBe(true);
      expect(registry.hasHandler('sphere')).toBe(false);
    });

    test('should get all registered node types', () => {
      // Register multiple handlers
      registry.register('cube', mockHandler);
      registry.register('sphere', mockHandler);
      registry.register('cylinder', mockHandler);

      // Get all registered node types
      const nodeTypes = registry.getRegisteredNodeTypes();

      // Verify the node types
      expect(nodeTypes).toHaveLength(3);
      expect(nodeTypes).toContain('cube');
      expect(nodeTypes).toContain('sphere');
      expect(nodeTypes).toContain('cylinder');
    });

    test('should throw an error when registering with an empty node type', () => {
      // Attempt to register with an empty node type
      expect(() => registry.register('', mockHandler)).toThrow('Node type cannot be empty');
    });

    test('should throw an error when registering with a null handler', () => {
      // Attempt to register with a null handler
      expect(() => registry.register('cube', null as unknown as NodeHandler)).toThrow('Handler cannot be null or undefined');
    });
  });

  describe('NodeHandlerRegistryFactory', () => {
    test('should create a registry with all handlers registered', () => {
      // Create a registry
      const registry = NodeHandlerRegistryFactory.createRegistry();

      // Verify that handlers are registered
      expect(registry.hasHandler('cube')).toBe(true);
      expect(registry.hasHandler('sphere')).toBe(true);
      expect(registry.hasHandler('cylinder')).toBe(true);
      expect(registry.hasHandler('translate')).toBe(true);
      expect(registry.hasHandler('rotate')).toBe(true);
      expect(registry.hasHandler('scale')).toBe(true);
      expect(registry.hasHandler('union')).toBe(true);
      expect(registry.hasHandler('difference')).toBe(true);
      expect(registry.hasHandler('intersection')).toBe(true);
    });

    test('should register all primitive handlers', () => {
      // Create a registry
      const registry = NodeHandlerRegistryFactory.createRegistry();

      // Verify that primitive handlers are registered
      expect(registry.hasHandler('cube')).toBe(true);
      expect(registry.hasHandler('sphere')).toBe(true);
      expect(registry.hasHandler('cylinder')).toBe(true);
      expect(registry.hasHandler('polyhedron')).toBe(true);
      expect(registry.hasHandler('circle')).toBe(true);
      expect(registry.hasHandler('square')).toBe(true);
      expect(registry.hasHandler('polygon')).toBe(true);
      expect(registry.hasHandler('text')).toBe(true);
      expect(registry.hasHandler('linear_extrude')).toBe(true);
      expect(registry.hasHandler('rotate_extrude')).toBe(true);
    });

    test('should register all transformation handlers', () => {
      // Create a registry
      const registry = NodeHandlerRegistryFactory.createRegistry();

      // Verify that transformation handlers are registered
      expect(registry.hasHandler('translate')).toBe(true);
      expect(registry.hasHandler('rotate')).toBe(true);
      expect(registry.hasHandler('scale')).toBe(true);
      expect(registry.hasHandler('mirror')).toBe(true);
      expect(registry.hasHandler('multmatrix')).toBe(true);
      expect(registry.hasHandler('color')).toBe(true);
      expect(registry.hasHandler('offset')).toBe(true);
    });

    test('should register all CSG operation handlers', () => {
      // Create a registry
      const registry = NodeHandlerRegistryFactory.createRegistry();

      // Verify that CSG operation handlers are registered
      expect(registry.hasHandler('union')).toBe(true);
      expect(registry.hasHandler('difference')).toBe(true);
      expect(registry.hasHandler('intersection')).toBe(true);
      expect(registry.hasHandler('hull')).toBe(true);
      expect(registry.hasHandler('minkowski')).toBe(true);
    });

    test('should register all module and function handlers', () => {
      // Create a registry
      const registry = NodeHandlerRegistryFactory.createRegistry();

      // Verify that module and function handlers are registered
      expect(registry.hasHandler('module')).toBe(true);
      expect(registry.hasHandler('function')).toBe(true);
      expect(registry.hasHandler('children')).toBe(true);
    });
  });
});
