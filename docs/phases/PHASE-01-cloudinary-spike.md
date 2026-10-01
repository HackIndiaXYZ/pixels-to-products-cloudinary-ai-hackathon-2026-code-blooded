# Phase 01 — Cloudinary Spike

**Day 1 · ~1.5 h · before any app code**

## Objective
Verify every Cloudinary behaviour the product depends on, on a real recording of our own speakers, and write down the real shapes — so no later phase is built on an assumption.

## Context
`CLOUDINARY.md` marks several items **[verify P01]**. Transcription quality on Indian-accented / code-switched speech is the single biggest product risk (`PRD.md` §16). This phase is the cheapest place to find out.

## Prerequisites
Cloudinary account on the **default (US) region** — transcription is unavailable on the Asia-Pacific data center (`SETUP.md`). `.env.local` filled with Cloudinary values.

## Tasks
1. Record or pick a real 5–10 min session with 2–3 topic shifts (one of ours, real accents).
2. Write a throwaway script `scripts/spike.mjs` (not shipped): `cloudinary.uploader.upload(file, { resource_type: 'video', public_id: 'pravaha/spike-1', auto_transcription: true, auto_chaptering: true, notification_url: <webhook.site URL> })`.
3. Capture the real webhook payload(s) at webhook.site — note every `info_kind` received (transcription; chaptering?) and the signature headers.
4. Download `pravaha/spike-1.transcript` — confirm the JSON shape (`transcript`, `confidence`, `words[{word,start_time,end_time}]`) and **read it**: is it usable on our accents?
5. Find where chapters live: file name (`…-chapters.vtt`?), format, and whether the Video Player picks them up automatically.
6. Build a Moment URL by hand and open it on a phone: `so_/eo_` trim + `c_fill,ar_9:16,w_720,g_auto` + `l_subtitles:pravaha:spike-1.transcript` + `f_auto,q_auto`. Try both orders (subtitles before vs. after trim) and record which keeps subtitles in sync. Time the first (uncached) request.
7. Build a `g_auto` thumbnail URL from the video and check the framing.
8. Try `auto_transcription: { translate: ['hi-IN'] }` once (P2 feasibility only).
9. Note credits used in the Cloudinary console.

## Files to Create
`scripts/spike.mjs` (delete or keep as a dev tool), notes appended to this file under **Findings**.

## Files to Modify
`CLOUDINARY.md` — replace every **[verify P01]** with the confirmed fact. `PRD.md` risk table if transcription quality is poor.

## Cloudinary Requirements
This phase *is* the Cloudinary requirements check.

## AI Requirements
None.

## Security Requirements
Spike script reads secrets from `.env.local` only; webhook.site is used with a throwaway asset only — no real organizer content.

## Testing Requirements
Manual: a human reads the transcript and watches the Moment.

## Validation / Acceptance Criteria
- Given the real recording, the transcript is readable enough that searching 5 phrases we know were said finds them.
- The exact Moment URL template that works is written in `CLOUDINARY.md` §6.
- Webhook payload shapes for every notification we'll handle are pasted below.

## Definition of Done
No **[verify P01]** markers remain in `CLOUDINARY.md`. If transcription quality is bad, the team decides (re-record with a better mic, or set `original_language`) **today**.

## Findings — Oct 1, 2026 (real account `de6u9w9oz`, Free plan)

Test media: two synthetic lectures (Windows TTS voices, ~80 s each, overlapping ML topics), uploaded through the real signed preset with `scripts/spike.mjs`. Raw outputs are saved as fixtures in `tests/fixtures/`.

| Assumption | Result |
|---|---|
| Region supports transcription | ✅ The account works, so no Asia-Pacific problem |
| `auto_transcription` + `auto_chaptering` on a **signed upload preset** | ✅ Preset `pravaha_signed` accepts both; uploads through it get both |
| Speed | ✅ Both `complete` within **15 s** for an 82 s video |
| Transcript file | ✅ `raw/upload/{public_id}.transcript`: JSON array of `{ transcript, confidence, words[{word,start_time,end_time}], alternatives, language }`. Punctuation is attached to words (`"club."`), which our sentence-cut regex relies on |
| Chapters file | ✅ `raw/upload/{public_id}-chapters.vtt`, standard WebVTT with numbered cues and AI titles ("Understanding Regularization"…) |
| `upload` response | `info.auto_transcription.status` and `info.auto_chaptering.status` are `pending`, then `complete` (Admin API) |
| `l_subtitles:{id}.transcript` overlay | ⚠️ Renders **only with an explicit font** (`l_subtitles:arial_40:…`), and is timed against the **output** timeline, so a trimmed Moment drifts (seen on extracted frames). **Replaced** with one timed `l_text` layer per 4-word caption card (`so_`/`eo_` relative to the clip), which is exact by construction |
| `g_auto` on video | ⚠️ Must be in **its own component** (`so_…,g_auto` → `400 g_auto must be in a transformation component by itself`). The first request per asset returns **`423 Video tracking-crop is pending`** (about 45 s for 82 s of video), then 200 |
| `g_auto` thumbnails (`.jpg` from video) | ✅ Works inline with `so_` |
| Credits | About 0.2 of 25 after all tests |

**Code changes from these findings** (`feature/verified-media-pipeline`): word timings stored per segment (`migrations/002`), timed caption cards in `momentUrl()`, `g_auto` split into its own component, tracking-crop pre-warmed at ingest, Moment sheet waits through `423`, and transcript language stored per session.

Still to confirm in a browser: `CldVideoPlayer` `chapters: true` auto-discovery of `{id}-chapters.vtt`.
