/**
 * @file test-all.js
 * @description Run all tests for the OpenSCAD Tree-sitter grammar
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Helper function to run a command and log the output
function runCommand(command, description) {
  console.log(`\n${colors.bright}${colors.fg.cyan}=== ${description} ===${colors.reset}\n`);
  
  try {
    const output = execSync(command, { stdio: 'inherit' });
    console.log(`\n${colors.fg.green}✓ ${description} completed successfully${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`\n${colors.fg.red}✗ ${description} failed${colors.reset}\n`);
    console.error(error.message);
    return false;
  }
}

// Main function to run all tests
async function main() {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== OpenSCAD Tree-sitter Grammar Test Suite ===${colors.reset}\n`);
  
  // Step 1: Generate the parser
  if (!runCommand('npx tree-sitter generate', 'Generate parser')) {
    process.exit(1);
  }
  
  // Step 2: Run the tree-sitter tests
  if (!runCommand('npx tree-sitter test', 'Run tree-sitter tests')) {
    process.exit(1);
  }
  
  // Step 3: Run the Vitest tests
  if (!runCommand('npx vitest run', 'Run Vitest tests')) {
    process.exit(1);
  }
  
  // Step 4: Test parsing real-world examples
  const examplesDir = path.join(__dirname, '../examples');
  const examples = fs.readdirSync(examplesDir)
    .filter(file => file.endsWith('.scad'))
    .map(file => path.join(examplesDir, file));
  
  console.log(`\n${colors.bright}${colors.fg.cyan}=== Testing real-world examples ===${colors.reset}\n`);
  
  let allExamplesSucceeded = true;
  
  for (const example of examples) {
    const relativePath = path.relative(process.cwd(), example);
    
    try {
      console.log(`Testing ${relativePath}...`);
      execSync(`npx tree-sitter parse ${example}`, { stdio: 'ignore' });
      console.log(`${colors.fg.green}✓ ${relativePath} parsed successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.fg.red}✗ ${relativePath} failed to parse${colors.reset}`);
      console.error(error.message);
      allExamplesSucceeded = false;
    }
  }
  
  if (!allExamplesSucceeded) {
    console.error(`\n${colors.fg.red}✗ Some examples failed to parse${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`\n${colors.fg.green}✓ All examples parsed successfully${colors.reset}\n`);
  
  // Step 5: Build the WebAssembly version
  if (!runCommand('npx tree-sitter build --wasm', 'Build WebAssembly version')) {
    process.exit(1);
  }
  
  // Step 6: Test the WebAssembly version
  if (!runCommand('node test/nodejs/test-wasm-build.js', 'Test WebAssembly build')) {
    process.exit(1);
  }
  
  // All tests passed
  console.log(`\n${colors.bright}${colors.fg.green}=== All tests passed! ===${colors.reset}\n`);
}

main().catch(error => {
  console.error(`\n${colors.fg.red}An error occurred:${colors.reset}\n`, error);
  process.exit(1);
});
