# Phase 04 — Upload Flow

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
A signed-in organizer can select a video file and have it land in Cloudinary, with a `lectures` row created in `processing` status the moment the upload succeeds.

## Context
This is where Phase 01 (Cloudinary), Phase 02 (database), and Phase 03 (auth) come together for the first time — the first real, end-to-end user-facing flow in the product.

## Prerequisites
Phases 00 through 03 complete.

## Tasks
1. Build `POST /api/upload-signature` — session-gated via Phase 03's helper, calls Phase 01's signing function, returns signed params
2. Build the upload UI: file picker/drag-and-drop, requires an explicit confirmation checkbox ("I have the right to record and publish this session") before the upload can start (`FR13`), then requests a signature and uploads directly to Cloudinary with real progress reporting (per `docs/UX_UI.md` — no fake progress bars)
3. On confirmed upload success (from Cloudinary's own response to the direct upload call — not a webhook; that's Phase 05), create the `lectures` row with `status = 'processing'`, `visibility = 'unlisted'` by default, and the real `cloudinary_public_id`
4. Redirect to the processing-status view

## Files to Create
`src/app/api/upload-signature/route.ts`, `src/app/(organizer)/upload/page.tsx`, `src/lib/lectures.ts`

## Files to Modify
None — this is the first route handler built on top of the scaffold.

## Implementation Requirements
The `lectures` row is created only after Cloudinary confirms success — never optimistically beforehand. An upload that fails partway through should leave no phantom "processing" row with nothing behind it.

## Cloudinary Requirements
`resource_type: video`; `max_file_size` capped at 500MB through the signed parameters themselves (`docs/SECURITY.md`'s upload security section), not just checked client-side where it could be bypassed.

## AI Requirements
None in this phase — that begins in Phase 05/06.

## Security Requirements
`/api/upload-signature` is session-gated using the exact pattern proven in Phase 03. No unauthenticated path can obtain a valid signature.

## Testing Requirements
Per `docs/TESTING.md`'s Upload Tests: valid video succeeds end-to-end; an unauthenticated attempt gets `401` before ever reaching Cloudinary; an oversized file is rejected; an unsupported file type is rejected.

## Git Requirements
`feat(upload): add signed upload flow and lecture record creation`

## Validation
A real video file, uploaded through the actual UI, lands in Cloudinary and produces a `lectures` row with the correct `cloudinary_public_id` and `status = 'processing'`.

## Acceptance Criteria
Given a signed-in organizer and a valid video file, when the upload completes, then a `lectures` row exists with `status = 'processing'` and a real, correct `cloudinary_public_id`.

## Definition of Done
The full upload flow works end-to-end in the dev environment, file selection to visible "processing" state, matching `docs/UX_UI.md` exactly.
