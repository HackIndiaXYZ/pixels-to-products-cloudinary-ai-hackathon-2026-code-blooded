# Demo — Pravaha

Official limit: **2–4 minutes**. Target **2:45**. Recorded Day 3 evening after code freeze, on the deployed URL, with a real library of 5–8 sessions.

## The One Wow Moment

**Ask a question → the answer is a clip of your own teacher saying it → one tap turns it into a vertical short.** Everything else in the video sets this up or proves it's real.

## Principles

Never show setup, code, dashboards or waiting. Every shot is the problem, the product working, or proof it works *because of* Cloudinary. The processing wait is cut ("a few minutes later").

## Script

| Time | Shot | Voice-over |
|---|---|---|
| 0:00–0:15 | A Drive folder of 40 untitled lecture recordings; scrubbing a 90-min video, lost | "Our campus records hundreds of hours of lectures and talks. Nobody rewatches them — you can't find anything inside a video." |
| 0:15–0:25 | Title card: **Pravaha — ask your recordings, watch the answer.** | "Pravaha turns every recording into knowledge you can search, ask, and share." |
| 0:25–0:50 | Studio: drag in a raw recording, rights checkbox, real upload progress → cut → "Ready" | "An organizer uploads a raw recording. Cloudinary transcribes it, chapters it and prepares adaptive streaming — no editing." |
| 0:50–1:10 | Watch page: chapters on the seek bar, subtitles, click a chapter | "Every session gets AI chapters and subtitles, streamed adaptively." |
| 1:10–1:30 | Home → type a phrase → results across three sessions → click → plays from that exact second | "Find searches what was *said* across the whole library and drops you on the exact second." |
| **1:30–2:05** | **Ask:** "How do I stop my model from overfitting?" → answer with [1][2][3] → tap [2] → the professor explains it mid-sentence. Then ask "Who won the IPL?" → "Not covered in this library." | "Ask answers only from your recordings — and every claim is a clip of the moment it came from. If it isn't in the library, Pravaha says so." |
| **2:05–2:25** | **Share as Moment** → vertical subtitled clip, speaker tracked → native share sheet on a real phone → plays in WhatsApp | "One tap turns that moment into a vertical short — trimmed, AI-cropped to the speaker, subtitled. It's not a render job; it's a Cloudinary URL." |
| 2:25–2:35 | DevTools → Slow 3G → playback continues at lower quality | "And it holds up on a weak connection." |
| 2:35–2:45 | Architecture strip: Cloudinary (transcription · chaptering · player · g_auto · transformations) + Pravaha (retrieval · grounded Ask · Moments) · team | "Cloudinary turns video into data. Pravaha turns data into answers you can watch. Code Blooded, Track 3." |

## Pre-Recording Checklist

- Library: 5–8 public sessions, overlapping topics (so Ask cites across sessions), clear audio.
- The demo questions are in `tests/eval/ask-questions.json` and pass `pnpm eval:ask` the same evening.
- Moments used in the video are pre-warmed (opened once) so they play instantly.
- Phone screen recording ready for the share shot.
- Backup: a full-take screen recording of the flow, in case the live demo during judging stalls.

## Live Demo (if judges ask)

Same flow, on the live URL, with pre-processed sessions. Never upload live during judging; show an already-`ready` upload instead.
