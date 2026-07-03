# Build & Tooling

## Build System

### tsup
- **tsup** for building the library
- Outputs: ESM (`.mjs`) + CJS (`.cjs`) + type declarations (`.d.ts`)
- Source maps enabled
- Configuration: `tsup.config.ts`

### TypeScript
- `tsc` only for type-checking (`tsc --noEmit`)
- Never use `tsc` for building — always tsup

### Build Commands
```bash
npm run build              # Build with tsup
npm run clean              # Remove dist/
npm run typecheck          # Type-check only (tsc --noEmit)
```

## Linting & Formatting

### Biome
- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Single quotes, 100 line width, tabs for indent
- Import sorting enabled
- Configuration: `biome.json`

### Commands
```bash
npm run lint               # Biome check
npm run lint:fix           # Biome check + fix
npm run format             # Biome format
```

## Package Manager

### npm
- Use **npm** (NOT pnpm or yarn)
- Lock file: `package-lock.json`
- Node.js 22+ required (declared in `engines`)

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Build with tsup |
| `npm run clean` | Remove dist/ |
| `npm run lint` | Biome check |
| `npm run lint:fix` | Biome check + fix |
| `npm run format` | Biome format |
| `npm run typecheck` | tsc --noEmit |
| `npm test` | Run tests (vitest) |
| `npm run test:coverage` | Tests with coverage |

## Package Exports

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./transform": {
      "import": "./dist/transform.mjs",
      "require": "./dist/transform.cjs",
      "types": "./dist/transform.d.ts"
    }
  }
}
```

Two entry points:
- `@zweer/substack-client` — Main client (drafts, publish, sections)
- `@zweer/substack-client/transform` — Markdown → ProseMirror (usable standalone)
