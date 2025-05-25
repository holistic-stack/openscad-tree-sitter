import React, { useState } from 'react';
import { OpenscadEditorV2 } from '@openscad/editor';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`// Sample OpenSCAD Code with Advanced Features

// Variables and parameters
width = 20;
height = 10;
depth = 15;

// Built-in modules and transformations
cube([width, height, depth]);

translate([25, 0, 0])
  sphere(r = 8, $fn = 50);

// Control structures and functions
for (i = [0:2:10]) {
  translate([0, i * 15, 0])
    cylinder(h = height, r = 3, $fn = 6);
}

// Custom module with parameters
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

// Use the custom module
translate([50, 0, 0])
  my_shape(15, true);

// Complex operations
hull() {
  translate([0, 30, 0]) sphere(5);
  translate([20, 30, 0]) sphere(5);
  translate([10, 40, 10]) sphere(3);
}

// Comments and special variables
echo("Current preview time: ", $t);
// echo("Version: ", version());
`);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>OpenSCAD Editor Demo</h1>
      <p>
        This demo showcases the <code>OpenSCAD Editor</code> component with 
        <strong> working syntax highlighting</strong> using Monaco's Monarch tokenizer.
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

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Features Demonstrated:</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li>✅ <strong>Syntax Highlighting</strong> - Keywords, functions, modules, comments</li>
            <li>✅ <strong>Code Completion</strong> - Auto-closing brackets and quotes</li>
            <li>✅ <strong>Theme</strong> - Custom dark theme optimized for OpenSCAD</li>
            <li>✅ <strong>Code Folding</strong> - Collapse/expand code blocks</li>
            <li>✅ <strong>Error Highlighting</strong> - Basic syntax error detection</li>
            <li>✅ <strong>Auto-formatting</strong> - Proper indentation and formatting</li>
          </ul>
        </div>
        
        <details style={{ flex: 1 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Current Code (Debug View)</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            {code}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default App;
