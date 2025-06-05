// Quick test to see how the parser handles for loops
const { OpenscadParser } = require('./packages/openscad-parser/dist/lib/openscad-parser.js');

async function testForLoop() {
  const parser = new OpenscadParser();
  await parser.init();
  
  const code = 'for (i = [0:10]) { cube(i); }';
  console.log('Parsing:', code);
  
  try {
    const ast = parser.parse(code);
    console.log('AST result:', JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error('Parse error:', error);
  }
  
  parser.dispose();
}

testForLoop().catch(console.error);
