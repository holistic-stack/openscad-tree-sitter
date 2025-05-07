// Test file for OpenSCAD indentation and folding

module testModule(size) {
  cube(size);
  sphere(size/2);
}

function testFunction(x) = x * x;

if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

for (i = [0:10]) {
  translate([i,0,0])
    cube([1,1,1]);
}

/* Multi-line
   comment that
   should fold */