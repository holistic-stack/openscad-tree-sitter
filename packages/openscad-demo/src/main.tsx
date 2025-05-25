import React, { useState } from 'react';
import { OpenscadEditorV2 } from '@openscad/editor';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`// OpenSCAD Code for AST Integration Testing
// 🎯 Priority: Tree-sitter Parser Integration

// Variables and parameters (AST: Variable declarations)
width = 20;
height = 10;
depth = 15;
$fn = 32;

// Built-in modules (AST: Module calls)
cube([width, height, depth]);

translate([25, 0, 0])
  sphere(r = 8, $fn = 50);

// Control structures (AST: Flow control nodes)
for (i = [0:2:10]) {
  translate([0, i * 15, 0])
    cylinder(h = height, r = 3, $fn = 6);
}

// Conditional expression (AST: Conditional nodes)
size = width > 15 ? 20 : 10;

// Custom module definition (AST: Module definitions)
module my_shape(size = 10, holes = true) {
  difference() {
    cube(size, center = true);
    if (holes) {
      for (x = [-1, 1]) {
        for (y = [-1, 1]) {
          translate([x * size/3, y * size/3, 0])
            cylinder(h = size + 1, r = size/8, center = true);
        }
      }
    }
  }
}

// Function call with parameters (AST: Function call nodes)
my_shape(15, true);

// Binary operations (AST: Expression nodes)
result = width * height + depth;

// Vector expressions (AST: Vector nodes)
points = [[0,0], [10,0], [10,10], [0,10]];

// Complex nested expressions
complex_value = sin(30) + cos(45) * sqrt(16);

// Hull operation (AST: Complex module calls)
hull() {
  translate([0, 30, 0]) sphere(5);
  translate([20, 30, 0]) sphere(5);
  translate([10, 40, 10]) sphere(3);
}

// Error test case - intentional syntax error for AST error detection
// Uncomment to test error handling:
// cube([10, 10; // Missing closing bracket

echo("Testing AST integration");
`);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🎯 OpenSCAD Editor Demo - Phase 3 Priority</h1>
      <div style={{ 
        background: '#e3f2fd', 
        border: '2px solid #1976d2', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
          🔥 TOP PRIORITY: Tree-sitter AST Integration
        </h2>
        <p style={{ margin: '0', lineHeight: '1.6' }}>
          <strong>Current Status:</strong> Monaco syntax highlighting ✅ COMPLETE<br/>
          <strong>Next Phase:</strong> Integrate <code>openscad-parser</code> for AST-based features<br/>
          <strong>Blocker:</strong> Parser build errors prevent AST integration
        </p>
      </div>
      
      <p>
        This demo showcases the <code>OpenSCAD Editor</code> with Monaco foundation 
        and <strong>code examples designed for AST integration testing</strong>.
      </p>
      
      <div style={{ 
        height: '600px', 
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <OpenscadEditorV2
          initialCode={code}
          onCodeChange={(newCode: string) => setCode(newCode)}
          height="100%"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>✅ COMPLETED Features:</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li>✅ <strong>Monaco Editor Integration</strong> - Production-ready editor</li>
            <li>✅ <strong>Syntax Highlighting</strong> - Complete OpenSCAD language support</li>
            <li>✅ <strong>Custom Theme</strong> - Dark theme optimized for OpenSCAD</li>
            <li>✅ <strong>Code Folding</strong> - Collapse/expand code blocks</li>
            <li>✅ <strong>Professional UI</strong> - Modern editor experience</li>
            <li>✅ <strong>Working Demo</strong> - Live demonstration platform</li>
          </ul>
          
          <h3>🔄 NEXT PRIORITY - AST Integration:</h3>
          <ul style={{ lineHeight: '1.6', color: '#d32f2f' }}>
            <li>🚨 <strong>Fix Parser Build</strong> - Resolve TypeScript errors</li>
            <li>⏳ <strong>AST Generation</strong> - Parse code to Abstract Syntax Tree</li>
            <li>⏳ <strong>Error Detection</strong> - Show syntax errors in Monaco</li>
            <li>⏳ <strong>Outline View</strong> - Display document structure</li>
            <li>⏳ <strong>Hover Information</strong> - Symbol details on hover</li>
          </ul>
        </div>
        
        <div>
          <h3>🚨 Parser Build Issues (Phase 3 Blocker):</h3>
          <div style={{ 
            background: '#ffebee', 
            border: '1px solid #e57373',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#c62828' }}>
              TypeScript Errors in openscad-parser:
            </p>
            <ul style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
              <li>expression-visitor.ts: Type mismatches</li>
              <li>FunctionCallNode vs ExpressionNode</li>
              <li>ParameterValue null assignment</li>
              <li>Binary/Conditional expression types</li>
            </ul>
          </div>

          <h3>🎯 AST Test Cases in Code:</h3>
          <ul style={{ lineHeight: '1.6', fontSize: '14px' }}>
            <li><strong>Variable declarations</strong> - width, height, depth</li>
            <li><strong>Module calls</strong> - cube(), sphere(), cylinder()</li>
            <li><strong>Control structures</strong> - for loops, conditionals</li>
            <li><strong>Function definitions</strong> - my_shape module</li>
            <li><strong>Expression nodes</strong> - Binary operations, vectors</li>
            <li><strong>Error cases</strong> - Commented syntax error for testing</li>
          </ul>
        </div>
      </div>

      <details style={{ marginTop: '20px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px'
        }}>
          🔧 Current Code (AST Integration Ready)
        </summary>
        <pre style={{ 
          background: '#1e1e1e', 
          color: '#d4d4d4',
          padding: '16px', 
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px',
          border: '1px solid #333',
          borderRadius: '4px',
          lineHeight: '1.4'
        }}>
          {code}
        </pre>
      </details>

      <div style={{ 
        marginTop: '20px', 
        background: '#fff3e0', 
        border: '1px solid #ff9800',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ef6c00' }}>
          🎯 Phase 3 Implementation Plan
        </h3>
        <ol style={{ margin: '0', lineHeight: '1.6' }}>
          <li><strong>Fix openscad-parser build issues</strong> - Resolve TypeScript type mismatches</li>
          <li><strong>Integrate AST parsing</strong> - Connect parser to Monaco editor</li>
          <li><strong>Add error markers</strong> - Display syntax errors using Monaco's Markers API</li>
          <li><strong>Implement outline view</strong> - Show document structure from AST</li>
          <li><strong>Add hover provider</strong> - Display symbol information on hover</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
