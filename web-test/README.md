# OpenSCAD Tree-sitter WebAssembly Test

This directory contains a minimal viable test for the OpenSCAD Tree-sitter grammar using WebAssembly in a web browser.

## Prerequisites

Before using this test, you need to build the WebAssembly version of the parser:

1. Install Emscripten:
   ```bash
   # On Windows, follow the instructions at:
   # https://emscripten.org/docs/getting_started/downloads.html
   ```

2. Build the WebAssembly module:
   ```bash
   # From the root directory of the project
   npx tree-sitter build --wasm
   ```

3. Copy the resulting WASM file to the web-test directory:
   ```bash
   # From the root directory of the project
   cp tree-sitter-openscad.wasm web-test/
   ```

## Running the Test

There are several ways to run the test:

### Using a Local Web Server

1. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/web-test/
   ```

### Using Visual Studio Code

If you're using Visual Studio Code, you can use the Live Server extension:

1. Install the "Live Server" extension
2. Right-click on `web-test/index.html` and select "Open with Live Server"

## Using the Test Page

The test page provides:

1. A dropdown menu to select example OpenSCAD code
2. A text area to edit or enter your own OpenSCAD code
3. A "Parse" button to trigger parsing
4. An output area showing the parse tree result

## Troubleshooting

If you encounter issues:

1. **WASM file not found**: Make sure you've built the WebAssembly module and copied it to the web-test directory
2. **CORS errors**: You must use a web server, opening the HTML file directly might cause CORS issues
3. **Parser initialization fails**: Check the browser console for more detailed error messages

## Building a Complete WebAssembly Integration

For a complete WebAssembly integration in a real application:

1. Create a proper npm package for browser use
2. Add TypeScript typings for improved developer experience
3. Implement proper error handling and recovery
4. Add syntax highlighting and code navigation using the query files
5. Consider using a bundler like webpack or rollup 