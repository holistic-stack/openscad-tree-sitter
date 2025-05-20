const Parser = require('tree-sitter');
const fs = require('fs');

async function main() {
  const parser = new Parser();

  try {
    const language = await Parser.Language.load('./tree-sitter-openscad.wasm');
    parser.setLanguage(language);

    const sourceCode = fs.readFileSync('test.scad', 'utf8');
    const tree = parser.parse(sourceCode);

    console.log('Source code:', sourceCode);
    console.log('\nTree structure:');
    console.log(JSON.stringify(formatNode(tree.rootNode), null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  function formatNode(node) {
    const result = {
      type: node.type,
      text: node.text,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      children: []
    };

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        result.children.push(formatNode(child));
      }
    }

    return result;
  }
}

main().catch(console.error);
