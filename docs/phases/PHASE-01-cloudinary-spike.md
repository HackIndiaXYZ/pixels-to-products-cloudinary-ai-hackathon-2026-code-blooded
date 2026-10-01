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

## Findings
_Fill in during the spike._
