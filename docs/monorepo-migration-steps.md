# Step-by-Step Migration Guide

This document provides detailed steps for migrating the OpenSCAD Tree-Sitter project to an Nx monorepo.

## Prerequisites

- Node.js (v16 or later)
- PNPM (v7 or later)
- Git

## Step 1: Backup and Preparation

1. Create a backup of the current repository:
   ```bash
   # Clone the repository to a backup location
   git clone <repo-url> openscad-tree-sitter-backup
   
   # Create a new branch for the migration
   cd openscad-tree-sitter
   git checkout -b feature/nx-monorepo
   ```

## Step 2: Initialize Nx Workspace

1. Initialize a new Nx workspace with PNPM:
   ```bash
   # Create a temporary directory for the new workspace
   mkdir temp-nx-workspace
   cd temp-nx-workspace
   
   # Initialize the Nx workspace
   pnpm dlx create-nx-workspace@latest --preset=ts --packageManager=pnpm --name=openscad-tree-sitter
   
   # Copy the Nx configuration files to the original repository
   cp -r ./.nx ../openscad-tree-sitter/
   cp nx.json ../openscad-tree-sitter/
   cp package.json ../openscad-tree-sitter/package.json.nx
   
   # Return to the original repository
   cd ../openscad-tree-sitter
   ```

2. Merge the package.json files:
   ```bash
   # Manually merge the Nx package.json with the original package.json
   # Keep the original dependencies and add the Nx dependencies
   ```

3. Update the nx.json file with the configuration from docs/sample-nx-config.json.

4. Create a pnpm-workspace.yaml file:
   ```bash
   # Create the file with the content from docs/sample-pnpm-workspace.yaml
   cp docs/sample-pnpm-workspace.yaml pnpm-workspace.yaml
   ```

## Step 3: Create Package Structure

1. Create the packages directory:
   ```bash
   mkdir -p packages/tree-sitter-openscad/src
   mkdir -p packages/openscad-parser/src
   ```

2. Create package.json files for each package:
   ```bash
   # Copy the sample package.json files
   cp docs/sample-tree-sitter-openscad-package.json packages/tree-sitter-openscad/package.json
   cp docs/sample-openscad-parser-package.json packages/openscad-parser/package.json
   ```

## Step 4: Migrate Tree-Sitter Grammar Package

1. Move grammar files to the tree-sitter-openscad package:
   ```bash
   # Move grammar.js
   cp grammar.js packages/tree-sitter-openscad/

   # Move queries
   mkdir -p packages/tree-sitter-openscad/queries
   cp -r queries/* packages/tree-sitter-openscad/queries/

   # Move bindings
   mkdir -p packages/tree-sitter-openscad/bindings
   cp -r bindings/* packages/tree-sitter-openscad/bindings/

   # Move test corpus
   mkdir -p packages/tree-sitter-openscad/test/corpus
   cp -r test/corpus/* packages/tree-sitter-openscad/test/corpus/

   # Move examples
   mkdir -p packages/tree-sitter-openscad/examples
   cp -r examples/* packages/tree-sitter-openscad/examples/
   ```

2. Create an index.js file for the package:
   ```bash
   # Create a simple index.js file
   echo "module.exports = require('./bindings/node');" > packages/tree-sitter-openscad/src/index.js
   ```

## Step 5: Migrate OpenSCAD Parser Package

1. Move parser files to the openscad-parser package:
   ```bash
   # Move openscad-parser directory
   mkdir -p packages/openscad-parser/src/lib
   cp -r src/lib/openscad-parser packages/openscad-parser/src/lib/

   # Move ast directory
   cp -r src/lib/ast packages/openscad-parser/src/lib/

   # Move test-utils directory
   cp -r src/lib/test-utils packages/openscad-parser/src/lib/

   # Move index.ts
   cp src/lib/index.ts packages/openscad-parser/src/lib/
   ```

2. Create a tsconfig.json file for the package:
   ```bash
   # Copy the original tsconfig.json and modify it
   cp tsconfig.json packages/openscad-parser/
   ```

3. Create a vite.config.ts file for the package:
   ```bash
   # Create a vite.config.ts file
   cat > packages/openscad-parser/vite.config.ts << 'EOF'
   import { defineConfig } from 'vite';
   import dts from 'vite-plugin-dts';
   import { join } from 'path';

   export default defineConfig({
     plugins: [
       dts({
         entryRoot: 'src',
         tsConfigFilePath: join(__dirname, 'tsconfig.json'),
       }),
     ],
     build: {
       lib: {
         entry: 'src/lib/index.ts',
         name: 'openscadParser',
         fileName: 'index',
         formats: ['es', 'cjs'],
       },
       rollupOptions: {
         external: ['@openscad/tree-sitter-openscad', 'web-tree-sitter'],
       },
     },
   });
   EOF
   ```

## Step 6: Update Import References

1. Update import paths in the openscad-parser package:
   ```bash
   # Find and replace import paths
   # This will need to be done manually for each file that imports from the tree-sitter grammar
   ```

## Step 7: Install Dependencies

1. Install dependencies:
   ```bash
   pnpm install
   ```

## Step 8: Test the Migration

1. Build all packages:
   ```bash
   pnpm nx run-many --target=build --all
   ```

2. Run all tests:
   ```bash
   pnpm nx run-many --target=test --all
   ```

3. Fix any issues that arise during testing.

## Step 9: Update Documentation

1. Update the main README.md:
   ```bash
   # Copy the sample README.md
   cp docs/monorepo-readme.md README.md
   ```

2. Update other documentation as needed.

## Step 10: Clean Up

1. Remove unnecessary files:
   ```bash
   # Remove files that have been migrated and are no longer needed
   # This will need to be done carefully to avoid removing files that are still needed
   ```

2. Commit the changes:
   ```bash
   git add .
   git commit -m "Migrate to Nx monorepo structure"
   ```

## Step 11: Final Verification

1. Perform a final verification of the migration:
   ```bash
   # Build all packages
   pnpm nx run-many --target=build --all

   # Run all tests
   pnpm nx run-many --target=test --all

   # Check the project graph
   pnpm nx graph
   ```

2. If everything looks good, merge the branch:
   ```bash
   git checkout main
   git merge feature/nx-monorepo
   ```

## Troubleshooting

If you encounter issues during the migration, here are some common problems and solutions:

1. **Build failures**: Check that all dependencies are correctly installed and that import paths are correct.

2. **Test failures**: Ensure that test files are correctly migrated and that test utilities are available.

3. **Import errors**: Update import paths to use the new package structure.

4. **Nx configuration issues**: Verify that nx.json is correctly configured and that the workspace structure is correct.
