# WebAssembly Usage Guide

This document provides comprehensive guidance on using the OpenSCAD Tree-sitter grammar with WebAssembly.

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
const fs = require('fs');
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

### Error Handling

Always wrap WebAssembly operations in try-catch blocks to handle potential errors:

```javascript
try {
  const language = await Parser.Language.load(wasmPath);
  parser.setLanguage(language);
} catch (error) {
  console.error('Error loading WebAssembly module:', error);
  // Fallback to alternative parser or show error message
}
```

## Using in Browsers

### HTML Setup

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

### CORS Considerations

When serving the WebAssembly file, ensure proper CORS headers are set:

```
Access-Control-Allow-Origin: *
Content-Type: application/wasm
```

### Browser Compatibility

The WebAssembly module has been tested with:

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

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

4. **Parse errors**
   - Validate your OpenSCAD code syntax
   - Check if the grammar supports all the features you're using

### Fallback Strategy

For production applications, implement a fallback strategy:

```javascript
async function createParser() {
  try {
    // Try WebAssembly parser first
    await Parser.init();
    const parser = new Parser();
    const language = await Parser.Language.load('tree-sitter-openscad.wasm');
    parser.setLanguage(language);
    return parser;
  } catch (wasmError) {
    console.warn('WebAssembly parser failed:', wasmError);
    
    try {
      // Try native parser as fallback
      const { Parser: NativeParser } = require('tree-sitter');
      const OpenSCAD = require('tree-sitter-openscad');
      
      const parser = new NativeParser();
      parser.setLanguage(OpenSCAD);
      return parser;
    } catch (nativeError) {
      console.error('Native parser failed:', nativeError);
      throw new Error('No parser available');
    }
  }
}
```

## Performance Considerations

- WebAssembly modules have a one-time initialization cost
- For best performance, initialize the parser once and reuse it
- Large files may cause performance issues in browsers
- Consider using web workers for parsing large files in browsers

## Advanced Usage

### Incremental Parsing

```javascript
let tree = parser.parse(initialCode);

// Later, when the code changes
tree = parser.parse(newCode, tree);
```

### Using with Web Workers

```javascript
// In main thread
const worker = new Worker('parser-worker.js');

worker.postMessage({
  type: 'parse',
  code: 'module test() { cube(10); }'
});

worker.onmessage = (event) => {
  console.log(event.data.tree);
};

// In parser-worker.js
importScripts('https://cdn.jsdelivr.net/npm/web-tree-sitter@0.22.4/tree-sitter.js');

const Parser = self.TreeSitter.Parser;
let parser;

async function initParser() {
  await Parser.init();
  parser = new Parser();
  
  const response = await fetch('tree-sitter-openscad.wasm');
  const wasmBuffer = await response.arrayBuffer();
  
  const language = await Parser.Language.load(wasmBuffer);
  parser.setLanguage(language);
  
  self.postMessage({ type: 'ready' });
}

self.onmessage = async (event) => {
  if (event.data.type === 'parse') {
    if (!parser) {
      await initParser();
    }
    
    const tree = parser.parse(event.data.code);
    self.postMessage({
      type: 'result',
      tree: tree.rootNode.toString()
    });
  }
};

initParser().catch(error => {
  self.postMessage({ type: 'error', message: error.message });
});
```

## Testing

To test the WebAssembly build:

```bash
# Test in Node.js
pnpm test:wasm

# Test in a browser
pnpm test:browser
```
