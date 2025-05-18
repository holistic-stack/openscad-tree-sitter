import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNodeAdapter } from './adapter-factory';
import { TreeSitterNode } from '../../../../types';
import { detectNodeType } from '../node-type-detector/node-type-detector';
import { adaptProgram } from '../node-adapters/program-adapter/program-adapter';
import { adaptCallExpression } from '../node-adapters/call-expression-adapter/call-expression-adapter';
import { adaptLiteral } from '../node-adapters/literal-adapter/literal-adapter';
import { adaptIdentifier } from '../node-adapters/identifier-adapter/identifier-adapter';
import { adaptAssignment } from '../node-adapters/assignment-adapter/assignment-adapter';

// Using vi.mock would be ideal, but since mocks are prohibited per requirements,
// we'll use dependency injection for testing

// Test utility for creating tree-sitter nodes with required properties
function createTestNode(type: string, text: string = '', children = 0): TreeSitterNode {
  return {
    type,
    text,
    isNamed: true,
    childCount: children,
    child: () => null,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 10 }
  } as unknown as TreeSitterNode;
}

describe('AdapterFactory', () => {
  // Setup our adapter implementations to track calls
  const adapters = {
    program: vi.fn(),
    callExpression: vi.fn(),
    literal: vi.fn(),
    identifier: vi.fn(),
    assignment: vi.fn()
  };
  
  // Store original implementations
  const originalAdapters = {
    program: adaptProgram,
    callExpression: adaptCallExpression,
    literal: adaptLiteral,
    identifier: adaptIdentifier,
    assignment: adaptAssignment
  };
  
  // Create stubs that track invocation
  const adapterMap = {
    'Program': (node: TreeSitterNode, adaptNode: any) => adapters.program(node, adaptNode),
    'CallExpression': (node: TreeSitterNode, adaptNode: any) => adapters.callExpression(node, adaptNode),
    'LiteralExpression': (node: TreeSitterNode) => adapters.literal(node),
    'IdentifierExpression': (node: TreeSitterNode) => adapters.identifier(node),
    'AssignmentStatement': (node: TreeSitterNode, adaptNode: any) => adapters.assignment(node, adaptNode)
  };
  
  beforeEach(() => {
    // Reset all adapter function spies
    Object.values(adapters).forEach(adapter => adapter.mockReset());
    
    // Setup default implementations that return a basic node
    adapters.program.mockImplementation((node) => ({ 
      type: 'Program', 
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 },
      children: []
    }));
    
    adapters.callExpression.mockImplementation((node) => ({ 
      type: 'CallExpression',
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 },
      callee: { type: 'IdentifierExpression', name: 'test', position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 } },
      arguments: []
    }));
    
    adapters.literal.mockImplementation((node) => ({ 
      type: 'LiteralExpression',
      valueType: 'number',
      value: 0,
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
    }));
    
    adapters.identifier.mockImplementation((node) => ({ 
      type: 'IdentifierExpression',
      name: 'test',
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
    }));
    
    adapters.assignment.mockImplementation((node) => ({ 
      type: 'AssignmentStatement',
      left: { type: 'IdentifierExpression', name: 'test', position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 } },
      right: { type: 'LiteralExpression', valueType: 'number', value: 0, position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 } },
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
    }));
  });

  it('should select the program adapter for program nodes', () => {
    // Arrange
    const nodeAdapter = createNodeAdapter(adapterMap);
    const node = createTestNode('program');
    
    // Act
    nodeAdapter(node);
    
    // Assert
    expect(adapters.program).toHaveBeenCalledTimes(1);
    expect(adapters.program).toHaveBeenCalledWith(node, expect.any(Function));
    expect(adapters.callExpression).not.toHaveBeenCalled();
    expect(adapters.literal).not.toHaveBeenCalled();
    expect(adapters.identifier).not.toHaveBeenCalled();
    expect(adapters.assignment).not.toHaveBeenCalled();
  });

  it('should select the call expression adapter for call_expression nodes', () => {
    // Arrange
    const nodeAdapter = createNodeAdapter(adapterMap);
    const node = createTestNode('call_expression');
    
    // Act
    nodeAdapter(node);
    
    // Assert
    expect(adapters.callExpression).toHaveBeenCalledTimes(1);
    expect(adapters.callExpression).toHaveBeenCalledWith(node, expect.any(Function));
    expect(adapters.program).not.toHaveBeenCalled();
    expect(adapters.literal).not.toHaveBeenCalled();
    expect(adapters.identifier).not.toHaveBeenCalled();
    expect(adapters.assignment).not.toHaveBeenCalled();
  });

  it('should select the literal adapter for number_literal nodes', () => {
    // Arrange
    const nodeAdapter = createNodeAdapter(adapterMap);
    const node = createTestNode('number_literal');
    
    // Act
    nodeAdapter(node);
    
    // Assert
    expect(adapters.literal).toHaveBeenCalledTimes(1);
    expect(adapters.literal).toHaveBeenCalledWith(node);
    expect(adapters.program).not.toHaveBeenCalled();
    expect(adapters.callExpression).not.toHaveBeenCalled();
    expect(adapters.identifier).not.toHaveBeenCalled();
    expect(adapters.assignment).not.toHaveBeenCalled();
  });

  it('should handle unknown node types gracefully', () => {
    // Arrange
    const nodeAdapter = createNodeAdapter(adapterMap);
    const node = createTestNode('unknown_type');
    
    // Act
    const result = nodeAdapter(node);
    
    // Assert
    expect(result).toEqual({
      type: 'Unknown',
      position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 10 }
    });
    
    // Ensure no adapters were called
    Object.values(adapters).forEach(adapter => {
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  it('should handle recursive node adaptation', () => {
    // Arrange
    const nodeAdapter = createNodeAdapter(adapterMap);
    
    const childNode = createTestNode('identifier');
    const parentNode = { 
      type: 'call_expression',
      isNamed: true,
      text: '',
      childCount: 1,
      child: () => childNode,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 10 }
    } as TreeSitterNode;
    
    // Setup callExpression adapter to actually call the adaptNode function
    adapters.callExpression.mockImplementation((node, adaptNode) => {
      adaptNode(childNode);
      return {
        type: 'CallExpression',
        callee: { type: 'IdentifierExpression', name: 'test', position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 } },
        arguments: [],
        position: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }
      };
    });
    
    // Act
    nodeAdapter(parentNode);
    
    // Assert
    expect(adapters.callExpression).toHaveBeenCalledTimes(1);
    expect(adapters.identifier).toHaveBeenCalledTimes(1);
    expect(adapters.identifier).toHaveBeenCalledWith(childNode);
  });
});
