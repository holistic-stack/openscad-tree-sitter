r = 10;
h = 20;
volume = 3.14 * r * r * h; 

translate([10, 0, 0]) {
    cube(5);
}

#sphere(r=5); 

x = 5;
result = x > 10 ? "big" : "small";

shape = let(
    width = 10,
    height = 20
) cube([width, height, 1]); 