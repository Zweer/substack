# substack-client

A TypeScript client for Substack's internal API. Publish, schedule, and manage posts programmatically.

**No official Substack API exists for publishing.** This library reverse-engineers the internal endpoints used by the Substack web editor to provide a clean, type-safe interface for automation.

## What It Does

- **Create drafts** with full ProseMirror body content
- **Publish** immediately or **schedule** for a future date
- **Set paywall** boundaries (free preview + paid content)
- **Assign sections** (categories) to posts
- **Manage sections** (create, delete, list)
- **Convert Markdown → Substack ProseMirror JSON** (the format their editor uses)
- **Unpublish** and **delete** posts

## Why This Exists

Substack has no public write API. Publishing content programmatically currently requires either:
- Copy-pasting into the web editor (manual, error-prone, slow)
- Using fragile Python scripts that break when Substack changes things

This library provides a documented, tested TypeScript client that handles the quirks of Substack's internal API — including the ProseMirror document format, the two-step draft creation, byline injection, and the dual section/tag system.

## Planned API

```typescript
import { SubstackClient } from '@zweer/substack-client'

const client = new SubstackClient({
  publication: 'yourname.substack.com',
  sid: process.env.SUBSTACK_SID  // session cookie
})

// Create and publish a post from markdown
const draft = await client.createDraft({
  title: 'Chapter 7: The Cab',
  subtitle: 'A story about arrivals',
  markdown: '# The Cab\n\nThe driver said nothing...',
  sectionId: 403948,
  audience: 'only_paid',  // 'everyone' | 'only_paid' | 'founding'
  paywallAfter: 2  // insert paywall after paragraph 2 (free preview)
})

// Schedule for later
await client.schedule(draft.id, {
  date: '2026-09-01T09:00:00Z',
  audience: 'only_paid'
})

// Or publish immediately
await client.publish(draft.id, { send: true })

// Unpublish if needed
await client.unpublish(draft.id)

// Delete
await client.delete(draft.id)
```

### Section Management

```typescript
// List sections
const sections = await client.listSections()

// Create a new section
const section = await client.createSection({
  name: 'New Arc',
  description: 'A new story arc'
})

// Delete a section
await client.deleteSection(section.id)
```

### Markdown → ProseMirror Transform

```typescript
import { markdownToProseMirror } from '@zweer/substack-client/transform'

const doc = markdownToProseMirror(`
# Heading

A paragraph with **bold** and *italic* text.

- Bullet one
- Bullet two

> A blockquote
`)

// Returns Substack-compatible ProseMirror JSON:
// { type: 'doc', content: [{ type: 'heading', attrs: { level: 1, textAlign: null }, ... }] }
```

## Auth

Substack uses session cookies for authentication. The login endpoint requires captcha from non-browser contexts, so the recommended approach is:

1. Log into Substack in your browser
2. Open DevTools → Application → Cookies
3. Copy the `substack.sid` value
4. Store it as an environment variable

```bash
export SUBSTACK_SID="s%3A..."
```

The cookie lasts for an extended period (exact duration TBD — days to weeks).

## Substack API Quirks (Documented)

This library handles these known issues internally:

| Quirk | Description |
|-------|-------------|
| Two-step draft creation | POST creates shell, PUT adds body — can't do both at once |
| ProseMirror JSON body | Content must be a stringified ProseMirror document, not HTML |
| Non-standard node types | `bullet_list` (snake_case) but `captionedImage` (camelCase) |
| Byline injection | PUT requires `draft_bylines` even though GET returns null |
| `rawHtml` crashes editor | API accepts it, editor silently breaks |
| `body_html` field ignored | Must use `draft_body` with ProseMirror JSON |
| Image upload format | JSON with base64 data URI, NOT multipart form |
| Paywall is a node | `{"type": "paywall"}` in the body, not a post-level setting |
| Dual section system | Numeric `draft_section_id` (legacy) + UUID tags (newer) coexist |
| Captcha on API login | `POST /login` from non-browser IPs triggers captcha |

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 22+
- **HTTP:** Native fetch
- **Markdown parsing:** marked or remark
- **Testing:** Vitest
- **Build:** tsup
- **Package:** `@zweer/substack-client` (NPM)

## Project Structure

```
substack-client/
├── lib/
│   ├── index.ts            # Public barrel
│   ├── client.ts           # Main SubstackClient class (facade)
│   ├── http.ts             # Internal HTTP client (fetch, retry, auth)
│   ├── drafts.ts           # Create, update, list, delete drafts
│   ├── publish.ts          # Publish, schedule, unpublish
│   ├── sections.ts         # Section CRUD
│   ├── errors.ts           # Typed error classes
│   ├── types.ts            # All type definitions
│   └── transform/
│       └── markdown.ts     # Markdown → ProseMirror JSON
├── test/
│   ├── fixtures/           # Mock API responses
│   └── *.test.ts
├── docs/
│   ├── conventions/        # Code style, tooling, testing, commits
│   ├── workflows/          # AI workflow modes (plan, review, ship)
│   ├── specs/              # Feature specs (requirements → design → tasks)
│   └── substack-api.md     # Reverse-engineered API reference
├── AGENTS.md               # Universal AI agent steering
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── biome.json
└── vitest.config.ts
```

## Development Phases

### Phase 1: Core Client
- [ ] Project setup (package.json, tsconfig, biome, vitest)
- [ ] Type definitions (requests, responses, ProseMirror nodes)
- [ ] Auth module (cookie injection, session validation)
- [ ] Draft CRUD (create, update, get, list, delete)
- [ ] Publish / schedule / unpublish
- [ ] Section CRUD

### Phase 2: Markdown Transform
- [ ] Markdown → ProseMirror conversion
- [ ] Support: headings, paragraphs, bold, italic, links, lists, blockquotes
- [ ] Paywall node injection (split content at specified point)
- [ ] Image handling (upload + embed in ProseMirror)
- [ ] Unit tests against real Substack chapter files

### Phase 3: Polish
- [ ] Error handling and typed error responses
- [ ] Retry logic for transient failures
- [ ] Session validation (detect expired cookie)
- [ ] Rate limit handling
- [ ] Documentation and examples
- [ ] NPM publish

## Prior Art

This library is informed by (but does not depend on):

- [`python-substack`](https://github.com/ma2za/python-substack) — Python, active, full publish flow
- [`substack-toolkit`](https://github.com/mphinance/substack-toolkit) — Python, ProseMirror quirks documented
- [`substack-api`](https://github.com/jakub-k-slys/substack-api) — TypeScript, read-only, deprecated
- [`manticore`](https://github.com/oldeucryptoboi/manticore) — Detailed reverse-engineering writeup

## License

MIT
