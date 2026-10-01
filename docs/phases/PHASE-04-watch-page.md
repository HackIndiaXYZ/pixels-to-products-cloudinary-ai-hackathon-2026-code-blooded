# Phase 04 — Watch Page

**Day 1 · ~1.5 h**

## Objective
`/watch/[id]` plays a session in the Cloudinary Video Player — adaptive HLS, AI chapters on the seek bar, subtitles from the transcript — and honours `?t=` so every Find result and Ask citation can deep-link to an exact second.

## Context
`CLOUDINARY.md` §5, `UX_UI.md` (Watch), `DECISIONS.md` (why the Cloudinary player, not `<video>` + `sp_auto`).

## Prerequisites
Phase 03 (a real uploaded session).

## Tasks
1. `src/app/watch/[id]/page.tsx` — server component: load the lecture (404 page if missing), render title, speaker, status.
2. `src/components/Player.tsx` (client) — `CldVideoPlayer` with `sourceTypes={['hls']}`, chapters enabled, subtitles/text tracks from the transcript (Phase 01's confirmed config); seek to `?t=` on `loadedmetadata`.
3. Status-aware states: `processing` → video plays, a calm "transcribing — search and chapters coming" note; `transcript_failed` → video plays, "this session isn't searchable."
4. Mobile layout: player full-width, metadata below.

## Files to Create
`src/app/watch/[id]/page.tsx`, `src/app/watch/[id]/not-found.tsx`, `src/components/Player.tsx`

## Cloudinary Requirements
HLS adaptive streaming, chapters, subtitles — all through the Video Player.

## AI Requirements
None (Cloudinary's chapters/transcript are displayed, not processed).

## Security Requirements
Unlisted sessions are viewable by direct link only (never listed) — consistent with `API.md`.

## Testing Requirements
Manual: `?t=125` starts at 2:05 on Chrome desktop, Safari iOS and Chrome Android; DevTools "Slow 3G" degrades quality without a hard stall.

## Acceptance Criteria
Given a ready session, the deployed watch page shows chapters on the seek bar, subtitles, and seeks to `?t=`.

## Definition of Done
**Day 1 evening gate met:** uploaded from the deployed Studio → watched with chapters + subtitles on the deployed URL.
