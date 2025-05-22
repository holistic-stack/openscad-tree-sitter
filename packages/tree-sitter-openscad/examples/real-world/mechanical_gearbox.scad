// OpenSCAD Mechanical Gearbox Example
// A complex real-world example of a parametric gearbox design

/* Parameters */
// Main dimensions
gearbox_width = 80;
gearbox_length = 120;
gearbox_height = 40;
wall_thickness = 3;

// Gear parameters
module_size = 1;  // Gear module size
gear1_teeth = 40; // Number of teeth on first gear
gear2_teeth = 20; // Number of teeth on second gear
gear3_teeth = 10; // Number of teeth on third gear
gear_thickness = 5;
gear_clearance = 0.5;

// Shaft parameters
shaft_diameter = 6;
shaft_clearance = 0.2;
bearing_outer_diameter = 16;
bearing_thickness = 5;

// Calculated values
gear1_diameter = module_size * gear1_teeth;
gear2_diameter = module_size * gear2_teeth;
gear3_diameter = module_size * gear3_teeth;

// Function to calculate gear pitch diameter
function gear_pitch_diameter(teeth, module_size) = teeth * module_size;

// Function to calculate gear outer diameter
function gear_outer_diameter(teeth, module_size) = (teeth + 2) * module_size;

/* Modules */
// Involute gear profile
module involute_gear(teeth, module_size, thickness, bore_diameter) {
    pitch_diameter = gear_pitch_diameter(teeth, module_size);
    outer_diameter = gear_outer_diameter(teeth, module_size);
    
    difference() {
        cylinder(h = thickness, d = outer_diameter, $fn = 120);
        cylinder(h = thickness + 1, d = bore_diameter, $fn = 30, center = true);
    }
}

// Shaft with keyway
module shaft(diameter, length, keyway_width, keyway_depth) {
    difference() {
        cylinder(h = length, d = diameter, $fn = 30);
        
        // Keyway
        if (keyway_width > 0 && keyway_depth > 0) {
            translate([-keyway_width/2, diameter/2 - keyway_depth, -1])
                cube([keyway_width, keyway_depth + 1, length + 2]);
        }
    }
}

// Bearing
module bearing(outer_diameter, inner_diameter, thickness) {
    difference() {
        cylinder(h = thickness, d = outer_diameter, $fn = 60);
        cylinder(h = thickness + 1, d = inner_diameter, $fn = 30, center = true);
    }
}

// Gearbox housing
module gearbox_housing() {
    difference() {
        // Outer shell
        cube([gearbox_length, gearbox_width, gearbox_height]);
        
        // Inner cavity
        translate([wall_thickness, wall_thickness, wall_thickness])
            cube([
                gearbox_length - 2 * wall_thickness, 
                gearbox_width - 2 * wall_thickness, 
                gearbox_height
            ]);
        
        // Shaft holes
        // Input shaft
        translate([gearbox_length * 0.25, gearbox_width * 0.5, -1])
            cylinder(h = wall_thickness + 2, d = shaft_diameter + shaft_clearance * 2, $fn = 30);
        
        // Output shaft
        translate([gearbox_length * 0.75, gearbox_width * 0.5, -1])
            cylinder(h = wall_thickness + 2, d = shaft_diameter + shaft_clearance * 2, $fn = 30);
        
        // Bearing seats
        // Input bearing
        translate([gearbox_length * 0.25, gearbox_width * 0.5, wall_thickness - bearing_thickness/2])
            cylinder(h = bearing_thickness, d = bearing_outer_diameter, $fn = 60);
        
        // Output bearing
        translate([gearbox_length * 0.75, gearbox_width * 0.5, wall_thickness - bearing_thickness/2])
            cylinder(h = bearing_thickness, d = bearing_outer_diameter, $fn = 60);
        
        // Mounting holes
        for (x = [10, gearbox_length - 10]) {
            for (y = [10, gearbox_width - 10]) {
                translate([x, y, -1])
                    cylinder(h = wall_thickness + 2, d = 5, $fn = 20);
            }
        }
    }
}

// Gearbox cover
module gearbox_cover() {
    difference() {
        // Cover plate
        cube([gearbox_length, gearbox_width, wall_thickness]);
        
        // Shaft holes
        // Input shaft
        translate([gearbox_length * 0.25, gearbox_width * 0.5, -1])
            cylinder(h = wall_thickness + 2, d = shaft_diameter + shaft_clearance * 2, $fn = 30);
        
        // Output shaft
        translate([gearbox_length * 0.75, gearbox_width * 0.5, -1])
            cylinder(h = wall_thickness + 2, d = shaft_diameter + shaft_clearance * 2, $fn = 30);
        
        // Mounting holes
        for (x = [10, gearbox_length - 10]) {
            for (y = [10, gearbox_width - 10]) {
                translate([x, y, -1])
                    cylinder(h = wall_thickness + 2, d = 5, $fn = 20);
            }
        }
    }
}

// Complete gearbox assembly
module gearbox_assembly() {
    // Housing
    color("LightGray") gearbox_housing();
    
    // Cover (moved up for visualization)
    color("LightGray") translate([0, 0, gearbox_height + 10]) gearbox_cover();
    
    // Input shaft
    color("Silver") translate([gearbox_length * 0.25, gearbox_width * 0.5, -10])
        shaft(shaft_diameter, gearbox_height + 20, 2, 1);
    
    // Output shaft
    color("Silver") translate([gearbox_length * 0.75, gearbox_width * 0.5, -10])
        shaft(shaft_diameter, gearbox_height + 20, 2, 1);
    
    // Input gear
    color("SteelBlue") translate([gearbox_length * 0.25, gearbox_width * 0.5, wall_thickness + bearing_thickness])
        involute_gear(gear1_teeth, module_size, gear_thickness, shaft_diameter + shaft_clearance);
    
    // Intermediate gear
    color("Tomato") translate([gearbox_length * 0.5, gearbox_width * 0.5, wall_thickness + bearing_thickness])
        involute_gear(gear2_teeth, module_size, gear_thickness, shaft_diameter + shaft_clearance);
    
    // Output gear
    color("Gold") translate([gearbox_length * 0.75, gearbox_width * 0.5, wall_thickness + bearing_thickness])
        involute_gear(gear3_teeth, module_size, gear_thickness, shaft_diameter + shaft_clearance);
    
    // Bearings
    color("DarkGray") {
        // Input bearing
        translate([gearbox_length * 0.25, gearbox_width * 0.5, wall_thickness])
            bearing(bearing_outer_diameter, shaft_diameter + shaft_clearance, bearing_thickness);
        
        // Output bearing
        translate([gearbox_length * 0.75, gearbox_width * 0.5, wall_thickness])
            bearing(bearing_outer_diameter, shaft_diameter + shaft_clearance, bearing_thickness);
    }
}

// Render the gearbox
gearbox_assembly();

// Uncomment to render individual parts
// gearbox_housing();
// translate([0, gearbox_width + 10, 0]) gearbox_cover();
// translate([gearbox_length + 10, 0, 0]) involute_gear(gear1_teeth, module_size, gear_thickness, shaft_diameter);
// translate([gearbox_length + 10, gearbox_width * 0.5, 0]) involute_gear(gear2_teeth, module_size, gear_thickness, shaft_diameter);
// translate([gearbox_length + 10, gearbox_width, 0]) involute_gear(gear3_teeth, module_size, gear_thickness, shaft_diameter);
