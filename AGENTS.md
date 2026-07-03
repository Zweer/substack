# AGENTS.md — substack-client

Universal steering file for AI agents working on this project.

## Project Identity

**substack-client** is a TypeScript library that wraps Substack's internal API for publishing, scheduling, and managing posts programmatically. No official Substack API exists for writing — this library reverse-engineers the internal endpoints.

The library covers: drafts CRUD, publish/schedule/unpublish, sections, markdown-to-ProseMirror transform, notes, and read operations.

## Stack

- **Language:** TypeScript (strict mode, ES modules)
- **Runtime:** Node.js 22+
- **HTTP:** Native fetch (async/await)
- **Testing:** Vitest
- **Build:** tsdown
- **Lint/Format:** Biome
- **Package:** `@zweer/substack-client` (npm)

## Documentation Structure

```
docs/
├── conventions/       # Code style, tooling, testing, commit rules
├── workflows/         # Cognitive modes (plan-product, plan-eng, code-review, ship-prep)
├── specs/             # Feature specs (requirements → design → tasks → testlist)
│   ├── 01-core-client/
│   ├── 02-markdown-transform/
│   └── ✅_xx-name/    # ✅ prefix = completed spec
└── substack-api.md    # Reverse-engineered API reference
```

Follow the conventions in `docs/conventions/`. When invoking workflow modes, refer to `docs/workflows/`.

## Conventions (Summary)

Full details in `docs/conventions/`. Key rules:

- TypeScript strict, no `any`, explicit return types on exports
- ES modules with `.js` extensions in imports
- `async/await` everywhere, native `fetch`
- Biome for lint + format (not ESLint/Prettier)
- Vitest for tests (AAA pattern)
- Conventional commits + gitmoji (text codes, not emoji)

## Interaction Rules

### Language
- **Conversation:** Italian
- **Code, comments, commits, docs:** English

### Git
- **NEVER commit, push, or create tags** — the developer handles all git operations
- Prepare changes and suggest a commit message
- The developer reviews and commits manually

### Interview Before Implementing
For ambiguous or complex requests, ask clarifying questions BEFORE writing code. Skip for clear, well-defined tasks.

### Plan Before Implementing
For multi-step tasks (new features, refactors, architecture changes):
1. Write a short numbered plan first
2. Wait for approval before implementing
3. Adapt the plan if requirements change mid-execution

Skip planning for single-file fixes, small bug fixes, or simple questions.

### Workflow Triggers

| Trigger | Mode | When |
|---|---|---|
| `plan product` | Product Owner | Starting a feature, vague requirements |
| `plan eng` | Tech Lead | After product direction is set, before implementing |
| `code review` | Paranoid Reviewer | After implementation, before committing |
| `ship prep` | Release Engineer | Final checklist before commit |

Details for each mode in `docs/workflows/`.

## Specs

Feature specs live in `docs/specs/{nn-name}/` with:
- `requirements.md` — Functional requirements (what it does, user stories, acceptance criteria)
- `design.md` — Technical design (architecture, types, interfaces, data flow)
- `tasks.md` — Atomic implementation tasks (technical, with dependencies)
- `testlist.md` — Test matrix (unit/integration with status ⬜/✅)

## Kiro Users

This project intentionally keeps zero `.kiro/` configuration. All steering, specs, and workflows live in standard markdown files that any AI agent can consume. If using Kiro CLI, `AGENTS.md` and `README.md` are loaded automatically by the default agent.
