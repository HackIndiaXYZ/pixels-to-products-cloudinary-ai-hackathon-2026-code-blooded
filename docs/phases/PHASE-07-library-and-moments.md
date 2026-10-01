# Phase 07 — Library + Moments

**Day 2 · ~3 h**

## Objective
A home page that looks like a product (hero Ask bar + library grid with content-aware thumbnails), and **Moments**: any segment becomes a vertical, AI-cropped, subtitled, shareable clip — as a URL.

## Context
`CLOUDINARY.md` §6–7 (Moment + thumbnail URLs, Phase 01's confirmed template), `UX_UI.md` (Home, Moment sheet), `DESIGN_SYSTEM.md`.

## Prerequisites
Phases 04, 06.

## Tasks
1. `src/lib/media.ts` — **pure** builders: `momentUrl(publicId, startS, endS)` (pad ±1.5 s, clamp to [0, duration], max 60 s, round to 0.1 s), `thumbUrl(publicId, atS)`, `posterUrl`.
2. Home `/`: hero with the Ask/search bar (submits to `/search?q=`), library grid of public+ready sessions (thumbnail, title, speaker, duration). Empty state explains the product in one line.
3. `src/components/MomentSheet.tsx` — opened from any result/citation: shows the vertical clip in a phone-shaped frame, "generating…" state until `canplay`, buttons **Share** (`navigator.share({ url })`, fallback **Copy link**) and **Open full session**.
4. "Share this moment" on the Watch page: Moment of the current segment (current time → enclosing segment).
5. Studio: publish/unpublish toggle (`PATCH /api/lectures/:id`).

## Files to Create
`src/lib/media.ts`, `src/components/LibraryGrid.tsx`, `src/components/MomentSheet.tsx`, `src/app/api/lectures/[id]/route.ts` (GET + PATCH), `tests/unit/media.test.ts`

## Cloudinary Requirements
Trim, `c_fill,ar_9:16,g_auto`, `l_subtitles`, `f_auto,q_auto` (Moments); `g_auto` thumbnails. The URL template is the one Phase 01 proved — not re-guessed.

## AI Requirements
Cloudinary's `g_auto` subject tracking is the AI here.

## Security Requirements
Clip length bounded at 60 s by the builder (abuse/cost control).

## Testing Requirements
Unit: `momentUrl` padding, clamping, 60 s cap, exact URL string snapshot. Manual: open a Moment link on WhatsApp — preview and playback work.

## Acceptance Criteria
Given any search result, "Share as Moment" produces a vertical subtitled clip of that exact moment that plays on a phone.

## Definition of Done
**Day 2 evening gate met.** Library has 5–8 real published sessions.

## As Built (diverged from the spec above)
- `MomentSheet` became `MomentButton` — a native `<dialog>` that mounts the clip `<video>` only when opened (opening is what triggers Cloudinary to generate the derivative), plus `navigator.share` with a copy-link fallback.
- The publish toggle and `PATCH /api/lectures/:id` shipped earlier, in Phase 03, because the Studio needed them.
- The P1 interactive transcript (`WatchView`) shipped here: it follows playback, you click a line to seek, and you can filter within the session.
- Home topic chips come from the library's most-covered chapter titles (`popularTopics()`), not hard-coded examples.
- `clipUrl()` (16:9 trimmed clip) was added for inline citation playback in Phase 08.
