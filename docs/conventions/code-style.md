# Code Style

## TypeScript

### Strict Mode
- Always use strict mode (enabled in `tsconfig.json`)
- No `any` types — use `unknown` or proper types
- Explicit return types on all exported functions
- Explicit parameter types always

### Module System
- ES modules only (`"type": "module"` in package.json)
- Use `.js` extensions in imports (TypeScript requirement for ES modules)
- Example: `import { foo } from './bar.js'` (not `./bar` or `./bar.ts`)

### Naming Conventions
- **camelCase** for variables, functions, methods
- **PascalCase** for classes, interfaces, types
- **UPPER_SNAKE_CASE** for constants
- **kebab-case** for file names

### Code Organization
```typescript
// 1. Imports (external first, then internal)
import type { RequestInit } from 'node:http';
import type { DraftResponse } from './types.js';

// 2. Types/Interfaces (if not in types.ts)
export interface ClientOptions {
  publication: string;
  sid: string;
}

// 3. Constants
const DEFAULT_TIMEOUT = 30_000;

// 4. Classes/Functions
export class SubstackClient {}
```

### Type Definitions
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, mapped types
- Export all public types from `types.ts`
- Use `readonly` for immutable properties

### Async/Await
- Prefer `async/await` over `.then()/.catch()`
- Always handle errors in async functions
- Use `Promise.all()` for parallel operations
- Never mix callbacks and promises

### Error Handling
- Throw typed errors with clear messages (extend `Error`)
- Include context: HTTP status, endpoint, response body
- Use `try/catch` for async operations
- Provide specific error classes: `SubstackAuthError`, `SubstackAPIError`

## Code Quality

### Minimal Code
- Write only what's necessary
- No premature abstractions
- No unused code or imports
- No commented-out code in commits

### Dependencies
- Prefer native Node.js APIs when possible (fetch, crypto, etc.)
- Only add dependencies when absolutely necessary
- Use `^` for dependencies (allow minor/patch updates)
- Keep dependencies up to date

## Comments & Documentation

### When to Comment
- Complex algorithms or non-obvious logic
- Public APIs (JSDoc on exported functions)
- Workarounds or quirks (with explanation of why)

### When NOT to Comment
- Obvious code
- Redundant information
- Commented-out code (delete it)
