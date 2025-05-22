// OpenSCAD Architectural Model Example
// A parametric building with complex features

/* Parameters */
// Building dimensions
building_width = 100;
building_length = 150;
building_height = 80;
floor_height = 10;
num_floors = building_height / floor_height;

// Wall parameters
wall_thickness = 3;
window_width = 8;
window_height = 6;
window_spacing = 15;
door_width = 20;
door_height = 8;

// Roof parameters
roof_style = "gabled"; // Options: "flat", "gabled", "hipped"
roof_overhang = 5;
roof_angle = 30;

// Column parameters
column_diameter = 4;
column_spacing = 20;

// Balcony parameters
balcony_depth = 10;
balcony_width = 30;
balcony_railing_height = 3;

// Environment
ground_size = 300;
ground_thickness = 2;

/* Helper Functions */
// Function to calculate number of windows that fit in a wall
function num_windows(wall_length) = floor((wall_length - window_spacing) / (window_width + window_spacing));

// Function to calculate window positions
function window_positions(wall_length, count) = 
    [for (i = [0:count-1]) 
        wall_length/2 - (count * window_width + (count-1) * window_spacing)/2 + i * (window_width + window_spacing)];

/* Modules */
// Basic window
module window(width, height, depth) {
    cube([width, depth + 1, height]);
}

// Basic door
module door(width, height, depth) {
    cube([width, depth + 1, height]);
}

// Wall with windows
module wall_with_windows(length, height, thickness, floor_num) {
    difference() {
        // Wall
        cube([length, thickness, height]);
        
        // Windows
        window_count = num_windows(length);
        positions = window_positions(length, window_count);
        
        for (floor = [0:floor_num-1]) {
            for (pos = positions) {
                translate([pos, -1, floor * floor_height + (floor_height - window_height) / 2])
                    window(window_width, window_height, thickness + 2);
            }
        }
    }
}

// Wall with door
module wall_with_door(length, height, thickness, floor_num) {
    difference() {
        // Wall
        cube([length, thickness, height]);
        
        // Door (only on ground floor)
        translate([length/2 - door_width/2, -1, 0])
            door(door_width, door_height, thickness + 2);
        
        // Windows (on upper floors)
        window_count = num_windows(length);
        positions = window_positions(length, window_count);
        
        for (floor = [1:floor_num-1]) { // Start from 1 to skip ground floor
            for (pos = positions) {
                translate([pos, -1, floor * floor_height + (floor_height - window_height) / 2])
                    window(window_width, window_height, thickness + 2);
            }
        }
    }
}

// Column
module column(diameter, height) {
    cylinder(d = diameter, h = height, $fn = 20);
}

// Balcony
module balcony(width, depth, height, railing_height) {
    // Balcony base
    cube([width, depth, height]);
    
    // Railing
    difference() {
        cube([width, depth, height + railing_height]);
        translate([wall_thickness, wall_thickness, height])
            cube([width - 2 * wall_thickness, depth - wall_thickness - 1, railing_height + 1]);
    }
}

// Flat roof
module flat_roof(width, length, thickness, overhang) {
    translate([-overhang, -overhang, 0])
        cube([width + 2 * overhang, length + 2 * overhang, thickness]);
}

// Gabled roof
module gabled_roof(width, length, angle, overhang) {
    height = tan(angle) * (width / 2);
    
    translate([-overhang, -overhang, 0]) {
        difference() {
            cube([width + 2 * overhang, length + 2 * overhang, height]);
            
            // Cut the angles
            translate([0, -1, 0])
                rotate([0, -angle, 0])
                    cube([height * 2, length + 2 * overhang + 2, height * 2]);
            
            translate([width + 2 * overhang, -1, 0])
                rotate([0, angle - 90, 0])
                    cube([height * 2, length + 2 * overhang + 2, height * 2]);
        }
    }
}

// Hipped roof
module hipped_roof(width, length, angle, overhang) {
    height = tan(angle) * (width / 2 < length / 2 ? width / 2 : length / 2);
    
    hull() {
        translate([width/2, length/2, 0])
            cube([1, 1, height]);
        
        translate([-overhang, -overhang, 0])
            cube([width + 2 * overhang, length + 2 * overhang, 0.1]);
    }
}

// Building floor
module building_floor(width, length, height, floor_num, has_door = false) {
    // Front wall (with door if ground floor)
    if (has_door) {
        wall_with_door(width, height, wall_thickness, 1);
    } else {
        wall_with_windows(width, height, wall_thickness, 1);
    }
    
    // Back wall
    translate([0, length - wall_thickness, 0])
        wall_with_windows(width, height, wall_thickness, 1);
    
    // Left wall
    translate([0, 0, 0])
        rotate([0, 0, 90])
            wall_with_windows(length, height, wall_thickness, 1);
    
    // Right wall
    translate([width, length, 0])
        rotate([0, 0, -90])
            wall_with_windows(length, height, wall_thickness, 1);
    
    // Columns at corners
    for (x = [0, width]) {
        for (y = [0, length]) {
            translate([x, y, 0])
                column(column_diameter, height);
        }
    }
    
    // Balcony (only on front of non-ground floors)
    if (!has_door) {
        translate([width/2 - balcony_width/2, -balcony_depth, 0])
            balcony(balcony_width, balcony_depth, wall_thickness, balcony_railing_height);
    }
}

// Complete building
module building() {
    // Floors
    for (floor = [0:num_floors-1]) {
        translate([0, 0, floor * floor_height])
            building_floor(
                building_width, 
                building_length, 
                floor_height, 
                1, 
                floor == 0 // Only ground floor has door
            );
    }
    
    // Roof
    translate([0, 0, building_height]) {
        if (roof_style == "flat") {
            flat_roof(building_width, building_length, wall_thickness, roof_overhang);
        } else if (roof_style == "gabled") {
            gabled_roof(building_width, building_length, roof_angle, roof_overhang);
        } else if (roof_style == "hipped") {
            hipped_roof(building_width, building_length, roof_angle, roof_overhang);
        }
    }
}

// Ground
module ground() {
    translate([-ground_size/2, -ground_size/2, -ground_thickness])
        cube([ground_size, ground_size, ground_thickness]);
}

// Complete scene
module scene() {
    color("ForestGreen") ground();
    
    translate([0, 0, 0]) {
        color("Wheat") building();
    }
}

// Render the scene
scene();

// Uncomment to render individual components
// building();
// translate([building_width + 20, 0, 0]) gabled_roof(building_width, building_length, roof_angle, roof_overhang);
// translate([0, building_length + 20, 0]) building_floor(building_width, building_length, floor_height, 1, true);
