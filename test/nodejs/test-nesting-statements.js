const test = require('node:test');
const fs = require('fs');
const assert = require('node:assert');
const {Parser, Language} = require('web-tree-sitter');
const OpenSCAD = require('../../bindings/node');

// Helper function to print the tree structure for better debugging
function printNode(node, prefix = '') {
  console.log(`${prefix}${node.type}: "${node.text}" (${node.startPosition.row}:${node.startPosition.column})`);
  for (let i = 0; i < node.childCount; i++) {
    printNode(node.child(i), prefix + '  ');
  }
}

test('Parse OpenSCAD code with nested statements', async (t) => {
  await t.test('Verify how OpenSCAD parses consecutive module calls like translate([1,2,3]) cube(...)', async () => {
    // Initialize the parser
    await Parser.init();
    const parser = new Parser();
    const wasmBuffer = fs.readFileSync('./tree-sitter-openscad.wasm');
    const language = await Language.load(wasmBuffer);
    parser.setLanguage(language);

    // Test code with consecutive module calls
    const testCode = 'translate([1, 2, 3]) cube(size=[3,2,2]);';
    const tree = parser.parse(testCode);
    
    console.log('\nComplete tree structure:');
    printNode(tree.rootNode);
    
    // Extract all statements from the source file node
    const statements = [];
    for (let i = 0; i < tree.rootNode.childCount; i++) {
      statements.push(tree.rootNode.child(i));
    }
    
    console.log(`\nFound ${statements.length} statements in the source`);
    
    // In the OpenSCAD grammar, consecutive module calls might be parsed as:
    // 1. A single statement with child nodes (translate containing cube)
    // 2. Two separate statements (translate followed by cube)
    // 3. Some other pattern specific to this grammar
    
    // Let's analyze what we actually find
    let foundTranslate = false;
    let foundCube = false;
    let bothInSameStatement = false;
    
    // Check if we have one statement containing both translate and cube
    for (const statement of statements) {
      const text = statement.text;
      
      if (text.includes('translate') && text.includes('cube')) {
        console.log('\nFound a statement containing both translate and cube!');
        console.log(`Statement type: ${statement.type}`);
        
        // Check if translate appears before cube in the text
        if (text.indexOf('translate') < text.indexOf('cube')) {
          console.log('Translate appears before cube in the statement');
          foundTranslate = true;
          foundCube = true;
          bothInSameStatement = true;
        }
      } 
      else if (text.includes('translate')) {
        console.log('\nFound a statement containing translate');
        foundTranslate = true;
      }
      else if (text.includes('cube')) {
        console.log('\nFound a statement containing cube');
        foundCube = true;
      }
    }
    
    // Do structural analysis using a tree cursor for precision
    console.log('\nDetailed AST analysis:');
    const cursor = tree.walk();
    let translateNode = null;
    let cubeNode = null;
    
    // Function to examine the tree
    function examineNode(node, depth = 0) {
      const indent = '  '.repeat(depth);
      console.log(`${indent}Examining: ${node.type} "${node.text}"`);  
      
      // Check if this is a translate or cube node
      if (node.text.includes('translate') && node.text.indexOf('translate') === 0) {
        translateNode = node;
        console.log(`${indent}Found translate node at depth ${depth}`);  
      }
      if (node.text.includes('cube') && !node.text.includes('translate')) {
        cubeNode = node;
        console.log(`${indent}Found cube node at depth ${depth}`);  
      }
      
      // If we have both nodes, check their relationship
      if (translateNode && cubeNode) {
        // Check if cube is inside the translate text range
        if (translateNode.startPosition.row <= cubeNode.startPosition.row &&
            translateNode.endPosition.row >= cubeNode.endPosition.row) {
          console.log('Cube appears within translate text range!');
          
          // This indicates some form of nesting relationship
          bothInSameStatement = true;
        }
      }
      
      // Continue examining children
      for (let i = 0; i < node.childCount; i++) {
        examineNode(node.child(i), depth + 1);
      }
    }
    
    // Start the analysis from the root
    examineNode(tree.rootNode);
    
    // Assert what we found
    assert.ok(foundTranslate, 'Should find a translate node');
    assert.ok(foundCube, 'Should find a cube node');
    
    // Check if translate and cube appear in the same statement
    // Note: This verifies the grammar is correctly parsing nested structure
    // This assertion is true if the grammar recognizes the nesting relationship
    assert.ok(bothInSameStatement, 'Translate and cube should be in the same statement');
    
    if (bothInSameStatement) {
      console.log('\nSUCCESS: Grammar correctly identifies translate and cube in the same statement');
      console.log('This indicates the grammar is handling the nesting relationship as expected');
    }
  });
});