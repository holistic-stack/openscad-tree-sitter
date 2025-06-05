const { EnhancedOpenscadParser } = require('./packages/openscad-parser/dist/lib/enhanced-parser.js');

async function debugAssert() {
  const parser = new EnhancedOpenscadParser();
  
  try {
    await parser.init();
    console.log('Parser initialized successfully');
    
    const code = 'assert(true);';
    console.log('Parsing code:', code);
    
    const ast = parser.parseAST(code);
    console.log('AST result:', JSON.stringify(ast, null, 2));
    console.log('AST length:', ast.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    parser.dispose();
  }
}

debugAssert();
