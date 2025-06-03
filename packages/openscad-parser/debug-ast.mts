import Parser from 'web-tree-sitter';
import OpenSCAD from '@openscad/tree-sitter-openscad';

async function runDebug() {
  await Parser.init();
  const parser = new Parser();
  parser.setLanguage(OpenSCAD);

  const sourceCode = `foo();`;
  const tree = parser.parse(sourceCode);

  console.log(tree.rootNode.toString());
}

runDebug();
