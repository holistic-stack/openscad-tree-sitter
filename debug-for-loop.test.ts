import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenscadParser } from './packages/openscad-parser/src/lib/openscad-parser';

describe('Debug For Loop Parsing', () => {
  let parser: OpenscadParser;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should show what CST node type is produced for for loops', async () => {
    const code = 'for (i = [0:10]) { cube(i); }';
    console.log('Parsing:', code);
    
    // Get the tree directly to see the CST structure
    const tree = parser.parseToTree(code);
    const rootNode = tree.rootNode;
    
    console.log('Root node type:', rootNode.type);
    console.log('Root node text:', rootNode.text);
    console.log('Root node children count:', rootNode.childCount);
    
    for (let i = 0; i < rootNode.childCount; i++) {
      const child = rootNode.child(i);
      if (child) {
        console.log(`Child ${i}: type=${child.type}, text="${child.text}"`);
        
        // If it's a statement, look at its children
        if (child.type === 'statement') {
          for (let j = 0; j < child.childCount; j++) {
            const grandchild = child.child(j);
            if (grandchild) {
              console.log(`  Grandchild ${j}: type=${grandchild.type}, text="${grandchild.text}"`);
            }
          }
        }
      }
    }
    
    // Now try to parse with the AST generator
    try {
      const ast = parser.parse(code);
      console.log('AST result:', JSON.stringify(ast, null, 2));
    } catch (error) {
      console.error('Parse error:', error);
    }
  });
});
