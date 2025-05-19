const Parser = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

// Define a simple interface for the node structure
interface TreeNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  childCount: number;
  children: TreeNode[];
  isNamed: boolean;
  hasError: boolean;
  isMissing: boolean;
}

// Output file for logging
const OUTPUT_FILE = path.join(__dirname, '..', 'debug-ast-output.txt');

// Clear the output file
if (fs.existsSync(OUTPUT_FILE)) {
  fs.writeFileSync(OUTPUT_FILE, '', 'utf-8');
}

// Helper function to log to both console and file
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
  
  // Log to console
  console.log(logMessage);
  
  // Append to file
  fs.appendFileSync(OUTPUT_FILE, logMessage + '\n\n', 'utf-8');
};

async function main() {
    log('=== Starting AST Debug ===');
  
  // Initialize the parser
  log('Initializing parser...');
  await Parser.init();
  const parser = new Parser();
  
  const code = 'cube(10);';
  log('=== Input Code ===', code);
  
  // Log character positions
  const charPositions: Array<{
    position: number;
    char: string;
    charCode: number;
  }> = [];
  
  for (let i = 0; i < code.length; i++) {
    charPositions.push({
      position: i,
      char: code[i],
      charCode: code.charCodeAt(i)
    });
  }
  log('=== Character Positions ===', JSON.stringify(charPositions, null, 2));
  
  try {
    // Parse the code with the built-in JavaScript grammar (for testing)
    log('Parsing code...');
    const tree = parser.parse(code);
    
    if (!tree) {
      log('Error: Failed to parse code');
      return;
    }
    
    log('=== Parse Tree Created ===');
    
    // Function to convert a tree-sitter node to our TreeNode format
    const toTreeNode = (node: any): TreeNode => {
      const children: TreeNode[] = [];
      
      // Build children array
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          children.push(toTreeNode(child));
        }
      }
      
      return {
        type: node.type,
        text: node.text,
        startPosition: {
          row: node.startPosition.row,
          column: node.startPosition.column
        },
        endPosition: {
          row: node.endPosition.row,
          column: node.endPosition.column
        },
        childCount: node.childCount,
        children,
        isNamed: node.isNamed(),
        hasError: node.hasError(),
        isMissing: node.isMissing()
      };
    };
    
    // Function to log node information
    const logNode = (node: any, depth = 0) => {
      const indent = '  '.repeat(depth);
      const nodeInfo = {
        type: node.type,
        text: node.text,
        start: `${node.startPosition.row}:${node.startPosition.column}`,
        end: `${node.endPosition.row}:${node.endPosition.column}`,
        childCount: node.childCount,
        isNamed: node.isNamed(),
        hasError: node.hasError(),
        isMissing: node.isMissing()
      };
      
      log(`${indent}${node.type}: '${node.text.replace(/\n/g, '\\n')}'`, nodeInfo);
      
      // Log children
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          logNode(child, depth + 1);
        }
      }
    };
    
    // Function to print tree structure
    const printTree = (node: any, prefix = '', isLast = true) => {
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';
      
      log(prefix + currentPrefix + `${node.type}: '${node.text.replace(/\n/g, '\\n')}'`);
      
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          const isLastChild = i === node.childCount - 1;
          printTree(child, prefix + nextPrefix, isLastChild);
        }
      }
    };
    
    // Log the root node and its children
    log('=== AST Structure ===');
    
    // Log basic tree structure
    log('=== Basic Tree Structure ===');
    log(JSON.stringify({
      type: tree.rootNode.type,
      text: tree.rootNode.text,
      childCount: tree.rootNode.childCount,
      startPosition: tree.rootNode.startPosition,
      endPosition: tree.rootNode.endPosition,
      hasError: tree.rootNode.hasError(),
      isMissing: tree.rootNode.isMissing(),
      isNamed: tree.rootNode.isNamed()
    }, null, 2));
    
    // Find all nodes with text 'cube'
    log('=== Finding Text Matches ===');
    const findText = (node: any, text: string, path: string[] = []): any[] => {
      const results: any[] = [];
      const currentPath = [...path, node.type];
      
      if (node.text && node.text.includes(text)) {
        results.push({
          path: currentPath.join(' > '),
          type: node.type,
          text: node.text,
          start: node.startPosition ? `${node.startPosition.row}:${node.startPosition.column}` : 'unknown',
          end: node.endPosition ? `${node.endPosition.row}:${node.endPosition.column}` : 'unknown',
          isNamed: node.isNamed ? node.isNamed() : false,
          hasError: node.hasError ? node.hasError() : false,
          isMissing: node.isMissing ? node.isMissing() : false,
          childCount: node.childCount || 0
        });
      }
      
      if (node.childCount) {
        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (child) {
            results.push(...findText(child, text, currentPath));
          }
        }
      }
      
      return results;
    };
    
    const matches = findText(tree.rootNode, 'cube');
    log('=== Text Matches ===', JSON.stringify(matches, null, 2));
    
    // Log all node types (first level only for simplicity)
    log('=== First Level Node Types ===');
    const nodeTypes = new Set();
    for (let i = 0; i < tree.rootNode.childCount; i++) {
      const child = tree.rootNode.child(i);
      if (child) {
        nodeTypes.add(child.type);
      }
    }
    log(JSON.stringify(Array.from(nodeTypes).sort(), null, 2));
    
    // Log a simplified version of the tree
    log('=== Simplified Tree ===');
    const simplifyNode = (node: any) => {
      if (!node) return null;
      
      const result: any = {
        type: node.type,
        text: node.text || '',
        childCount: node.childCount || 0
      };
      
      if (node.startPosition) result.start = node.startPosition;
      if (node.endPosition) result.end = node.endPosition;
      
      if (node.childCount > 0) {
        result.children = [];
        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (child) {
            result.children.push(simplifyNode(child));
          }
        }
      }
      
      return result;
    };
    
    log(JSON.stringify(simplifyNode(tree.rootNode), null, 2));
    
    log('=== Test Completed Successfully ===');
    log(`=== Output saved to: ${path.resolve(OUTPUT_FILE)} ===`);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };
    log('=== Error ===', errorMessage);
  } finally {
    // Cleanup
    parser.delete();
  }
}

// Run the debug script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
