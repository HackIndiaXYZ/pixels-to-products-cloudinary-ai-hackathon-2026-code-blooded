# Phase 12 — Deployment

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Pravaha running live on Vercel production, with real environment variables, reachable by a judge without any local setup.

## Context
Everything before this worked in a dev environment. This phase is where `docs/TRD.md`'s deployment section — Vercel plus Neon/Supabase, both free tier — becomes a real, reachable URL.

## Prerequisites
Phases 00–11 complete, including the security review.

## Tasks
1. Provision production instances: the real Cloudinary account (already exists from Phase 01), a production Postgres database (the same Neon/Supabase project as dev, or a separate branch — either is fine at this scale)
2. Set every environment variable from `.env.example` in Vercel's project settings, with real values — never copy-pasted from a doc or a chat log
3. Run the Phase 02 migration against the production database
4. Update the GitHub OAuth App's callback URL to include the production domain
5. Deploy to Vercel production via the `main` branch, per the CI/CD flow in `docs/ARCHITECTURE.md` diagram 11
6. Run the full upload-to-playback flow once against production, for real, before calling this phase done

## Files to Create
None.

## Files to Modify
Possibly `next.config`/`vercel.json` if the default Vercel configuration needs project-specific adjustment — expected to be minimal, per the "zero-config hosting" reasoning already in `docs/TRD.md`.

## Implementation Requirements
N/A.

## Cloudinary Requirements
Production Cloudinary credentials are separate environment-variable values from dev, even if pointing at the same account. Never hardcode either set.

## AI Requirements
Confirm `ANTHROPIC_API_KEY` is set for production and both Claude calls work against real requests, not only dev-environment testing.

## Security Requirements
This is the last checkpoint before the repository and a live URL are both fully public — re-confirm no secret is in the repo, one more time, specifically because this is the point of no return.

## Testing Requirements
The E2E test (Phase 10) run once against the production URL specifically, not only a preview deployment — production has its own environment variables and its own database, exactly the things a preview deploy doesn't fully prove.

## Git Requirements
No new commits necessarily required if everything is configuration; if any code changed to make deployment work, a specific `fix(deploy):` or `chore(deploy):` message — never an undescriptive "deploy fixes."

## Validation
A judge, or anyone with the URL and no other context, can open the site, watch a published lecture, and search within it — with zero local setup.

## Acceptance Criteria
Given the production URL, when opened by someone who has never seen this project before, then the core flow — browse, watch, search — works with no errors and no missing configuration.

## Definition of Done
Production is live, the full flow has been run against it for real, and every environment variable is a genuine production value, not a dev value pointed at a different domain.
