# Cloudinary Technical Design — Pravaha

This document answers one question for every capability used: **why Cloudinary, specifically, and what breaks without it.** Items marked **[verify P01]** are confirmed against docs but must be confirmed against real output in Phase 01 before code depends on them.

## 1. Architecture Overview

Cloudinary sits at the center. Our app orchestrates and reasons; Cloudinary ingests, understands, transforms and delivers.

```
Studio (browser) ──signed upload──▶ Cloudinary
                                     ├─ auto_transcription ─▶ {id}.transcript (word-level JSON)
                                     ├─ auto_chaptering ────▶ chapters (player reads them)
                                     └─ notification_url ───▶ /api/webhooks/cloudinary
Learner (browser) ◀── HLS adaptive stream · Moment clips · g_auto thumbnails ── Cloudinary CDN
```

## 2. Capability Map

| Pillar | Cloudinary capability | Without Cloudinary we'd need |
|---|---|---|
| Ingest | Signed direct upload (Upload Widget) | Large-file upload handling + object storage |
| Watch | `auto_transcription` | A speech-to-text pipeline (Whisper on GPUs) |
| Watch | `auto_chaptering` | A chaptering model |
| Watch | Video Player: HLS adaptive streaming, chapters, subtitles | An encoding ladder (FFmpeg) + HLS packaging + a player |
| Find / Ask | The transcript is the corpus both pillars search | Our own STT output |
| Moments | Trim (`so_`/`eo_`) + `c_fill,ar_9:16,g_auto` + `l_subtitles` + `f_auto,q_auto` | An FFmpeg render queue, face/subject tracking, subtitle burning, storage for every rendered clip |
| Library | `g_auto` video thumbnails, `f_auto,q_auto` | A frame-extraction job + image pipeline |
| Status | Webhooks (`notification_url`) | Polling the rate-limited Admin API |

## 3. Upload

The Studio uses `CldUploadWidget` in **signed** mode. Before the widget opens, `POST /api/upload-signature` (organizer-only) creates the `lectures` row and signs these params server-side:

```
public_id         = pravaha/<lecture uuid>      ← chosen by us, so the webhook always finds its row
resource_type     = video
auto_transcription = true                         (object form adds translate: ["hi-IN"] for P2) [verify P01]
auto_chaptering   = true                          [verify P01]
notification_url  = ${APP_URL}/api/webhooks/cloudinary
```

Upload preset (signed) caps file size at 500 MB and restricts formats to video. Bytes go browser → Cloudinary; our server never sees them.

## 4. AI Processing

- **`auto_transcription`** — produces raw asset `{public_id}.transcript`: JSON lines, each `{ transcript, confidence, words: [{ word, start_time, end_time }] }`. Word-level timing is what makes "jump to the exact second" and clip-precise citations possible. Webhook payload: `{ info_kind: "auto_transcription", info_status: "complete" | "failed", public_id }`.
- **`auto_chaptering`** — AI-identified chapter boundaries with titles; the Video Player renders them on the seek bar. Chapter titles are also attached to our segments for nicer search results. Output file name/format **[verify P01]**.
- **Region constraint:** transcription is unavailable on Cloudinary's Asia-Pacific data center. The account must be on the default (US) region (`SETUP.md`).

## 5. Delivery — Watch

`CldVideoPlayer` with `sourceTypes: ['hls']` (adaptive bitrate, codec/quality chosen per device), `chapters` enabled, subtitles from the transcript. A `?t=` query param seeks on load — that's how Find results and Ask citations deep-link into a session.

## 6. Transformations — Moments

A Moment is **a URL, not a render job**. Built by one pure function, `momentUrl(publicId, startS, endS)`:

```
https://res.cloudinary.com/<cloud>/video/upload/
  so_<start>,eo_<end>/                 trim to the cited segment (≤ 60 s, padded ±1.5 s)
  c_fill,ar_9:16,w_720,g_auto/         AI crop to vertical, tracking the speaker/subject
  l_subtitles:<public_id>.transcript/fl_layer_apply/   burned-in subtitles
  f_auto,q_auto/                       best format/quality per device
  <public_id>.mp4
```

Exact component order — particularly whether subtitles must precede the trim to stay in sync — is **[verify P01]**. First request generates the derivative (seconds); the UI shows "generating…" and pre-warms on click. A 60-second 720p clip is far below the free-plan on-the-fly video size limits.

## 7. Thumbnails

`so_auto` is not assumed; we use the session's first chapter start (or 10% of duration) with `c_fill,ar_16:9,w_640,g_auto,f_auto,q_auto` on a `.jpg` derived from the video — content-aware framing instead of a random frame.

## 8. Metadata

Tags: `pravaha` on every upload (makes the console filterable). Context: `title`, `speaker`. Structured metadata deliberately unused (free-plan field cap; Postgres holds what the app queries).

## 9. Webhooks

Signature verified with the SDK's `cloudinary.utils.verifyNotificationSignature(body, timestamp, signature)` against the raw request body before parsing. Idempotent: re-delivery replaces the session's segments in one transaction.

## 10. Rate Limits & Cost

Admin API: 500 req/hr on Free — we never poll it (webhooks + CDN fetches only). Free plan: 25 credits/month (1 credit ≈ 1,000 transformations or 1 GB storage or 1 GB bandwidth). Video transcription and video transformations are the heavy items; test clips stay short (3–10 min) and usage is checked daily.

## 11. SDKs

`cloudinary` (Node, server-side: signing, webhook verification) · `next-cloudinary` (client: Upload Widget, Video Player, URL helpers).

## Why Cloudinary, Restated Plainly

Remove Cloudinary and Pravaha loses its transcript (no Find, no Ask, no subtitles), its chapters, its adaptive playback, and every Moment — each of which would otherwise need its own GPU, FFmpeg or CDN pipeline. What's left is a search box over nothing.

**What we built on top** (the answer to "what did you build vs. call"): transcript → time-coded segment indexing; cross-library retrieval and ranking; grounded Ask with server-side citation validation and refusal; the Moment URL composer; the learner and organizer experience. Cloudinary turns video into data; Pravaha turns that data into answers you can watch.
