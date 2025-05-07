/**
 * @file serve-browser-test.js
 * @description Simple HTTP server to test the WebAssembly build in a browser
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const PORT = 3000;
const WASM_FILE = 'tree-sitter-openscad.wasm';
const HTML_FILE = 'test/browser/index.html';
const IMPROVED_HTML_FILE = 'test/browser/improved-index.html';

// Check if we should use the improved version
const useImproved = process.argv.includes('improved');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Check if the WebAssembly file exists
function checkWasmFile() {
  const wasmPath = path.join(__dirname, '..', WASM_FILE);

  if (!fs.existsSync(wasmPath)) {
    console.log(`WebAssembly file not found at: ${wasmPath}`);
    console.log('Building WebAssembly file...');

    try {
      exec('npx tree-sitter build --wasm', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error building WebAssembly file: ${error.message}`);
          console.error(stderr);
          return;
        }

        console.log(stdout);
        console.log('WebAssembly file built successfully.');

        if (fs.existsSync(wasmPath)) {
          console.log(`WebAssembly file created at: ${wasmPath}`);
        } else {
          console.error(`WebAssembly file still not found at: ${wasmPath}`);
        }
      });
    } catch (error) {
      console.error(`Error running build command: ${error.message}`);
    }
  } else {
    console.log(`WebAssembly file found at: ${wasmPath}`);
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Get the file path
  let filePath = path.join(__dirname, '..');

  if (req.url === '/' || req.url === '/index.html') {
    // Use the improved version if specified
    filePath = path.join(filePath, useImproved ? IMPROVED_HTML_FILE : HTML_FILE);
  } else {
    filePath = path.join(filePath, req.url);
  }

  // Get the file extension
  const extname = path.extname(filePath);

  // Set the content type
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end(`File not found: ${req.url}`);
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Using ${useImproved ? 'improved' : 'standard'} browser test page`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}/`);

  // Check if the WebAssembly file exists
  checkWasmFile();

  // Open the browser (platform-specific)
  const url = `http://localhost:${PORT}/`;
  let command;

  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }

  try {
    exec(command);
  } catch (error) {
    console.log(`Could not open browser automatically. Please open ${url} manually.`);
  }
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
