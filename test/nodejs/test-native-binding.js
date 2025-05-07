const binding = require('../../bindings/node');
console.log('Binding loaded successfully');
console.log('Binding name:', binding.name);
console.log('Binding language:', binding.language ? 'Available' : 'Not available');
console.log('Node type info:', binding.nodeTypeInfo ? 'Available' : 'Not available');
