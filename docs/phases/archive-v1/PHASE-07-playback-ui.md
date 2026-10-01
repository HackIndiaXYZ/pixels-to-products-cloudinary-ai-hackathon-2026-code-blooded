# Phase 07 — Playback UI

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
The lecture player page from `docs/UX_UI.md` — adaptive video playback, chapter rail, seeking — working against a real processed lecture.

## Context
This is the first phase a viewer, not just the organizer, actually experiences. Everything before this was pipeline; this is product.

## Prerequisites
Phase 05 complete (chapters exist to render), Phase 06 complete (chapter titles are clean, not raw fragments).

## Tasks
1. Build `GET /api/lectures/:id`: returns lecture + ordered chapters + tags, respecting the visibility rule in `docs/API.md` — `unlisted` (the default, `FR13`) is reachable by direct link but never listed; organizers always see their own regardless of status or visibility
2. Build the lecture player page: HTML5 `<video>` pointed at the Cloudinary `sp_auto` delivery URL, chapter rail alongside with thumbnails
3. Wire chapter-click-to-seek
4. Build the processing-status view for lectures not yet `ready`, including the `chapters_pending` honest-degradation copy from `docs/UX_UI.md`
5. Build the empty/loading/error states specified there: `404` for a lecture that doesn't exist or isn't visible yet, skeleton loaders instead of bare spinners

## Files to Create
`src/app/api/lectures/[id]/route.ts`, `src/app/lectures/[id]/page.tsx`, `src/components/ChapterRail.tsx`, `src/components/VideoPlayer.tsx`

## Files to Modify
`src/lib/lectures.ts` — add the single-lecture-with-chapters query.

## Implementation Requirements
Per `NFR1` (`docs/PRD.md`), this is a standard HTML5 video element pointed at the delivery URL — no custom streaming library. Cloudinary's CDN and `sp_auto` already do the adaptive-quality work; the player only needs to point at the right URL.

## Cloudinary Requirements
The `sp_auto` transformation parameter on the delivery URL (`docs/CLOUDINARY.md`); chapter thumbnails via frame-extraction transformations at each chapter's `start_seconds`.

## AI Requirements
None new — this phase renders what Phases 05 and 06 already produced.

## Security Requirements
The visibility rule (only `ready`, unless you're the organizer) is enforced server-side, in the API route — not just hidden in the UI. A direct request to the endpoint for a non-visible lecture must also return `404`, not merely be un-linked from the UI.

## Testing Requirements
An API test for the visibility rule specifically: an anonymous request for a `processing` lecture gets `404`; the organizer's own request for the same lecture succeeds. This is also where the E2E test's "chapters render, seek works" portion (`docs/TESTING.md`) becomes real for the first time.

## Git Requirements
`feat(player): add lecture playback page with chapter rail and adaptive delivery`

## Validation
Open a real processed lecture in a browser: playback works, every chapter click seeks correctly, and a throttled-connection test — the demo's own technical-proof moment (`docs/DEMO.md`) — actually holds up.

## Acceptance Criteria
Given a `ready` lecture, when a viewer opens its page, then the video plays and every chapter in the rail seeks to its correct timestamp on click.

## Definition of Done
A real lecture, uploaded and processed through Phases 04–06, is fully watchable and navigable through this UI — the first point in the project with something to actually show someone.
