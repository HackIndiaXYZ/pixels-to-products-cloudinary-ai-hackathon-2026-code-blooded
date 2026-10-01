# Phase 09 — Organizer Chapter Editing

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Let the organizer who owns a lecture edit its auto-generated chapter titles and summaries before (or after) it's public — `FR8` in `docs/PRD.md`.

## Context
Cloudinary and Claude get the chapters most of the way there; this phase is the human-in-the-loop correction step, and the one place in the product where ownership-checking matters most, since it's the only mutating action a signed-in user can take on someone else's data if the check is missing.

## Prerequisites
Phase 03 (auth), Phase 05 (chapters exist), Phase 07 (the player page they're edited from).

## Tasks
1. Build `PATCH /api/lectures/:id/chapters/:chapterId`: session-gated, then ownership-checked (`session.user.id === lecture.organizer_id`), then validated (`title` non-empty, ≤120 characters, per `docs/API.md`)
2. Add the inline edit affordance to the chapter rail — per `docs/UX_UI.md`, a pencil icon next to each title, rendered only when the viewer is the owning organizer, not a separate "edit mode" toggle
3. Optimistic UI update on save, with a real rollback on failure — not a silent no-op if the request fails

## Files to Create
`tests/integration/chapter-edit.test.ts`

## Files to Modify
`src/app/api/lectures/[id]/route.ts` (or a new nested route file for the chapter sub-resource), `src/components/ChapterRail.tsx`, `src/lib/lectures.ts` (add the update function)

## Implementation Requirements
The ownership check happens on the server, on every call, not inferred from the UI only showing the pencil icon to the right person — a UI-only check is not a check. `docs/SECURITY.md`'s Authorization section already establishes this as a defense-in-depth requirement, not new here.

## Cloudinary Requirements
None — this phase only touches Postgres metadata (`docs/DATABASE.md` — Cloudinary never had chapter titles as ground truth in the first place; that's why editing them here doesn't require touching Cloudinary at all).

## AI Requirements
None — this is where AI-generated output stops being final and becomes an editable starting point, which is the point of the feature.

## Security Requirements
`403`, not `404`, for a non-owner editing attempt on a chapter that does exist — the distinction matters for a correct API, and `docs/API.md` already specifies it this way.

## Testing Requirements
The exact test `docs/TESTING.md` already lists under Security Tests: a non-owner attempts an edit, gets `403`, and — checked explicitly — the chapter is unchanged in the database afterward.

## Git Requirements
`feat(chapters): add organizer chapter title editing`

## Validation
As the owning organizer, edit a real chapter title on a real lecture; confirm it persists and renders correctly on reload. As a different signed-in user, attempt the same edit; confirm it's rejected and nothing changed.

## Acceptance Criteria
Given the owning organizer, when they edit a chapter title, then the change is persisted and visible on reload. Given a different signed-in user, when they attempt the same edit, then it's rejected with `403` and the chapter is unchanged.

## Definition of Done
Editing works end-to-end for the owner, is provably blocked for everyone else (not just untested), and the UI never offers the affordance to someone it would reject anyway.
