# Phase 03 — Authentication

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Organizer login working end-to-end via NextAuth + GitHub OAuth, with sessions correctly gating the routes that need them.

## Context
Nothing organizer-facing — upload, chapter editing — can be built safely until this exists. Every later phase that touches those flows assumes a working, correctly-checked session.

## Prerequisites
Phases 00 and 02 complete (NextAuth needs its adapter tables to already exist). A GitHub OAuth App registered with its callback URL pointed at the dev environment. `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` set.

## Tasks
1. Install and configure **NextAuth v4** — confirmed as the stable, non-beta line in Phase 00; do not upgrade to v5 without a deliberate, documented reason (`docs/DECISIONS.md`)
2. Wire a Postgres adapter so sessions and accounts persist in the same database as everything else, not a separate store
3. Build the `app/api/auth/[...nextauth]/route.ts` handler with the GitHub provider
4. Build one shared session-check helper that every protected route calls — not a pattern reimplemented per route
5. Build the sign-in UI: one button, per `docs/UX_UI.md`

## Files to Create
`src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`, `src/app/(auth)/sign-in/page.tsx`

## Files to Modify
None yet.

## Implementation Requirements
Session checks live in exactly one shared helper. This is deliberate, not a style preference: a hand-copied session check is exactly where a real access-control bug likes to hide — one route quietly missing it because it was typed out slightly wrong.

## Cloudinary Requirements
None in this phase.

## AI Requirements
None.

## Security Requirements
Verify — don't assume — that session cookies come out as HttpOnly, Secure, and SameSite=Lax, matching NextAuth's stated defaults in `docs/SECURITY.md`. `NEXTAUTH_SECRET` must be a real generated random value in every environment; the placeholder in `.env.example` must never be the real one.

## Testing Requirements
The Security Test already specified in `docs/TESTING.md` gets implemented here, not just planned: a request to a session-gated route with no session returns `401`; with a valid session, it proceeds.

## Git Requirements
`feat(auth): add NextAuth GitHub OAuth with Postgres adapter`

## Validation
A real sign-in through GitHub, in an actual browser, produces a working session that a protected route correctly recognizes.

## Acceptance Criteria
Given no session, when a protected route is called, then it returns `401`. Given a valid session, when the same route is called, then it proceeds normally.

## Definition of Done
Real GitHub sign-in works end-to-end in the dev environment. The shared session-check helper exists, and it — not a copy of it — is what every later phase's protected routes use.
