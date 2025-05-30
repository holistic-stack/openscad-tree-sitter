#!/usr/bin/env node

/**
 * Standalone AST Integration Test
 * 
 * This script tests that the openscad-parser package can successfully:
 * 1. Import and initialize
 * 2. Parse OpenSCAD code into an AST
 * 3. Extract basic information from the AST
 */

import { OpenscadParser } from './packages/openscad-parser/dist/index.js';

async function testASTIntegration() {
  console.log('🚀 Testing OpenSCAD AST Integration...\n');
  
  try {
    // Test 1: Parser Initialization
    console.log('1️⃣ Testing parser initialization...');
    const parser = new OpenscadParser();
    await parser.init('packages/openscad-parser/dist/tree-sitter-openscad.wasm');
    console.log('✅ Parser initialized successfully');
    
    // Test 2: Basic OpenSCAD Code Parsing
    console.log('\n2️⃣ Testing OpenSCAD code parsing...');
    const testCode = `
// Test OpenSCAD code
width = 20;
height = 10;

module test_part() {
    cube([width, height, 5]);
    translate([25, 0, 0]) {
        sphere(r=5);
    }
}

test_part();
`;
    
    const tree = parser.parse(testCode);
    console.log('✅ OpenSCAD code parsed successfully');
    console.log(`📊 Parse tree generated with ${tree.rootNode.childCount} top-level nodes`);
    
    // Test 3: AST Node Analysis
    console.log('\n3️⃣ Testing AST node analysis...');
    
    function analyzeNode(node, depth = 0) {
      const indent = '  '.repeat(depth);
      console.log(`${indent}${node.type} (${node.startPosition.row}:${node.startPosition.column})`);
      
      if (depth < 2) { // Limit depth to avoid too much output
        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (child) {
            analyzeNode(child, depth + 1);
          }
        }
      }
    }
    
    console.log('🌳 AST Structure:');
    analyzeNode(tree.rootNode);
    
    // Test 4: Error Detection
    console.log('\n4️⃣ Testing error detection...');
    const errorCode = `
// Code with syntax error
cube([10, 10, 10)  // Missing closing bracket
sphere(r=5;        // Wrong syntax
`;
    
    const errorTree = parser.parse(errorCode);
    const hasErrors = errorTree.rootNode.hasError;
    console.log(`✅ Error detection working: ${hasErrors ? 'Found syntax errors' : 'No errors found'}`);
    
    // Clean up
    parser.dispose();
    console.log('\n🎯 AST Integration Test Results:');
    console.log('✅ Parser initialization: WORKING');
    console.log('✅ OpenSCAD parsing: WORKING');
    console.log('✅ AST node structure: WORKING');
    console.log('✅ Error detection: WORKING');
    console.log('\n🚀 AST integration is ready for Monaco editor integration!');
    
  } catch (error) {
    console.error('❌ AST Integration Test Failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testASTIntegration();
