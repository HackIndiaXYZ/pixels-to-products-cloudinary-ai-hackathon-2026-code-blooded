# Product Requirements Document — Pravaha

**Hackathon:** Pixels to Products — Cloudinary AI Hackathon 2026 (HackIndia × Cloudinary)
**Team:** Code Blooded
**Track:** PS-03 · Track 3 — Your Media-Savvy Startup (27 teams, the least crowded track; see `DECISIONS.md`)
**Build window:** Oct 1 – Oct 3, 2026 · submission Oct 4 (see `IMPLEMENTATION_PLAN.md`)
**Status:** v2 — re-scoped Oct 1 (see `STRATEGY_REVISIT.md`, "Revisit 2")

---

## 1. Executive Summary

**Pravaha — ask your recordings, watch the answer.**

Colleges, clubs and coaching institutes record hundreds of hours of talks and lectures that nobody rewatches, because nothing inside them can be found. Pravaha turns a library of raw recordings into knowledge you can search and question:

- **Watch** — upload a raw recording; Cloudinary transcribes it, chapters it, and streams it adaptively. Zero editing.
- **Find** — search every session at once for what was *said*, and land on the exact second.
- **Ask** — ask a question in plain language; get an answer grounded only in your own recordings, where every claim is a **playable clip** of the moment it came from.
- **Moments** — turn any cited clip into a vertical, AI-cropped, subtitled short in one click, ready for WhatsApp or Instagram. No render farm — the short is a Cloudinary URL.

The one-line pitch to a judge: *ChatGPT gives you text. Pravaha gives you the moment your professor said it.*

## 2. Problem Statement

Valuable recorded sessions — lectures, club talks, workshops, guest sessions — are recorded once and effectively lost. They sit as unstructured files on Drive, unlisted on YouTube, or forwarded over WhatsApp. There are no chapters, no way to find where a concept was explained, and no way to reuse a great two-minute explanation buried inside a 90-minute file. The recording exists; the knowledge inside it doesn't get reused.

## 3. Why This Is a Startup, Not a Feature

| Question | Answer |
|---|---|
| Who pays? | Coaching institutes and college departments (library of sessions, private by default); later, companies with recorded all-hands and trainings |
| Why now? | Speech-to-text, AI chaptering and AI cropping are now one API parameter each (Cloudinary). Grounded LLM answers are reliable when citations are constrained. The cost of turning video into searchable knowledge just collapsed. |
| Why not YouTube? | YouTube streams one video well. It can't answer "where did *anyone* in our 40 sessions explain overfitting?", can't keep a library private-by-default, and can't cut a shareable subtitled vertical clip from an answer. |
| Why not ChatGPT/NotebookLM? | They answer in text. The trust and the value are in the *source moment* — a playable clip from the actual teacher, not a paraphrase. |
| Growth loop | Every shared Moment is a branded vertical clip that links back to the full session — the content markets the library. |

## 4. Target Users

- **Primary:** College clubs and departments recording talks, workshops and lectures (our own campus is the first user).
- **Secondary:** Coaching institutes and tutors recording long-form (30+ min) sessions. Chapters, search and Ask add little to a 10-minute clip; they matter on long sessions and large libraries.

## 5. Personas

**The Organizer** — records sessions for a club, department or institute. Wants them reused, not archived and forgotten. Wants control over what's public.

**The Learner** — a student the night before an exam. Doesn't remember which session covered a topic. Wants the explanation, from their own teacher, in under ten seconds — on a phone, on a weak connection.

## 6. Jobs-to-be-Done

- When I've recorded a session, I want it published as navigable, searchable video without editing anything.
- When I'm revising, I want to ask a question and *watch* the exact moment it was explained, across every session.
- When I find a great explanation, I want to share just that moment as a clip my friends will actually watch.

## 7. User Stories

| ID | As a... | I want... | So that... | Priority |
|---|---|---|---|---|
| US-1 | Organizer | to upload a raw recording and get a transcribed, chaptered, adaptive video with no editing | sessions get published the same day | P0 |
| US-2 | Learner | to search every session for a phrase and jump to the exact second | I don't scrub through hours of video | P0 |
| US-3 | Learner | to ask a question and get an answer cited with playable clips | I trust it and can watch the source | P0 |
| US-4 | Learner | to share a cited moment as a vertical subtitled clip | the explanation travels on WhatsApp/Instagram | P1 |
| US-5 | Learner | playback to hold up on a slow connection | I can watch on mobile data | P0 |
| US-6 | Organizer | new uploads to be unlisted until I publish them | nothing goes public by accident | P0 |
| US-7 | Learner | subtitles in Hindi on an English session | language isn't a barrier | P2 |

## 8. User Journey

Organizer: enter passcode → upload with title, speaker, rights confirmation → "processing" status → ready → publish.
Learner: open home → type a question → answer with 2–4 cited clip cards → play a clip inline → "Open full session" (jumps to the second) or "Share as Moment" (vertical short, native share sheet).

## 9. Goals

1. Prove a raw recording becomes searchable, askable knowledge with zero manual editing.
2. Make Cloudinary the product's backbone — ingestion, AI, transformation and delivery — visibly, in the demo.
3. Ship something our own campus can use the week after the hackathon.

## 10. Non-Goals

- Not an LMS (no enrollment, payments, grades)
- No live streaming, no DRM
- No open-web answers — Ask answers only from the library, or says it can't
- No vector database (Postgres full-text retrieval is enough at this scale; see `DECISIONS.md`)

## 11. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | Signed, direct-to-Cloudinary video upload from an organizer-only Studio | P0 |
| FR2 | Upload requests Cloudinary `auto_transcription` and `auto_chaptering` | P0 |
| FR3 | Playback via the Cloudinary Video Player: adaptive streaming, chapters, subtitles | P0 |
| FR4 | Webhook ingests the transcript into time-coded, searchable segments | P0 |
| FR5 | **Find:** full-text search across all published sessions, results jump to the exact second | P0 |
| FR6 | **Ask:** natural-language question → grounded answer with validated citations to transcript segments, each rendered as a playable clip | P0 |
| FR7 | Ask refuses (says "not covered in this library") when no retrieved segment supports an answer | P0 |
| FR8 | **Moments:** one-click vertical 9:16 clip of any segment — trimmed, AI-cropped (`g_auto`), subtitled, `f_auto`/`q_auto` — shared via the native share sheet or copied link | P1 |
| FR9 | Rights confirmation before upload; new sessions default to `unlisted`; organizer publishes explicitly | P0 |
| FR10 | Interactive transcript on the watch page — click any line to seek | P1 |
| FR11 | Content-aware library thumbnails (`g_auto`) | P1 |
| FR12 | Translated subtitles (e.g. Hindi) via `auto_transcription.translate` | P2 |

## 12. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | Video bytes never pass through our server — upload and delivery are browser ↔ Cloudinary |
| NFR2 | Processing status is always visible to the organizer — never a silent black box |
| NFR3 | Cloudinary API secret, Gemini key and DB URL are server-only |
| NFR4 | **Graceful degradation everywhere:** transcription fails → video still plays; the AI fails → Ask falls back to Find results as clips; Moment transform slow → "generating" state, never a broken player |
| NFR5 | Ask is rate-limited per IP and globally capped per day (it costs money and is public) |
| NFR6 | Mobile-first; core flows need no training |
| NFR7 | Dev and demo usage stays within Cloudinary's free tier |

## 13. Feature Prioritization

| Tier | Includes |
|---|---|
| **P0** | Studio upload · transcription · chaptering · adaptive player · Find across library · Ask with clip citations · unlisted-by-default |
| **P1** | Moments (vertical shareable clips) · interactive transcript · `g_auto` thumbnails |
| **P2** | Hindi subtitles · per-session Ask scope toggle |
| **Out** | Accounts for learners, multi-tenant institutes, analytics, LMS features |

## 14. Acceptance Criteria (P0)

- Given an uploaded video, when Cloudinary finishes transcription, then the session moves `processing` → `ready` with no manual step, and its transcript is searchable.
- Given a phrase spoken in any published session, when a learner searches it, then the result opens that session at that second (±2 s).
- Given a question covered by the library, when asked, then the answer cites ≥1 segment and every citation plays the right clip.
- Given a question **not** covered by the library, when asked, then Pravaha says so instead of inventing an answer.
- Given Chrome DevTools "Slow 3G", when a session plays, then quality drops but playback doesn't hard-stall.
- Given a new upload, then it is `unlisted` and absent from Find/Ask until published.

## 15. Success Metrics

- Upload → ready time for a 10-minute session
- Time-to-answer: scrubbing for an explanation vs. Ask (demoed side by side)
- Citation precision on a 10-question manual eval set (`AI_EVALUATION.md`)

## 16. Assumptions & Risks

| Risk | Mitigation |
|---|---|
| Transcription quality on Indian-accented / code-switched speech | Tested on Day 1 with a real recording before any app code (Phase 01) |
| `auto_chaptering` / Moment URL syntax differ from docs | Phase 01 verifies every Cloudinary assumption on real output |
| Free-tier credits burn on video AI + transforms | Short test clips, usage checked daily in the Cloudinary console |
| Ask hallucinates | Citations constrained to retrieved segment IDs, validated server-side; zero valid citations → refusal |
| 3-day window | Strict phase order, cut list in `IMPLEMENTATION_PLAN.md`, deployed build every evening |
| Transcription unavailable on Cloudinary's Asia-Pacific data center | Account created on the default (US) region — `SETUP.md` |

## 17. Dependencies

Cloudinary (free tier, US region) · Neon Postgres (free) · Vercel (Hobby) · Google Gemini — for Ask and Study Packs.

## 18. Future Roadmap

Institute workspaces and learner accounts · Moments analytics (which explanations get shared) · quiz/flashcards generated from a session with clip-backed answers · semantic retrieval (embeddings) once the library outgrows keyword retrieval · LMS embeds.
