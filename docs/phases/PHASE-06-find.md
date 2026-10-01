# Phase 06 — Find

**Day 2 · ~2 h**

## Objective
Search every published session for what was *said* and land on the exact second.

## Context
`DATABASE.md` (Find query), `API.md` (`GET /api/search`), `UX_UI.md` (results).

## Prerequisites
Phase 05 (segments exist).

## Tasks
1. `src/lib/search.ts` — `findSegments(q, {lectureId?, limit})` using `websearch_to_tsquery('english', $1)`, `ts_rank_cd`, `ts_headline` (StartSel `<b>`, StopSel `</b>`, MaxWords 24), public+ready filter unless scoped to a lecture.
2. `GET /api/search` with Zod validation.
3. `src/lib/html.ts` — escape snippet HTML, then restore only `<b>`/`</b>`.
4. Results UI (`/search?q=` "Moments found" list): session title, speaker, timestamp chip, highlighted snippet, chapter title → link `/watch/<id>?t=<startS>`.
5. Empty state: "Nothing said matches — try different words, or Ask."

## Files to Create
`src/lib/search.ts`, `src/lib/html.ts`, `src/app/api/search/route.ts`, `src/app/search/page.tsx`, `src/components/ResultCard.tsx`, `tests/unit/html.test.ts`

## Cloudinary Requirements
Result cards show a small `g_auto` frame at the segment start (same helper as Phase 07 thumbnails).

## AI Requirements
None — Find is deliberately AI-free and instant; Ask (Phase 08) is the AI layer.

## Security Requirements
Parameterized SQL; snippet escaping tested; unlisted sessions excluded from library-wide search.

## Testing Requirements
Unit: snippet escaping (`<script>` in a transcript stays inert). Manual: 5 known phrases across 3 sessions each land within ±2 s.

## Acceptance Criteria
Given a phrase spoken in a published session, searching it returns that session and clicking plays from that second.

## Definition of Done
**Half of Day 2's gate met** on the deployed URL.
