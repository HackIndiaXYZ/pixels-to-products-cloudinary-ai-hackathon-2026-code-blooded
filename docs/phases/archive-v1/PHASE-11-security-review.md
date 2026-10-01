# Phase 11 — Security Review

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Walk `docs/SECURITY.md` against the real, finished code — not the plan — and close any gap between what was written and what was actually built.

## Context
Every phase above implemented its own piece of `docs/SECURITY.md`. This is the single pass that checks the whole thing together, the way a reviewer who didn't write any of the code would.

## Prerequisites
Phases 00–10 complete.

## Tasks
1. Re-read `docs/SECURITY.md` top to bottom against the actual repository, section by section
2. Confirm every secret in its table is genuinely server-only — grep the built client bundle for anything that shouldn't be there, don't just trust the source-file structure
3. Confirm every mutating route has both a session check and, where relevant, an ownership check — list every route and confirm each one explicitly, don't sample
4. Confirm `.gitignore` has actually kept every real secret out of git history — check the full commit history, not just the current working tree
5. Run `pnpm audit` (or check what Dependabot has already flagged) and address anything real
6. Re-verify the OWASP mapping in `docs/SECURITY.md` still matches the real code

## Files to Create
None expected — this phase finds and fixes, it doesn't add features.

## Files to Modify
Whatever the review finds.

## Implementation Requirements
N/A.

## Cloudinary Requirements
Confirm upload signing is still scoped and short-lived as designed, in the real deployed code — not just as originally specified.

## AI Requirements
Confirm the prompt-injection defenses in both Claude calls (Phase 06) are present in the actual shipped prompt text, not only described in a comment near it.

## Security Requirements
This entire phase is the security requirement.

## Testing Requirements
Re-run every Security Test from `docs/TESTING.md` once more, against the code as it stands after Phase 10's fixes — a review right after a round of bug fixes is exactly when a fix can quietly reopen a closed gap.

## Git Requirements
`chore(security): review and close gaps ahead of submission`, plus any specific `fix:` commits the review produces.

## Validation
A line-by-line walk of `docs/SECURITY.md` against the real code, every item explicitly confirmed, not assumed.

## Acceptance Criteria
Given the finished codebase, when checked against every item in `docs/SECURITY.md`, then every item is genuinely true of the real code.

## Definition of Done
No secret reachable from the client, no route missing its access check, no credential anywhere in git history, and `docs/SECURITY.md` corrected if reality diverged from it anywhere.
