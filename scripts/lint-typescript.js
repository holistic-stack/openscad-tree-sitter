/**
 * This script runs ESLint with TypeScript checking
 * It combines ESLint and TypeScript checking in one step
 */
const { execSync } = require('child_process');

try {
  console.log('Running ESLint with TypeScript checking...');

  // Run ESLint
  execSync('eslint ./src/lib', { stdio: 'inherit' });

  // Run TypeScript compiler check
  console.log('\nRunning TypeScript compiler check...');
  execSync('tsc --noEmit', { stdio: 'inherit' });

  console.log('Linting completed successfully.');
} catch (error) {
  console.error('Linting completed with errors.');
  process.exit(1);
}
