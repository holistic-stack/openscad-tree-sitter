// Basic object literals
settings = {
    "resolution": 32,
    "size": 10,
    "material": "plastic"
};

// Nested object literals
config = {
    "dimensions": {
        "width": 100,
        "height": 50,
        "depth": 20
    },
    "style": {
        "color": "red",
        "finish": "matte"
    },
    "options": {
        "render": true,
        "preview": false,
        "quality": {
            "high": true,
            "samples": 64
        }
    }
};

// Object literals with various value types
mixed = {
    "name": "OpenSCAD",
    "version": 2021.01,
    "features": ["extrude", "rotate", "translate"],
    "enabled": true,
    "settings": {
        "quality": "high",
        "preview": false
    }
};

// Using object literals in a function
function get_config(name) = 
    let(configs = {
        "default": {
            "size": 10,
            "quality": "medium"
        },
        "high_quality": {
            "size": 10,
            "quality": "high"
        },
        "draft": {
            "size": 5,
            "quality": "low"
        }
    })
    configs[name];

// Accessing object properties
cube_config = {
    "size": 10,
    "center": true
};

// Using object literals in module calls
cube(cube_config);

// Using object literals with conditional expressions
render_settings = {
    "quality": i < 3 ? "high" : "low",
    "size": i < 3 ? 10 : 5
};
