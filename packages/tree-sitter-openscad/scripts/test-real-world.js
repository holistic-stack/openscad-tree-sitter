#!/usr/bin/env node

/**
 * Comprehensive Real-World Testing Script for OpenSCAD Tree-sitter Grammar
 * 
 * This script tests the optimized OpenSCAD tree-sitter grammar against real-world
 * OpenSCAD files to validate production readiness and comprehensive language support.
 * 
 * Features:
 * - Parses all .scad files in the examples/real-world directory
 * - Measures parsing performance (bytes/ms) for each file
 * - Validates parsing success and reports any errors
 * - Analyzes AST structure and language features used
 * - Generates comprehensive test report
 */

const fs = require('fs');
const path = require('path');
const Parser = require('tree-sitter');

// Try to load the OpenSCAD grammar
let OpenSCAD;
try {
  // Try different import paths for the grammar
  try {
    // First try the built native binding
    OpenSCAD = require('./build/Release/tree_sitter_openscad_binding');
    console.log('✓ Loaded native OpenSCAD grammar binding');
  } catch (e) {
    try {
      // Try the node bindings
      OpenSCAD = require('../bindings/node');
      console.log('✓ Loaded OpenSCAD grammar from bindings/node');
    } catch (e2) {
      try {
        // Try loading from the current directory
        OpenSCAD = require('../src');
        console.log('✓ Loaded OpenSCAD grammar from src/index.js');
      } catch (e3) {
        console.error('Failed to load OpenSCAD grammar. Please build the grammar first:');
        console.error('  pnpm build:grammar:native');
        console.error('Available files:');
        console.error('  - build/Release/tree_sitter_openscad_binding.node');
        console.error('  - bindings/node/index.js');
        console.error('  - src/index.js');
        process.exit(1);
      }
    }
  }
} catch (error) {
  console.error('Error loading OpenSCAD grammar:', error.message);
  process.exit(1);
}

// Configuration
const EXAMPLES_DIR = path.join(__dirname, 'examples', 'real-world');
const OUTPUT_FILE = path.join(__dirname, 'real-world-test-report.json');

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  grammarOptimization: 'range/vector conflicts eliminated',
  summary: {
    totalFiles: 0,
    successfulParses: 0,
    failedParses: 0,
    totalBytes: 0,
    totalParseTime: 0,
    averageSpeed: 0
  },
  files: [],
  errors: [],
  languageFeatures: new Set(),
  performanceMetrics: {
    fastest: null,
    slowest: null,
    largest: null,
    smallest: null
  }
};

/**
 * Initialize the parser with OpenSCAD grammar
 */
function createParser() {
  const parser = new Parser();
  parser.setLanguage(OpenSCAD);
  return parser;
}

/**
 * Analyze AST to identify OpenSCAD language features
 */
function analyzeLanguageFeatures(node, features = new Set()) {
  if (!node) return features;
  
  // Add the node type to features
  features.add(node.type);
  
  // Recursively analyze children
  for (let i = 0; i < node.childCount; i++) {
    analyzeLanguageFeatures(node.child(i), features);
  }
  
  return features;
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

/**
 * Parse a single OpenSCAD file and collect metrics
 */
function parseFile(filePath, parser) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const fileSize = content.length;
  
  console.log(`\nParsing: ${fileName} (${fileSize} bytes)`);
  
  const result = {
    fileName,
    filePath: path.relative(__dirname, filePath),
    fileSize,
    success: false,
    parseTime: 0,
    speed: 0,
    nodeCount: 0,
    depth: 0,
    languageFeatures: [],
    errors: []
  };
  
  try {
    const startTime = process.hrtime.bigint();
    const tree = parser.parse(content);
    const endTime = process.hrtime.bigint();
    
    result.parseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    result.speed = fileSize / result.parseTime; // bytes per millisecond
    
    if (tree && tree.rootNode) {
      result.success = true;
      result.nodeCount = countNodes(tree.rootNode);
      result.depth = getTreeDepth(tree.rootNode);
      
      // Analyze language features
      const features = analyzeLanguageFeatures(tree.rootNode);
      result.languageFeatures = Array.from(features).sort();
      
      // Add to global language features set
      features.forEach(feature => testResults.languageFeatures.add(feature));
      
      // Check for parsing errors
      if (tree.rootNode.hasError()) {
        result.errors.push('Parse tree contains ERROR nodes');
        findErrorNodes(tree.rootNode, result.errors);
      }
      
      console.log(`  ✓ Success: ${result.nodeCount} nodes, ${result.depth} depth, ${result.speed.toFixed(2)} bytes/ms`);
    } else {
      result.errors.push('Failed to generate parse tree');
      console.log(`  ✗ Failed: No parse tree generated`);
    }
  } catch (error) {
    result.errors.push(`Parse error: ${error.message}`);
    console.log(`  ✗ Error: ${error.message}`);
  }
  
  return result;
}

/**
 * Count total nodes in the AST
 */
function countNodes(node) {
  let count = 1;
  for (let i = 0; i < node.childCount; i++) {
    count += countNodes(node.child(i));
  }
  return count;
}

/**
 * Get maximum depth of the AST
 */
function getTreeDepth(node, currentDepth = 0) {
  let maxDepth = currentDepth;
  for (let i = 0; i < node.childCount; i++) {
    const childDepth = getTreeDepth(node.child(i), currentDepth + 1);
    maxDepth = Math.max(maxDepth, childDepth);
  }
  return maxDepth;
}

/**
 * Find and report ERROR nodes in the AST
 */
function findErrorNodes(node, errors, path = []) {
  if (node.type === 'ERROR') {
    errors.push(`ERROR node at ${path.join(' > ')}: "${node.text}"`);
  }
  
  for (let i = 0; i < node.childCount; i++) {
    findErrorNodes(node.child(i), errors, [...path, `${node.type}[${i}]`]);
  }
}

/**
 * Get all .scad files in the examples directory
 */
function getScadFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.error(`Examples directory not found: ${dir}`);
    return files;
  }
  
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && entry.endsWith('.scad')) {
      files.push(fullPath);
    }
  }
  
  return files.sort();
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(result) {
  const metrics = testResults.performanceMetrics;
  
  // Fastest parsing speed
  if (!metrics.fastest || result.speed > metrics.fastest.speed) {
    metrics.fastest = {
      fileName: result.fileName,
      speed: result.speed,
      fileSize: result.fileSize
    };
  }
  
  // Slowest parsing speed
  if (!metrics.slowest || result.speed < metrics.slowest.speed) {
    metrics.slowest = {
      fileName: result.fileName,
      speed: result.speed,
      fileSize: result.fileSize
    };
  }
  
  // Largest file
  if (!metrics.largest || result.fileSize > metrics.largest.fileSize) {
    metrics.largest = {
      fileName: result.fileName,
      fileSize: result.fileSize,
      speed: result.speed
    };
  }
  
  // Smallest file
  if (!metrics.smallest || result.fileSize < metrics.smallest.fileSize) {
    metrics.smallest = {
      fileName: result.fileName,
      fileSize: result.fileSize,
      speed: result.speed
    };
  }
}

/**
 * Generate and save comprehensive test report
 */
function generateReport() {
  // Convert Set to Array for JSON serialization
  testResults.languageFeatures = Array.from(testResults.languageFeatures).sort();
  
  // Calculate summary statistics
  const summary = testResults.summary;
  summary.averageSpeed = summary.totalBytes / summary.totalParseTime;
  summary.successRate = (summary.successfulParses / summary.totalFiles * 100).toFixed(2);
  
  // Save detailed report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testResults, null, 2));
  
  // Print summary to console
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE REAL-WORLD TESTING REPORT');
  console.log('='.repeat(80));
  console.log(`Grammar Optimization: ${testResults.grammarOptimization}`);
  console.log(`Test Timestamp: ${testResults.timestamp}`);
  console.log();
  
  console.log('SUMMARY STATISTICS:');
  console.log(`  Total Files Tested: ${summary.totalFiles}`);
  console.log(`  Successful Parses: ${summary.successfulParses}`);
  console.log(`  Failed Parses: ${summary.failedParses}`);
  console.log(`  Success Rate: ${summary.successRate}%`);
  console.log(`  Total Content: ${summary.totalBytes.toLocaleString()} bytes`);
  console.log(`  Average Speed: ${summary.averageSpeed.toFixed(2)} bytes/ms`);
  console.log();
  
  console.log('PERFORMANCE METRICS:');
  if (testResults.performanceMetrics.fastest) {
    console.log(`  Fastest Parse: ${testResults.performanceMetrics.fastest.fileName} (${testResults.performanceMetrics.fastest.speed.toFixed(2)} bytes/ms)`);
  }
  if (testResults.performanceMetrics.slowest) {
    console.log(`  Slowest Parse: ${testResults.performanceMetrics.slowest.fileName} (${testResults.performanceMetrics.slowest.speed.toFixed(2)} bytes/ms)`);
  }
  if (testResults.performanceMetrics.largest) {
    console.log(`  Largest File: ${testResults.performanceMetrics.largest.fileName} (${testResults.performanceMetrics.largest.fileSize.toLocaleString()} bytes)`);
  }
  if (testResults.performanceMetrics.smallest) {
    console.log(`  Smallest File: ${testResults.performanceMetrics.smallest.fileName} (${testResults.performanceMetrics.smallest.fileSize.toLocaleString()} bytes)`);
  }
  console.log();
  
  console.log(`LANGUAGE FEATURES DETECTED (${testResults.languageFeatures.length} total):`);
  const features = testResults.languageFeatures;
  for (let i = 0; i < features.length; i += 4) {
    const row = features.slice(i, i + 4);
    console.log(`  ${row.join(', ')}`);
  }
  console.log();
  
  if (testResults.errors.length > 0) {
    console.log('PARSING ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`  ✗ ${error}`);
    });
    console.log();
  }
  
  console.log(`Detailed report saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(80));
}

/**
 * Main testing function
 */
function main() {
  console.log('OpenSCAD Tree-sitter Grammar - Real-World Testing');
  console.log('='.repeat(60));
  console.log('Testing optimized grammar (range/vector conflicts eliminated)');
  
  // Initialize parser
  const parser = createParser();
  console.log('✓ Parser initialized with OpenSCAD grammar');
  
  // Get all .scad files
  const scadFiles = getScadFiles(EXAMPLES_DIR);
  console.log(`✓ Found ${scadFiles.length} .scad files in ${EXAMPLES_DIR}`);
  
  if (scadFiles.length === 0) {
    console.log('No .scad files found to test.');
    return;
  }
  
  testResults.summary.totalFiles = scadFiles.length;
  
  // Parse each file
  for (const filePath of scadFiles) {
    const result = parseFile(filePath, parser);
    testResults.files.push(result);
    
    // Update summary statistics
    testResults.summary.totalBytes += result.fileSize;
    testResults.summary.totalParseTime += result.parseTime;
    
    if (result.success) {
      testResults.summary.successfulParses++;
      updatePerformanceMetrics(result);
    } else {
      testResults.summary.failedParses++;
      testResults.errors.push(`${result.fileName}: ${result.errors.join(', ')}`);
    }
  }
  
  // Generate comprehensive report
  generateReport();
  
  // Exit with appropriate code
  process.exit(testResults.summary.failedParses > 0 ? 1 : 0);
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  createParser,
  parseFile,
  analyzeLanguageFeatures,
  getScadFiles
};
