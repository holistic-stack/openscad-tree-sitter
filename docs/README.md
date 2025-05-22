# OpenSCAD Tree-Sitter Monorepo Migration Documentation

This directory contains documentation for the migration of the OpenSCAD Tree-Sitter project to an Nx monorepo with PNPM workspaces.

## Documentation Index

### Overview

- [Monorepo Migration Summary](./monorepo-summary.md): Summary of the migration plan and resources

### Migration Plan

- [Migration Plan](./monorepo-migration.md): Detailed plan for the migration
- [Migration Steps](./monorepo-migration-steps.md): Step-by-step guide for the migration

### Structure

- [Monorepo Structure](./monorepo-structure.md): Diagram and description of the new structure
- [Structure Comparison](./structure-comparison.md): Comparison of current and new structures

### Usage

- [Monorepo Commands](./monorepo-commands.md): Common commands for working with the monorepo
- [Monorepo FAQ](./monorepo-faq.md): Frequently asked questions about the migration
- [Monorepo README](./monorepo-readme.md): README.md for the monorepo

### Sample Configuration

- [Sample Root package.json](./sample-root-package.json): Root package.json for the monorepo
- [Sample Tree-Sitter package.json](./sample-tree-sitter-openscad-package.json): Package.json for the tree-sitter-openscad package
- [Sample Parser package.json](./sample-openscad-parser-package.json): Package.json for the openscad-parser package
- [Sample nx.json](./sample-nx-config.json): Nx configuration for the monorepo
- [Sample pnpm-workspace.yaml](./sample-pnpm-workspace.yaml): PNPM workspace configuration

## Migration Script

A migration script is provided to help with the migration:

- [Migration Script](../scripts/monorepo-migration.js): Script with migration steps

## Getting Started

To get started with the migration, follow these steps:

1. Read the [Migration Summary](./monorepo-summary.md) to understand the overall plan
2. Review the [Migration Plan](./monorepo-migration.md) for detailed information
3. Follow the [Migration Steps](./monorepo-migration-steps.md) to perform the migration
4. Use the [Sample Configuration Files](./sample-nx-config.json) as references
5. Refer to the [Monorepo Commands](./monorepo-commands.md) for working with the monorepo
6. Check the [Monorepo FAQ](./monorepo-faq.md) for answers to common questions
