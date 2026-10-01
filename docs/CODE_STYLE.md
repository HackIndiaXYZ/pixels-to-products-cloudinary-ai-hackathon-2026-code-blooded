# Code Style & Conventions

This exists because ten phases, built in three days by several people across separate sessions, will only look like one coherent codebase if the conventions are written down instead of held in one person's head.

## File Naming

- React components: `PascalCase.tsx` (`CitationCard.tsx`)
- Everything else (route handlers, lib modules, utilities): `kebab-case.ts` (`rate-limit.ts`)
- Test files mirror the file they test, with `.test.ts`, in the matching `tests/{unit,integration,e2e}/` folder — not colocated with source, to keep `src/` free of test noise (a deliberate choice, not the only valid one, but a consistent one)

## Naming

- Functions and variables: `camelCase`
- Types and interfaces: `PascalCase`, no `I` prefix (`Lecture`, not `ILecture`)
- Genuine constants (not config, actual fixed values): `SCREAMING_SNAKE_CASE`
- Database columns: `snake_case` (matches `docs/DATABASE.md` exactly) — the query layer (`src/lib/db.ts`) is the one place that translates between `snake_case` rows and `camelCase` application objects; that translation does not leak into every call site

## Imports

Ordered in three groups, blank line between: external packages → internal `@/` aliases → relative imports. Not enforced by a bare style preference — configured as an actual ESLint rule (`import/order`) so it's checked, not just hoped for.

## Error Handling

No silent `catch` blocks. Every caught error either gets logged with enough context to answer `docs/OBSERVABILITY.md`'s standing question ("what happened when X failed"), or gets rethrown — never swallowed without a trace. This is the same principle behind every fallback path already specified in `docs/TESTING.md` and `docs/AI_EVALUATION.md`: fail gracefully, but never silently.

## Comments

Explain *why*, not *what* — the code already says what it does. A comment earns its place when it captures a decision that isn't obvious from reading the code alone (why this approach and not the other one considered), which is also exactly the "learning mode" goal `CLAUDE.md` already states for this project.

## Types

`strict: true` is already set in `tsconfig.json` — no loosening it partway through to unblock a phase faster. `any` requires a comment explaining why nothing better was available, not a silent shortcut.

## Server/Client Boundaries

Anything touching a secret (`src/lib/cloudinary.ts`, `db.ts`, `claude.ts`, `auth.ts`, `env.ts`) imports Next.js's `server-only` at the top — a structural guardrail against an accidental client-bundle leak, not just a naming convention that relies on memory.
