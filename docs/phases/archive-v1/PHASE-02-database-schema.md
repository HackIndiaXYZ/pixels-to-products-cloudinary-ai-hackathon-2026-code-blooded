# Phase 02 — Database Schema + Migrations

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Get the schema from `docs/DATABASE.md` actually running against a real Postgres instance, with a migration approach the rest of the project can rely on.

## Context
Every later phase reads or writes this schema. Getting the migration tooling right now avoids the worse alternative of hand-editing a live database later, with no record of what changed or why.

## Prerequisites
Phase 00 complete. A Postgres instance provisioned (Neon or Supabase free tier), `DATABASE_URL` set in `.env.local`.

## Tasks
1. Adopt a lightweight, file-based migration approach — plain numbered `.sql` files, not a heavy ORM migration system; this schema doesn't need one, and `docs/TRD.md`'s anti-overengineering stance applies here too
2. Translate `docs/DATABASE.md`'s schema into the first migration, in order: extension → enum → `lectures` → `chapters` → `transcript_segments` → `tags` → `lecture_tags` → indexes
3. Run the migration against the real dev database
4. Build a minimal typed query layer (`src/lib/db.ts`) — a `pg` `Pool`, not a full ORM
5. Confirm NextAuth's adapter tables (`users`, `accounts`, `sessions`, `verification_tokens`) are provisioned too, ahead of Phase 03 needing them

## Files to Create
`migrations/001_initial_schema.sql`, `src/lib/db.ts`, `tests/integration/db.test.ts`

## Files to Modify
None yet.

## Implementation Requirements
Connection pooling must fit a serverless environment. A fresh `Pool` per Vercel function invocation will exhaust a small Postgres instance's connection limit quickly — use a pattern that reuses a single pool across invocations where the runtime allows it, or the provider's own pooled connection string (both Neon and Supabase offer one specifically for serverless use).

## Cloudinary Requirements
None — this is the one phase that's genuinely Cloudinary-free, on purpose.

## AI Requirements
None.

## Security Requirements
`DATABASE_URL` is server-only, never exposed to the client. Every query is parameterized — no string-built SQL, matching the OWASP mapping in `docs/SECURITY.md`.

## Testing Requirements
An integration test that runs the migration against a disposable test database and confirms every table, constraint, and index in `docs/DATABASE.md` actually exists as specified. This is the test that catches doc-vs-schema drift — the exact failure mode a documentation-consistency pass is meant to prevent.

## Git Requirements
`feat(db): add initial schema migration and query layer`

## Validation
The migration runs cleanly against a fresh database with no manual intervention required.

## Acceptance Criteria
Given a fresh Postgres database, when the migration runs, then every table, constraint, and index described in `docs/DATABASE.md` exists exactly as documented.

## Definition of Done
Migration file committed and idempotent-safe to re-run on a fresh database, integration test passes, connection pooling is serverless-appropriate, NextAuth's adapter tables are confirmed present.
