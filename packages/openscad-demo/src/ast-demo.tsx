import React, { useState, useCallback } from 'react';
import { OpenscadEditorAST, OpenscadOutline, FormattingConfig, type ParseResult, type OutlineItem, type FormattingService } from '@openscad/editor';

const ASTDemo: React.FC = () => {
  const [code, setCode] = useState<string>(`// 🎉 OpenSCAD Editor with Smart Navigation & Code Formatting!
// ✨ Professional IDE Features: Parsing • Error Detection • Navigation • Formatting • Completion

// 🎯 NAVIGATION SHORTCUTS:
// F12 - Go to definition (click on symbol first)
// Shift+F12 - Find all references
// Ctrl+G - Go to line number
// Ctrl+T - Search symbols
// Ctrl+Shift+O - Go to symbol

// 🎨 FORMATTING SHORTCUTS:
// Shift+Alt+F - Format entire document
// Ctrl+K Ctrl+F - Format selection
// Use the Format Config panel to customize formatting rules!

// ===== ADVANCED OPENSCAD EXAMPLES =====

// 📐 Global Parameters (try changing these values!)
width = 25;
height = 15;
depth = 10;
wall_thickness = 2;
$fn = 64; // Global resolution

// 🔧 Utility Functions
function calculate_volume(w, h, d) = w * h * d;
function golden_ratio() = (1 + sqrt(5)) / 2;
function deg_to_rad(degrees) = degrees * PI / 180;

// 📊 Complex Mathematical Expressions
fibonacci_angle = 137.5; // Golden angle in degrees
spiral_radius = 5;
num_elements = 8;

// 🏗️ Advanced Module with Multiple Parameters
module parametric_box(
    size = [20, 15, 10],
    wall = 2,
    rounded = true,
    corner_radius = 2,
    lid = false,
    ventilation_holes = false
) {
    difference() {
        // Main body
        if (rounded) {
            minkowski() {
                cube([size.x - 2*corner_radius, size.y - 2*corner_radius, size.z/2]);
                cylinder(r = corner_radius, h = size.z/2);
            }
        } else {
            cube(size);
        }

        // Hollow interior
        translate([wall, wall, wall])
            cube([size.x - 2*wall, size.y - 2*wall, size.z]);

        // Ventilation holes
        if (ventilation_holes) {
            for (i = [1:3]) {
                translate([size.x/4 * i, size.y/2, size.z - wall/2])
                    cylinder(d = 3, h = wall + 1, center = true);
            }
        }
    }

    // Optional lid
    if (lid) {
        translate([0, size.y + 5, 0])
            cube([size.x, size.y, wall]);
    }
}

// 🌀 Spiral Pattern Generator
module fibonacci_spiral(elements = 8, base_radius = 3) {
    for (i = [0:elements-1]) {
        angle = i * fibonacci_angle;
        radius = base_radius * sqrt(i + 1);

        rotate([0, 0, angle])
            translate([radius, 0, 0])
                rotate([0, 0, -angle])
                    scale([1, 1, 0.5 + i * 0.1])
                        sphere(d = 2);
    }
}

// 🔄 Gear Generator (Advanced Geometry)
module gear(
    teeth = 12,
    circular_pitch = 5,
    pressure_angle = 20,
    clearance = 0.2,
    gear_thickness = 5
) {
    pitch_radius = teeth * circular_pitch / (2 * PI);
    base_radius = pitch_radius * cos(pressure_angle);
    outer_radius = pitch_radius + (circular_pitch / PI - clearance);

    linear_extrude(height = gear_thickness) {
        difference() {
            circle(r = outer_radius);

            // Tooth profile (simplified)
            for (i = [0:teeth-1]) {
                rotate([0, 0, i * 360/teeth])
                    translate([pitch_radius, 0, 0])
                        circle(d = circular_pitch/3);
            }
        }
    }
}

// 🏛️ Architectural Elements
module column(height = 30, diameter = 6, flutes = 8) {
    difference() {
        cylinder(h = height, d = diameter);

        // Fluted surface
        for (i = [0:flutes-1]) {
            rotate([0, 0, i * 360/flutes])
                translate([diameter/2 - 0.5, 0, 0])
                    cylinder(h = height + 1, d = 1, center = true);
        }
    }

    // Capital (top decoration)
    translate([0, 0, height])
        cylinder(h = 2, d1 = diameter, d2 = diameter * 1.2);
}

// 🎮 Interactive Demo Objects
echo("=== BUILDING DEMO OBJECTS ===");

// Main parametric box
translate([0, 0, 0])
    parametric_box(
        size = [width, height, depth],
        wall = wall_thickness,
        rounded = true,
        corner_radius = 3,
        lid = true,
        ventilation_holes = true
    );

// Fibonacci spiral
translate([40, 0, 0])
    fibonacci_spiral(elements = num_elements, base_radius = spiral_radius);

// Gear assembly
translate([0, 40, 0]) {
    gear(teeth = 16, circular_pitch = 4, gear_thickness = 3);

    translate([0, 0, 4])
        gear(teeth = 12, circular_pitch = 4, gear_thickness = 3);
}

// Architectural column
translate([40, 40, 0])
    column(height = 25, diameter = 8, flutes = 6);

// 📈 Performance Test (Large Array)
module stress_test() {
    for (x = [0:2:20]) {
        for (y = [0:2:20]) {
            translate([x, y, 0])
                cube([1, 1, sin(x + y) + 2]);
        }
    }
}

// Uncomment to test parser performance:
// translate([80, 0, 0]) stress_test();

// 🎯 Navigation Test Objects
module navigation_test() {
    // Test go-to-definition: click on 'width' and press F12
    test_cube_size = width * golden_ratio();

    cube([test_cube_size, height, depth]);

    // Test find-references: click on 'calculate_volume' and press Shift+F12
    volume = calculate_volume(test_cube_size, height, depth);
    echo("Volume:", volume);
}

translate([0, -30, 0])
    navigation_test();

echo("🎉 Demo loaded! Try the navigation and formatting features!");
echo("📊 Total volume:", calculate_volume(width, height, depth));
echo("📐 Golden ratio:", golden_ratio());
`);

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [formattingService, setFormattingService] = useState<FormattingService | null>(null);
  const [showFormatConfig, setShowFormatConfig] = useState(false);
  const [currentExample, setCurrentExample] = useState('advanced');
  const [showMetrics, setShowMetrics] = useState(false);
  const [codeStats, setCodeStats] = useState({ lines: 0, characters: 0, words: 0 });

  const handleParseResult = useCallback((result: ParseResult) => {
    setParseResult(result);
    console.log('📊 Parse Result:', result);
  }, []);

  const handleOutlineChange = useCallback((newOutline: OutlineItem[]) => {
    setOutline(newOutline);
    console.log('🌳 Outline Updated:', newOutline);
  }, []);

  const handleFormattingServiceReady = useCallback((service: FormattingService) => {
    setFormattingService(service);
    console.log('🎨 Formatting Service Ready:', service);
  }, []);

  const handleOutlineItemClick = useCallback((item: OutlineItem) => {
    console.log('🎯 Navigate to:', item);
    // TODO: Implement navigation to the specific line/column
  }, []);

  const examples = {
    advanced: code, // Current advanced example
    basic: `// 🎯 Basic OpenSCAD Examples - Perfect for Learning!

// Simple shapes
cube([10, 10, 10]);
translate([15, 0, 0]) sphere(r = 5);
translate([30, 0, 0]) cylinder(h = 10, r = 3);

// Basic transformations
translate([0, 20, 0]) {
    rotate([0, 45, 0]) cube([8, 8, 8]);
}

// Simple module
module simple_box(size = 10) {
    cube([size, size, size/2]);
}

simple_box(12);
translate([0, -15, 0]) simple_box(8);
`,
    performance: `// ⚡ Performance Test - Large Scale Generation

// Performance parameters
grid_size = 15;
element_size = 1.5;
spacing = 3;

// Large array generation
for (x = [0:spacing:grid_size * spacing]) {
    for (y = [0:spacing:grid_size * spacing]) {
        translate([x, y, 0]) {
            height = sin(x/5) * cos(y/5) * 3 + 5;
            cube([element_size, element_size, height]);
        }
    }
}

// Complex mathematical pattern
module fractal_tree(depth = 4, length = 10, angle = 30) {
    if (depth > 0) {
        cylinder(h = length, r = depth * 0.5);

        translate([0, 0, length]) {
            rotate([0, angle, 0]) fractal_tree(depth - 1, length * 0.7, angle);
            rotate([0, -angle, 120]) fractal_tree(depth - 1, length * 0.7, angle);
            rotate([0, -angle, 240]) fractal_tree(depth - 1, length * 0.7, angle);
        }
    }
}

translate([50, 50, 0]) fractal_tree(depth = 3);
`
  };

  const handleExampleChange = useCallback((exampleKey: string) => {
    setCurrentExample(exampleKey);
    const newCode = examples[exampleKey as keyof typeof examples];
    setCode(newCode);
    setCodeStats(calculateCodeStats(newCode));
  }, [examples]);

  const calculateCodeStats = useCallback((code: string) => {
    const lines = code.split('\n').length;
    const characters = code.length;
    const words = code.split(/\s+/).filter(word => word.length > 0).length;
    return { lines, characters, words };
  }, []);

  // Initialize code stats
  React.useEffect(() => {
    setCodeStats(calculateCodeStats(code));
  }, [code, calculateCodeStats]);

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      background: '#1e1e1e',
      color: '#d4d4d4'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        background: '#252526',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            🎉 OpenSCAD Professional IDE - Advanced Demo
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#aaa' }}>
            Real-time Parsing • AST Analysis • Error Detection • Smart Navigation • Code Completion • Intelligent Formatting
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Example Selection */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.keys(examples).map((key) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: currentExample === key ? '#007acc' : '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {key === 'advanced' ? '🚀 Advanced' :
                 key === 'basic' ? '📚 Basic' :
                 key === 'performance' ? '⚡ Performance' : key}
              </button>
            ))}
          </div>

          {/* Metrics Toggle */}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: showMetrics ? '#007acc' : '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            📊 Metrics
          </button>

          {/* Format Config Toggle */}
          <button
            onClick={() => setShowFormatConfig(!showFormatConfig)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: showFormatConfig ? '#007acc' : '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🎨 Format Config
          </button>
          
          {parseResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <span style={{
                color: parseResult.success ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {parseResult.success ? '✅ PARSED' : '❌ ERRORS'}
              </span>
              {parseResult.errors.length > 0 && (
                <span style={{ color: '#f44336' }}>
                  {parseResult.errors.length} error{parseResult.errors.length !== 1 ? 's' : ''}
                </span>
              )}
              {parseResult.success && (
                <>
                  <span style={{ color: '#4fc3f7' }}>
                    📊 {outline.length} symbols
                  </span>
                  <span style={{ color: '#81c784' }}>
                    ⚡ Parse: OK
                  </span>
                  {showMetrics && (
                    <>
                      <span style={{ color: '#ffb74d' }}>
                        📝 {codeStats.lines} lines
                      </span>
                      <span style={{ color: '#ba68c8' }}>
                        🔤 {codeStats.words} words
                      </span>
                      <span style={{ color: '#4db6ac' }}>
                        📏 {codeStats.characters} chars
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: showFormatConfig ? '1fr 300px 300px' : '1fr 300px',
        gap: '1px',
        background: '#333'
      }}>
        {/* Editor */}
        <div style={{ background: '#1e1e1e' }}>
          <OpenscadEditorAST
            initialCode={code}
            onCodeChange={setCode}
            onParseResult={handleParseResult}
            onOutlineChange={handleOutlineChange}
            onFormattingServiceReady={handleFormattingServiceReady}
            height="100%"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Sidebar - Outline */}
        <div style={{ 
          background: '#1e1e1e',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Outline */}
          <div style={{ flex: 1 }}>
            <OpenscadOutline
              outline={outline}
              onItemClick={handleOutlineItemClick}
              title="Document Outline"
            />
          </div>

          {/* Features Info */}
          <div style={{
            borderTop: '1px solid #333',
            padding: '12px',
            fontSize: '11px',
            lineHeight: '1.5',
            background: '#252526'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>🚀 Professional IDE Features</h4>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#aaa' }}>
              <li>🔍 <strong>Real-time AST parsing</strong> - Tree-sitter powered analysis</li>
              <li>❌ <strong>Smart error detection</strong> - Syntax & semantic errors</li>
              <li>🌳 <strong>Symbol outline</strong> - Navigate modules, functions, variables</li>
              <li>💡 <strong>Rich hover info</strong> - Parameter details & documentation</li>
              <li>✨ <strong>Intelligent completion</strong> - Context-aware suggestions</li>
              <li>🎯 <strong>Advanced navigation</strong> - Go-to-definition, find references</li>
              <li>🎨 <strong>AST-based formatting</strong> - Semantic-preserving code style</li>
              <li>📊 <strong>Performance monitoring</strong> - Real-time parsing metrics</li>
            </ul>

            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: '#1e1e1e',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>🎯 Navigation:</strong> Click on <code>width</code>, <code>calculate_volume</code>, or <code>golden_ratio</code>
                and press <strong>F12</strong> (go-to-definition) or <strong>Shift+F12</strong> (find references)
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>🎨 Formatting:</strong> Press <strong>Shift+Alt+F</strong> to format the entire document
                or select code and press <strong>Ctrl+K Ctrl+F</strong>
              </div>
              <div>
                <strong>🔍 Search:</strong> <strong>Ctrl+G</strong> (go-to-line), <strong>Ctrl+T</strong> (symbol search),
                <strong>Ctrl+Shift+O</strong> (go-to-symbol)
              </div>
            </div>
          </div>
        </div>

        {/* Format Config Panel */}
        {showFormatConfig && formattingService && (
          <div style={{ 
            background: '#1e1e1e',
            borderLeft: '1px solid #333'
          }}>
            <FormattingConfig 
              formattingService={formattingService} 
              currentCode={code}
              onFormattedCode={setCode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ASTDemo;
