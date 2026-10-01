# Phase 00 — Repository Setup

**Status: DONE.** Written after the fact, describing what actually exists — not a prediction, unlike every phase doc after this one.

## Objective

A scaffolded, conventions-documented repository that Phase 01 can build directly into, with no ambiguity about structure, tooling, or process left to rediscover mid-implementation.

## Context

This is the one phase safe to fully pre-specify, because it doesn't depend on any application logic existing yet — it's tooling and structure, not features.

## Prerequisites

None. This is the starting point.

## Tasks Completed

- Folder structure created (`src/app`, `src/lib`, `src/components`, `src/types`, `tests/{unit,integration,e2e}`, `docs/phases`)
- `package.json` written with real, version-checked dependencies (not guessed — see Implementation Requirements)
- `tsconfig.json` configured for the App Router, strict mode on
- `.gitignore` excludes `.env*`, build output, and test artifacts
- `.env.example` documents every required variable by name only
- CI workflow (`.github/workflows/ci.yml`) runs lint + typecheck + unit tests on every PR; Cloudinary integration tests are gated to `main` only, since they hit a real sandbox account and are slower
- `README.md` (lightweight version) and `CONTRIBUTING.md` (Git conventions) written

## Files Created

`package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md`, `CONTRIBUTING.md`, `.github/workflows/ci.yml`, plus the empty folder structure above.

## Files Modified

None — nothing existed before this phase.

## Implementation Requirements

Every dependency version in `package.json` was checked against the real npm registry at write time, not recalled from memory — `next-auth` specifically was checked against its `dist-tags`, which showed `next-auth@5` still on the `beta` tag (not `latest`) even now. That's why this project pins to `next-auth@4`, the mature, non-beta line, rather than the nominally-newer major. `typescript` was pinned to the `5.x` line rather than the registry's current `latest` (a `7.x` major) for the same reason — a big, recent major version jump in a foundational tool is a real risk for a short build, and worth a deliberate, conservative choice rather than defaulting to "whatever `latest` resolves to today."

## Cloudinary Requirements

None yet — Phase 01 is where the Cloudinary SDK actually gets wired up. This phase only ensured `cloudinary` is a declared dependency.

## AI Requirements

None yet — same reasoning, deferred to Phase 06.

## Security Requirements

`.env.example` contains names only, never real values (`docs/SECURITY.md`). `.gitignore` was verified to exclude `.env` and `.env.local` before anything else was created, on purpose — so it's structurally impossible to accidentally commit a real secret in any later phase.

## Testing Requirements

None applicable yet — there's no application logic to test. CI is configured and will run (and pass, trivially) once Phase 01 adds real code.

## Git Requirements

This phase's own commit should read `chore(repo): scaffold project structure, CI, and conventions` — a real example of the convention documented in `CONTRIBUTING.md`, not just a description of it.

## Validation

- `pnpm install` resolves cleanly against the pinned versions
- `pnpm lint` and `pnpm typecheck` run without error (trivially, on an empty `src/`)
- CI workflow YAML is valid

## Acceptance Criteria

- Given a fresh clone of this repository, when someone runs `pnpm install`, then it succeeds with no version conflicts.
- Given the repository as committed, when scanned for secrets, then none are found — only `.env.example` with empty values.

## Definition of Done

Repository structure exists, is documented, builds cleanly with no application code, and every tooling decision made here has a stated reason in `docs/DECISIONS.md` or this document — not left implicit.

## Addendum — Oct 1, 2026

- Local repository initialised and based on `origin/main` (`daf3d9d`, HackIndia's initial commit). `origin` = the team repo. The remote `LICENSE` (HackIndia copyright) is kept; the README keeps the HackIndia team tag line.
- Superseded by the v2 re-scope: `next-auth` (removed in Phase 02); the CI `cloudinary-integration` job (`vitest` has no `--grep`, so it's dropped in Phase 02); CI currently fails `lint`/`typecheck` because no ESLint config or source files exist yet. Phase 02 fixes this.
- Git rules: `docs/GIT_WORKFLOW.md`.
