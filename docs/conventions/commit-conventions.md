# Commit Conventions

**IMPORTANT**: The agent NEVER commits, pushes, or creates tags. The developer handles all git operations manually.

## Format

Conventional commits with gitmoji as text codes (not emoji):

```
type(scope): :emoji_code: short description

Detailed explanation of what changed and why.
```

## Types

- `feat` — New feature (`:sparkles:`)
- `fix` — Bug fix (`:bug:`)
- `perf` — Performance improvement (`:zap:`)
- `docs` — Documentation (`:memo:`)
- `chore` — Maintenance tasks (`:wrench:`, `:arrow_up:`, `:bookmark:`)
- `refactor` — Code refactoring (`:recycle:`)
- `test` — Tests (`:white_check_mark:`)
- `style` — Code formatting (`:art:`)
- `ci` — CI/CD changes (`:construction_worker:`)
- `build` — Build system (`:hammer:`)

## Scope

Use the module or area affected:
- `client` — Main SubstackClient class
- `drafts` — Draft operations
- `publish` — Publish/schedule/unpublish
- `sections` — Section CRUD
- `transform` — Markdown → ProseMirror
- `auth` — Authentication/cookies
- `types` — Type definitions
- `notes` — Notes operations

Scope is optional for cross-cutting changes.

## Gitmoji

**Always use text codes** (`:sparkles:`), **never actual emoji** (✨).

## Body

**Always include a detailed body** explaining:
1. What was changed
2. Why it was changed
3. Any important context or side effects

## Breaking Changes

Add `!` after the type/scope and include `BREAKING CHANGE:` in the body:

```
feat(client)!: :boom: change constructor signature

BREAKING CHANGE: SubstackClient now requires an options object
instead of positional parameters.
```

## Releases

### release-please
- **release-please** handles versioning, changelog, and npm publish
- Configured as GitHub Action (`.github/workflows/release.yml`)
- Watches `main` branch for conventional commits
- Generates a **Release PR** automatically with:
  - Version bump (based on commit types: feat → minor, fix → patch, breaking → major)
  - `CHANGELOG.md` update (auto-generated from commits)
  - `package.json` version update
- When the Release PR is merged → creates GitHub Release + publishes to npm

### What this means for commits
- Every commit on `main` must follow conventional commits (enforced by the format above)
- `feat` → triggers minor version bump
- `fix` → triggers patch version bump
- `feat!` or `BREAKING CHANGE:` → triggers major version bump
- `docs`, `chore`, `refactor`, `test`, `style` → no version bump, but appear in changelog

### Workflow
```
feature branch → PR → merge to main
  → release-please detects commits
  → opens/updates Release PR (version + changelog)
  → developer merges Release PR
  → GitHub Action publishes to npm + creates tag
```
