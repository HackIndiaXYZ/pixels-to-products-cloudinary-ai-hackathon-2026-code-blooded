# Phase 09 — Hardening

**Day 3 afternoon · ~3 h · ends at code freeze (18:00)**

## Objective
Make the deployed build survive a judge clicking around on their own phone: every failure state designed, every claim tested, security walked against real code.

## Prerequisites
Phase 08.

## Tasks
1. **Scenario table** — run every row of `TESTING.md` against the deployed URL; fix or consciously accept each.
2. **Eval** — `pnpm eval:ask`; fill in `AI_EVALUATION.md`'s results table. If citation precision < 90 %, tune the prompt or retrieval size before polishing anything else.
3. **Security walk** — `SECURITY.md` line by line against the code: `server-only` imports, cookie flags, webhook raw-body verification, `401`s, snippet escaping, rate limit returns `429`.
4. **Failure states** — `transcript_failed` session, Claude down (`fallback`), no results, slow Moment generation, 404 session.
5. **Mobile pass** — every page at 360 px width; thumb-reachable Ask bar; Moment sheet on iOS Safari.
6. **Playwright smoke** (`tests/e2e/smoke.spec.ts`) against `APP_URL`: home loads → search a known phrase → result opens watch page at the right `t` → Ask a known question → ≥1 citation card.
7. **Lighthouse** on home + watch: fix anything red in accessibility.
8. Update every doc that drifted from reality (`CLAUDE.md` rule).

## Files to Create
`tests/e2e/smoke.spec.ts`, `playwright.config.ts`

## Security Requirements
This phase *is* the security review.

## Testing Requirements
All unit tests + smoke test pass against production.

## Acceptance Criteria
A teammate who hasn't seen the app uses it on their phone for 5 minutes without hitting a dead end or an unstyled error.

## Definition of Done
Code freeze. From here only README, demo and submission work.
