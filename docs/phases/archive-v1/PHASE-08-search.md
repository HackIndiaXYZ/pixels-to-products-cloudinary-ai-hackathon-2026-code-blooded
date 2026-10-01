# Phase 08 — Search

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Single-lecture search (P0) and cross-lecture search (P1) both working, per `docs/API.md`'s `/api/search` spec and `docs/AI_EVALUATION.md`'s query-normalization function.

## Context
This is the second half of the product's core claim — "search beats scrubbing" — and the demo's second proof point (`docs/DEMO.md`).

## Prerequisites
Phase 02 (the GIN index on `transcript_segments.search_vector` already exists from the schema), Phase 06 (query-normalization function), Phase 07 (a player page to seek within, so a result actually does something).

## Tasks
1. Build `POST /api/search`: normalize the query (Phase 06), run it against Postgres full-text search, scoped to one lecture if `lectureId` is present (P0) or across all `ready` lectures if not (P1)
2. Wire the search bar into the lecture player page (single-lecture, P0) and the landing page (cross-lecture, P1)
3. On a single-lecture match: highlight the matching chapter(s) in the rail, support jump-to-timestamp
4. On a cross-lecture match: render the flat-list UI specified in `docs/UX_UI.md` — lecture, chapter, snippet
5. Add the per-IP rate limit specified in `docs/SECURITY.md` for this endpoint specifically — the one public, unauthenticated route doing real work (a Claude call plus a database query)

## Files to Create
`src/app/api/search/route.ts`, `src/lib/search.ts`, `src/components/SearchBar.tsx`, `src/components/SearchResults.tsx`

## Files to Modify
`src/app/lectures/[id]/page.tsx` (mount the search bar), `src/app/page.tsx` (landing page, cross-lecture search).

## Implementation Requirements
The `lectureId` parameter is what distinguishes P0 from P1 behavior inside one function — not two separate code paths that could quietly drift apart. `docs/API.md` specifies this as a single endpoint on purpose.

## Cloudinary Requirements
None directly — search runs against Postgres, per the decision already recorded in `docs/DECISIONS.md` (full-text search over a vector database, for P0/P1).

## AI Requirements
Query normalization (Phase 06) runs on every search request. Its fallback — raw query straight to `tsquery` — must be exercised and confirmed working, not assumed to work just because it looks simple.

## Security Requirements
The rate limit specified in `docs/SECURITY.md` and `docs/API.md` is implemented here, not deferred — this is the phase it belongs to.

## Testing Requirements
Per `docs/TESTING.md`: empty-query validation (`400`), a real search matching known transcript content, and the rate-limiting test — requests past the threshold get throttled.

## Git Requirements
`feat(search): add single-lecture and cross-lecture search`

## Validation
Search a phrase actually spoken in a real processed test lecture; confirm it returns the correct chapter and seeking works — the exact live check `docs/DEMO.md`'s script depends on.

## Acceptance Criteria
Given a lecture with a transcript, when a viewer searches a term present in it, then the matching chapter is returned and seekable. Given a query with no matches, when searched, then the empty-state UI from `docs/UX_UI.md` is shown, not an error.

## Definition of Done
Both search modes work against real processed lectures, the rate limit is verified to actually trigger under load, and the demo script's search moment has been run for real at least once.
