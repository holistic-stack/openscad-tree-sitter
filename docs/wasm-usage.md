# WebAssembly Usage Guide

This document provides guidance on using the OpenSCAD Tree-sitter grammar with WebAssembly.

## Building the WebAssembly Module

To build the WebAssembly module, run:

```bash
pnpm build:wasm
```

This will generate a `tree-sitter-openscad.wasm` file in the project root directory.

## Using in Node.js

### Basic Usage

```javascript
const { Parser } = require('web-tree-sitter');
const path = require('path');

async function parseOpenSCAD() {
  // Initialize the parser
  await Parser.init();
  const parser = new Parser();
  
  // Load the OpenSCAD language
  const wasmPath = path.join(__dirname, 'tree-sitter-openscad.wasm');
  const language = await Parser.Language.load(wasmPath);
  parser.setLanguage(language);
  
  // Parse OpenSCAD code
  const sourceCode = 'module test() { cube(10); }';
  const tree = parser.parse(sourceCode);
  
  console.log(tree.rootNode.toString());
}

parseOpenSCAD().catch(console.error);
```

## Using in Browsers

```html
<!DOCTYPE html>
<html>
<head>
  <title>OpenSCAD Parser</title>
  <script src="https://cdn.jsdelivr.net/npm/web-tree-sitter@0.22.4/tree-sitter.js"></script>
</head>
<body>
  <textarea id="code">module test() { cube(10); }</textarea>
  <button id="parse">Parse</button>
  <pre id="output"></pre>
  
  <script>
    const Parser = window.TreeSitter.Parser;
    let parser;
    
    async function initParser() {
      try {
        // Initialize Tree-sitter
        await Parser.init();
        parser = new Parser();
        
        // Load the OpenSCAD language
        const language = await TreeSitter.Language.load('tree-sitter-openscad.wasm');
        parser.setLanguage(language);
        
        document.getElementById('parse').disabled = false;
      } catch (error) {
        console.error('Error initializing parser:', error);
        document.getElementById('output').textContent = 'Error: ' + error.message;
      }
    }
    
    document.getElementById('parse').addEventListener('click', () => {
      if (!parser) return;
      
      const code = document.getElementById('code').value;
      try {
        const tree = parser.parse(code);
        document.getElementById('output').textContent = tree.rootNode.toString();
      } catch (error) {
        document.getElementById('output').textContent = 'Parse error: ' + error.message;
      }
    });
    
    // Initialize the parser when the page loads
    window.addEventListener('load', initParser);
  </script>
</body>
</html>
```

## Troubleshooting

### Common Issues

1. **WebAssembly file not found**
   - Ensure you've built the WebAssembly module with `pnpm build:wasm`
   - Check the file path is correct

2. **CORS errors in browser**
   - Serve the WebAssembly file with proper CORS headers
   - Use a local development server like `pnpm test:browser`

3. **Initialization errors**
   - Ensure you're calling `await Parser.init()` before creating a parser instance
   - Check for console errors that might indicate WebAssembly compatibility issues

## Testing

To test the WebAssembly build:

```bash
# Test in Node.js
pnpm test:wasm

# Test in a browser
pnpm test:browser
```
