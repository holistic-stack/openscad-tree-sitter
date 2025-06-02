// Test simple list comprehension
values = [for (i = [1:5]) i * i];

// Test multiple variable list comprehension
points = [for (i=[0:3], a=i*90) [cos(a), sin(a)]];
