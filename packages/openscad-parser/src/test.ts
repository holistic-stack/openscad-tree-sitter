import { OpenscadParser } from './lib/openscad-parser/openscad-parser';

async function testParser() {
  try {
    console.log('Creating parser...');
    const parser = new OpenscadParser();
    
    console.log('Initializing parser...');
    await parser.init();
    
    console.log('Parsing OpenSCAD code...');
    const code = 'cube([10, 10, 10]);';
    const tree = parser.parse(code);
    
    console.log('Parse tree:');
    console.log(tree.rootNode.toString());
    
    console.log('Cleaning up...');
    parser.dispose();
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

testParser().catch(console.error);
