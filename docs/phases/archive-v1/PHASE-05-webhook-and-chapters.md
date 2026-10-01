# Phase 05 — Webhook Handler + Chapter-Boundary Algorithm

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Receive Cloudinary's processing-complete notification, verify it's genuine, and turn the transcript and tags into real chapter boundaries — the one piece of logic in this whole product that's genuinely ours, not Cloudinary's.

## Context
This is the phase `docs/CLOUDINARY.md` and `docs/ARCHITECTURE.md` (diagrams 6, 7, 10) already described in detail. The async processing flow and the chapter-boundary algorithm are both realized here for the first time.

## Prerequisites
Phases 00–02 complete (database), Phase 01 complete (Cloudinary client), Phase 04 complete (a lecture must exist in `processing` status for there to be anything to webhook about).

## Tasks
1. Set the `notification_url` parameter on the upload call from Phase 04, pointing at this phase's new route
2. Build `POST /api/webhooks/cloudinary`: verify the `X-Cld-Signature` header before trusting anything in the payload
3. On a valid, successful notification: extract transcript and tags, run the chapter-boundary algorithm, write `chapters` and `transcript_segments` rows, set `lectures.status = 'ready'`
4. On a valid but failed/errored notification: set `lectures.status = 'chapters_pending'` — the `NFR4` degradation path, implemented for real
5. On an invalid signature: reject with `401`, log the attempt, write nothing to the database
6. Build the chapter-boundary algorithm as a pure, independently-testable function: transcript (timestamped segments) + tags (timestamped scene/topic markers) in, candidate chapter boundaries out — combining transcript pacing with tag-change points
7. Handle Cloudinary's webhook retries idempotently: check the lecture's current status before reprocessing, so a retried delivery for an already-`ready` lecture is a no-op, not a duplicate-row bug

## Files to Create
`src/app/api/webhooks/cloudinary/route.ts`, `src/lib/chapter-boundaries.ts`, `tests/unit/chapter-boundaries.test.ts`, `tests/integration/webhook.test.ts`

## Files to Modify
`src/lib/cloudinary.ts` — add `notification_url` to the upload call built in Phase 01/04.

## Implementation Requirements
The chapter-boundary algorithm takes no dependency on the database or the Cloudinary SDK — a pure function, transcript+tags in, boundaries out. That's what makes it fully unit-testable with no live service involved, and it's the single most reviewable piece of code in the project for exactly that reason.

## Cloudinary Requirements
Webhook payload shape follows Cloudinary's documented notification format for the transcription and auto-tagging add-ons. Confirm the actual field names against a real captured payload from Phase 01's manual test upload — not assumed from documentation alone. Add-on payload shapes are exactly the kind of detail that's easy to get subtly wrong secondhand. Chapter thumbnails use content-aware cropping (AI Content Analysis add-on) rather than a fixed-timestamp frame grab — a deliberate choice to genuinely exercise a named AI Skills Pack capability, not just the transcription/tagging already central to this phase (`docs/CLOUDINARY.md`, `docs/DECISIONS.md`).

## AI Requirements
None yet. This phase's intelligence is Cloudinary's transcript and tags plus a boundary-derivation algorithm — not an LLM call. Claude enters in Phase 06.

## Security Requirements
Signature verification happens before any parsing of the payload body, not after. This is the one endpoint in the whole system accepting unauthenticated input from the open internet (`docs/SECURITY.md`, `docs/ARCHITECTURE.md` diagram 10).

## Testing Requirements
Every relevant scenario from `docs/TESTING.md`'s table: malformed webhook payload; invalid signature (rejected, and explicitly checked — no DB write happens); a "processing failed" notification correctly driving `chapters_pending`, not a stuck `processing`; the concurrent-webhook-delivery idempotency case (two deliveries for one lecture, one set of chapters, not two).

## Git Requirements
`feat(webhook): add Cloudinary webhook handler and chapter-boundary algorithm`

## Validation
A real end-to-end run: upload a real short test video (Phase 04), let Cloudinary actually process it, confirm the webhook fires, confirm real chapters appear in the database with sensible boundaries.

## Acceptance Criteria
Given a valid, successful webhook notification, when it's received, then chapters and transcript segments are persisted and the lecture status becomes `ready`. Given an invalid signature, when a request hits this endpoint, then it's rejected with `401` and no database write occurs.

## Definition of Done
The full pipeline runs against one real uploaded video, end to end, producing chapters that are actually reasonable on inspection — not just a passing test suite, an actual human read of the output.
