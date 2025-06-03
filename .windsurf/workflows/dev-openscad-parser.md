---
description: dev-openscad-parser
---

read packages/openscad-parser/docs/current-context.md, packages/openscad-parser/docs/PROGRESS.md and packages/openscad-parser/docs/TODO.md, proceed with the detailed plan in packages/openscad-parser/reviewed_plan.md and continue a prioritized approach.

MUST RUN tests, lint and types checks every file change;
MUST FIX ONE ISSUE PER TIME AND update packages/openscad-parser/docs/current-context.md, packages/openscad-parser/docs/PROGRESS.md and packages/openscad-parser/docs/TODO.md every change;

THIS IS A NX MONOREPO project, which use nx tools to test, build, dist ans publish, and other nx utilitity tools:
	- MUST STOP THE TASK IF UNABLE TO USE NX TOOLS, EXPLAIN AND ADD OPTIONS TO FIX THE NX MONOREPO ISSUE OR PROCEED WITH THE TASK; 

IMPORTANT ALWAYS search online for update context information and REASON MULTIPLE APPROACH, focus in the typescript best practices docs/typescript-guidelines.md, focus on tree sitter best practices, avoid tree sitter grammar pitfall and DRY, SRP and KISS principles;
IMPORTANT: remember the current year is MAY 2025;
IMPORTANT: watch or invalid stand alone invalid openscad syntax;
IMPORTANT: add documentation comments in the edited files explaining the reason behind the edit, remove old comments if you refactored the previous edit;

ONCE TASK IS DONE and update/add packages/opensad-parser/docs/README.MD and packages/opensad-parser/docs/*.md documentation;
IMPORTANT: do not use console.log, use project utility log wrapper packages\openscad-parser\src\lib\openscad-parser\error-handling\logger.ts;
---

## Coding Best Practices

### General Principles
- DO NOT USE MOCKS for OpenscadParser;
- Implement changes incrementally with files under 500 lines
- Follow TDD with small changes and avoid mocks in tests
- No `any` types in TypeScript; use kebab-case for filenames
- Apply Single Responsibility Principle (SRP)
- Prioritize readability over clever code

ALWAYS USE DRY and KISS rules and algoritm improvements, split the code in smaller and manageable code, reason multiple options of improvements;
use SRP of solid for any function and utils, use TDD approach;
search in the web for more context;
do not use __tests__ folder, use:
EACH SRP file must have its own folder and the its tests should be in the same folder, e.g. of file structure:

```jsx
new-srp-file/
├── new-srp-file-with-single-small-test-files-example/
│   ├── new-srp-file.ts
│   └── new-srp-file.test.ts
└── new-srp-file-with-muiltiple-small-test-files-example/
    ├── new-srp-file.ts
    ├── new-srp-file-[similar-scenario1].test.ts
    ├── new-srp-file-[similar-scenario2].test.ts
    ├── ...
    └── new-srp-file-[similar-scenarioX].test.ts
```

### TypeScript Best Practices
- Use strict mode and explicit type annotations
- Leverage advanced types (unions, intersections, generics)
- Prefer interfaces for APIs and readonly for immutable data
- Use type guards instead of type assertions
- Utilize utility types and discriminated unions

### Functional Programming
- Write pure functions without side effects
- Enforce immutability and use higher-order functions
- Compose functions and use declarative programming
- Handle nullable values with option/maybe types
- Use Either/Result types for error handling


### Testing with Vitest
do not use mocks for openscadParser, use real parser:
```

describe("OpenSCADParser", () => {
  let parser: OpenscadParser;

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new OpenscadParser();

    // Initialize the parser
    await parser.init();
  });

  afterEach(() => {
    // Clean up after each test
    parser.dispose();
  });
});
```


### Error Handling
- Use structured error handling with specific types
- Provide meaningful error messages with context
- Handle edge cases explicitly and validate input data
- Use try/catch blocks only when necessary

### Performance
- Optimize for readability first, then performance
- Profile to identify actual bottlenecks
- Use appropriate data structures and memoization
- Minimize DOM manipulations and optimize 3D operations

## Documentation Best Practices
- Add JSDoc comments to all code elements with descriptions and examples
- Use `@example` tag and `@file` tag for module descriptions
- Document why code works a certain way, not just what it does
- Include architectural decisions, limitations, and edge cases
- Use diagrams for complex relationships and "before/after" sections
- Keep documentation close to code and provide tho
rough examples

## Code Review Guidelines
- Check adherence to standards, test coverage, and documentation
- Look for security vulnerabilities and performance issues
- Verify proper typing, error handling, and functional principles
- Identify refactoring opportunities for better code quality
- Provide constructive feedback focused on code, not developer

## Continuous Integration
- Ensure all code passes tests, linting, and type checking
- Use feature branches and maintain clean commit history
