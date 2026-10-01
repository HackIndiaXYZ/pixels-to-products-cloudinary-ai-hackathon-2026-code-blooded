# Phase 10 — Testing Pass

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Actually run every scenario in `docs/TESTING.md`'s table against the real, now-complete feature set (Phases 01–09) — not just the tests written alongside each phase in isolation.

## Context
Each phase above already specifies its own tests. This phase is the integration pass: the scenarios that only make sense once everything exists together (the full E2E path, webhook behavior under closer-to-real conditions), and closing the gap between "each phase's tests pass" and "the product works as one system."

## Prerequisites
Phases 00–09 complete.

## Tasks
1. Run the full scenario checklist from `docs/TESTING.md` end to end, and mark each one genuinely verified, not "should pass"
2. Run the real E2E test (Playwright) against a deployed preview instance, not just localhost
3. Deliberately trigger every failure mode once: kill the network mid-upload, send a malformed webhook, force a Claude failure, hit the search rate limit — confirm each produces the documented graceful behavior, not a crash
4. Fix whatever this pass actually finds — it's expected to surface real bugs, not just confirm their absence
5. Update `docs/TESTING.md` itself if anything in the original plan turns out wrong or incomplete

## Files to Create
None new in principle — this phase completes and fixes what earlier phases' test files started.

## Files to Modify
Whatever the pass's findings require — unknown until the pass actually runs, which is the nature of this phase.

## Implementation Requirements
N/A — this phase verifies implementation, it doesn't add features.

## Cloudinary Requirements
Confirm real Cloudinary API failure/timeout behavior at least once against the live sandbox, not only mocked, per `docs/TESTING.md`'s Cloudinary Integration Tests.

## AI Requirements
Confirm both Claude fallback paths (Phase 06) trigger correctly under a real forced failure, not only a mocked one.

## Security Requirements
Every Security Test in `docs/TESTING.md` run for real, including the ones easy to skip because they're "supposed" to fail correctly — confirm the rejection *and* the absence of any side effect, not just the status code.

## Testing Requirements
This entire phase is the testing requirement.

## Git Requirements
`test: complete integration pass across all core flows`, plus individual `fix:` commits for whatever the pass finds.

## Validation
Every row in `docs/TESTING.md`'s scenario table run for real and marked as such.

## Acceptance Criteria
Given the full feature set, when every scenario in `docs/TESTING.md` is run, then each one behaves exactly as that document specifies.

## Definition of Done
No scenario in the table is untested, no known failure mode is unhandled, and any doc that turned out wrong during this pass has been corrected.
