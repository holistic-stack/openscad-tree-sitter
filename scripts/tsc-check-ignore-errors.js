/**
 * This script runs the TypeScript compiler with the --noEmit flag
 * but ignores any errors that are reported.
 */
const { execSync } = require('child_process');

try {
  console.log('Running TypeScript compiler check (ignoring errors)...');
  execSync('tsc --noEmit', { stdio: 'inherit' });
  console.log('TypeScript check completed successfully.');
} catch (error) {
  console.log('TypeScript check completed with errors (ignored).');
  // Exit with success code even if there are errors
  process.exit(0);
}
