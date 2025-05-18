import { describe, it, expect } from 'vitest';
// Using relative import
import { adaptProgram } from './program-adapter';

// Make TypeScript ignore errors in this test file
// @ts-nocheck

// Define minimal interfaces needed for testing to avoid external dependencies
interface Point {
  row: number;
  column: number;
}

interface ASTPosition {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

interface ASTNode {
  type: string;
  position: ASTPosition;
}

interface Program extends ASTNode {
  type: 'Program';
  children: ASTNode[];
}

interface TreeSitterNode {
  id?: number;
  type: string;
  startPosition: Point;
  endPosition: Point;
  childCount: number;
  isNamed?: boolean;
  child: (index: number) => TreeSitterNode | null;
}

// Create test utilities (no mocks)
function createTestPositionExtractor() {
  return (node: TreeSitterNode): ASTPosition => ({
    startLine: node.startPosition.row,
    startColumn: node.startPosition.column,
    endLine: node.endPosition.row,
    endColumn: node.endPosition.column
  });
}

function createTestNode(type: string, childNodes: TreeSitterNode[] = []): TreeSitterNode {
  return {
    id: Math.floor(Math.random() * 1000),
    type,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 10 },
    childCount: childNodes.length,
    isNamed: true,
    child: (index: number) => childNodes[index] ?? null
  };
}

describe('ProgramAdapter', () => {

  it('should adapt an empty program node', () => {
    // Arrange
    const node = createTestNode('program');
    const extractPosition = createTestPositionExtractor();
    
    // Create tracking adapter function to verify which nodes are processed
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      return {
        type: 'Unknown',
        position: extractPosition(n)
      };
    };
    
    // Act
    const result = adaptProgram(node, adaptNode);

    // Assert
    expect(result).toEqual({
      type: 'Program',
      position: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 10
      },
      children: []
    });
    
    // Verify no nodes were processed
    expect(processedNodes).toEqual([]);
  });

  it('should adapt a program node with children', () => {
    // Arrange
    const childNode1 = createTestNode('call_expression'); 
    childNode1.isNamed = true;
    
    const childNode2 = createTestNode(';');
    childNode2.isNamed = false;
    
    const childNode3 = createTestNode('assignment');
    childNode3.isNamed = true;
    
    // Create parent node with children
    const node = createTestNode('program', [childNode1, childNode2, childNode3]);
    
    // Create tracking adapter function to verify which nodes are processed
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      return {
        type: n.type === 'call_expression' ? 'CallExpression' : 
              n.type === 'assignment' ? 'AssignmentStatement' : 'Unknown',
        position: createTestPositionExtractor()(n)
      };
    };

    // Act
    const result = adaptProgram(node, adaptNode);

    // Assert
    expect(result).toEqual({
      type: 'Program',
      position: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 10
      },
      children: [adaptNode(childNode1), adaptNode(childNode3)]
    });
    // Verify that both named nodes were processed (in any order)
    expect(processedNodes.includes('call_expression')).toBe(true);
    expect(processedNodes.includes('assignment')).toBe(true);
    expect(processedNodes.includes(';')).toBe(false);
  });

  it('should filter out non-named and semicolon nodes', () => {
    // Arrange
    const childNode1 = createTestNode(';'); 
    childNode1.isNamed = false;
    
    const childNode2 = createTestNode('unknown');
    childNode2.isNamed = true;
    
    // Create parent node with children
    const node = createTestNode('program', [childNode1, childNode2]);
    
    // Create tracking adapter function to verify which nodes are processed
    const processedNodes: string[] = [];
    const adaptNode = (n: TreeSitterNode): ASTNode => {
      processedNodes.push(n.type);
      return {
        type: 'Unknown',
        position: createTestPositionExtractor()(n)
      };
    };

    // Act
    const result = adaptProgram(node, adaptNode);

    // Assert
    // Verify that only one child was processed (the named one)
    expect(result.children.length).toBe(1);
    expect(result.children[0].type).toBe('Unknown');
    
    // Verify that only the named node was processed
    expect(processedNodes).toEqual(['unknown']);
  });
});
