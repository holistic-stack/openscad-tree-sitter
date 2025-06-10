// OpenSCAD Mathematical Surfaces Example
// Complex mathematical functions and surfaces

/* Parameters */
// Resolution
resolution = 50; // Number of points per dimension
detail = 100;    // $fn value for spheres and cylinders

// Domain limits
x_min = -10;
x_max = 10;
y_min = -10;
y_max = 10;
z_scale = 2;     // Scale factor for z values

// Surface selection
surface_type = "sinc"; // Options: "sinc", "ripple", "saddle", "torus", "klein"

// Point size for point clouds
point_size = 0.1;

// Mesh parameters
mesh_thickness = 0.2;

/* Mathematical Functions */
// Sinc function: sin(r)/r where r is distance from origin
function sinc(x, y) = 
    let(r = sqrt(x*x + y*y))
    r == 0 ? 1 : sin(r * 180 / PI) / r;

// Ripple function: sin of distance from origin
function ripple(x, y) = 
    let(r = sqrt(x*x + y*y))
    sin(r * 180 / PI);

// Saddle function: hyperbolic paraboloid
function saddle(x, y) = x*x - y*y;

// Torus function
function torus(u, v) = 
    let(
        R = 5,  // Major radius
        r = 2,  // Minor radius
        x = (R + r * cos(v)) * cos(u),
        y = (R + r * cos(v)) * sin(u),
        z = r * sin(v)
    ) [x, y, z];

// Klein bottle function (parametric)
function klein(u, v) = 
    let(
        u_rad = u * 360 / resolution,
        v_rad = v * 360 / resolution,
        x = u_rad < 180 
            ? (6 * cos(u_rad) * (1 + sin(u_rad)) + 4 * (1 - cos(u_rad)/2) * cos(u_rad) * cos(v_rad))
            : (6 * cos(u_rad) * (1 + sin(u_rad)) + 4 * (1 - cos(u_rad)/2) * cos(v_rad + 180)),
        y = u_rad < 180
            ? (16 * sin(u_rad) + 4 * (1 - cos(u_rad)/2) * sin(u_rad) * cos(v_rad))
            : (16 * sin(u_rad)),
        z = 4 * (1 - cos(u_rad)/2) * sin(v_rad)
    ) [x/10, y/10, z/10]; // Scale down to reasonable size

/* Modules */
// Generate a point cloud for a function z = f(x, y)
module point_cloud(func) {
    for (i = [0:resolution-1]) {
        for (j = [0:resolution-1]) {
            x = x_min + (x_max - x_min) * i / (resolution - 1);
            y = y_min + (y_max - y_min) * j / (resolution - 1);
            z = func(x, y) * z_scale;
            
            translate([x, y, z])
                sphere(r = point_size, $fn = detail/5);
        }
    }
}

// Generate a mesh surface for a function z = f(x, y)
module mesh_surface(func) {
    dx = (x_max - x_min) / (resolution - 1);
    dy = (y_max - y_min) / (resolution - 1);
    
    for (i = [0:resolution-2]) {
        for (j = [0:resolution-2]) {
            x1 = x_min + dx * i;
            y1 = y_min + dy * j;
            z1 = func(x1, y1) * z_scale;
            
            x2 = x_min + dx * (i + 1);
            y2 = y_min + dy * j;
            z2 = func(x2, y2) * z_scale;
            
            x3 = x_min + dx * (i + 1);
            y3 = y_min + dy * (j + 1);
            z3 = func(x3, y3) * z_scale;
            
            x4 = x_min + dx * i;
            y4 = y_min + dy * (j + 1);
            z4 = func(x4, y4) * z_scale;
            
            // Create triangular faces
            polyhedron(
                points = [
                    [x1, y1, z1],
                    [x2, y2, z2],
                    [x3, y3, z3],
                    [x4, y4, z4]
                ],
                faces = [
                    [0, 1, 2],
                    [0, 2, 3]
                ]
            );
            
            // Create edges
            hull() {
                translate([x1, y1, z1]) sphere(r = mesh_thickness/2, $fn = detail/10);
                translate([x2, y2, z2]) sphere(r = mesh_thickness/2, $fn = detail/10);
            }
            
            hull() {
                translate([x2, y2, z2]) sphere(r = mesh_thickness/2, $fn = detail/10);
                translate([x3, y3, z3]) sphere(r = mesh_thickness/2, $fn = detail/10);
            }
            
            hull() {
                translate([x3, y3, z3]) sphere(r = mesh_thickness/2, $fn = detail/10);
                translate([x4, y4, z4]) sphere(r = mesh_thickness/2, $fn = detail/10);
            }
            
            hull() {
                translate([x4, y4, z4]) sphere(r = mesh_thickness/2, $fn = detail/10);
                translate([x1, y1, z1]) sphere(r = mesh_thickness/2, $fn = detail/10);
            }
        }
    }
}

// Generate a parametric surface from a function that returns [x, y, z]
module parametric_surface(func) {
    for (u = [0:resolution-2]) {
        for (v = [0:resolution-2]) {
            p1 = func(u, v);
            p2 = func(u+1, v);
            p3 = func(u+1, v+1);
            p4 = func(u, v+1);
            
            polyhedron(
                points = [
                    p1, p2, p3, p4
                ],
                faces = [
                    [0, 1, 2],
                    [0, 2, 3]
                ]
            );
        }
    }
}

// Generate a wireframe for a parametric surface
module parametric_wireframe(func) {
    for (u = [0:resolution-1]) {
        for (v = [0:resolution-1]) {
            p1 = func(u, v);
            
            if (u < resolution-1) {
                p2 = func(u+1, v);
                hull() {
                    translate(p1) sphere(r = mesh_thickness/2, $fn = detail/10);
                    translate(p2) sphere(r = mesh_thickness/2, $fn = detail/10);
                }
            }
            
            if (v < resolution-1) {
                p3 = func(u, v+1);
                hull() {
                    translate(p1) sphere(r = mesh_thickness/2, $fn = detail/10);
                    translate(p3) sphere(r = mesh_thickness/2, $fn = detail/10);
                }
            }
        }
    }
}

// Render the selected surface
module render_surface() {
    if (surface_type == "sinc") {
        color("SteelBlue") mesh_surface(sinc);
    } else if (surface_type == "ripple") {
        color("Tomato") mesh_surface(ripple);
    } else if (surface_type == "saddle") {
        color("Gold") mesh_surface(saddle);
    } else if (surface_type == "torus") {
        color("MediumSeaGreen") parametric_wireframe(torus);
    } else if (surface_type == "klein") {
        color("Orchid") parametric_wireframe(klein);
    }
}

// Coordinate axes
module coordinate_axes(length = 15, thickness = 0.2) {
    // X axis (red)
    color("Red") {
        translate([length/2, 0, 0])
            rotate([0, 90, 0])
                cylinder(h = length, r = thickness, center = true, $fn = detail/5);
        translate([length, 0, 0])
            sphere(r = thickness*2, $fn = detail/5);
    }
    
    // Y axis (green)
    color("Green") {
        translate([0, length/2, 0])
            rotate([-90, 0, 0])
                cylinder(h = length, r = thickness, center = true, $fn = detail/5);
        translate([0, length, 0])
            sphere(r = thickness*2, $fn = detail/5);
    }
    
    // Z axis (blue)
    color("Blue") {
        translate([0, 0, length/2])
            cylinder(h = length, r = thickness, center = true, $fn = detail/5);
        translate([0, 0, length])
            sphere(r = thickness*2, $fn = detail/5);
    }
    
    // Origin
    color("Black")
        sphere(r = thickness*2, $fn = detail/5);
}

// Complete scene
module scene() {
    coordinate_axes();
    render_surface();
}

// Render the scene
scene();

// Uncomment to render individual surfaces
// surface_type = "sinc"; render_surface();
// translate([25, 0, 0]) { surface_type = "ripple"; render_surface(); }
// translate([0, 25, 0]) { surface_type = "saddle"; render_surface(); }
// translate([25, 25, 0]) { surface_type = "torus"; render_surface(); }
// translate([-25, 0, 0]) { surface_type = "klein"; render_surface(); }
