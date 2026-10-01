# Strategy Revisits — Pravaha

Fresh re-evaluations of the plan against the real source material, newest first. Each records what changed and why, so the reasoning survives the change.

---

## Revisit 2 — Oct 1, 2026 (build start): from "lecture player" to "ask your recordings"

Re-read the live problem statement (821 teams: Track 1 = 57, Track 2 = 41, **Track 3 = 27**), verified Cloudinary's current video capabilities against its docs, and checked the calendar.

### Finding 1 — Cloudinary already ships the v1 core
`auto_transcription` and `auto_chaptering` are single upload parameters, the Cloudinary Video Player renders the chapters, and Cloudinary runs a public "AI Transcription and Chaptering" demo. v1's "one piece of custom logic" — a chapter-boundary algorithm — rebuilt a native feature. A Cloudinary judge's first question would have been "why not `auto_chaptering=true`?"
**Fix:** use the native features; move our original engineering to where Cloudinary stops — across a library, answering questions, and turning answers into shareable clips (**Find, Ask, Moments**).

### Finding 2 — v1 differentiation was single-video; real value is library-wide
Our own v1 revisit said "lead with search and private-library control." v2 makes that the product: Find and Ask span every published session; Ask returns **clips of the source moment**, not text.

### Finding 3 — The playback approach was fragile
`sp_auto` yields HLS; a plain `<video>` element isn't a safe bet on Chromium desktop. **Fix:** Cloudinary Video Player (also renders chapters and subtitles).

### Finding 4 — Track 1 does mention video
v1 docs claimed Track 1 never names video. The live page lists "image and video transformations" and gives a video-pipeline example. Track 3 remains the right choice — it's the least crowded and its examples describe a media-centric *startup*, which is what Pravaha is. Docs corrected.

### Finding 5 — Three days, zero app code
Event ends Oct 4; on Oct 1 only Phase 00 existed. v1's 14 phases (OAuth, Upstash, custom chaptering, chapter editing, LLM title cleanup) couldn't land. **Fix:** 10 phases in 3 days, every cut traced in `DECISIONS.md`, a strict cut list in `IMPLEMENTATION_PLAN.md`.

### Finding 6 — Region trap
Cloudinary transcription is unavailable on its Asia-Pacific data center — an easy mistake for an India-based team. `SETUP.md` now says to use the default region.

### What didn't change
Track 3; Next.js + Postgres + Cloudinary + Claude in one repo; webhook-driven ingest; graceful degradation; rights confirmation + unlisted by default; "Cloudinary does media, we do knowledge."

---

## Revisit 1 — pre-build (v1)

Six gaps found in the v1 plan and fixed at the time: AI Skills Pack alignment (content-aware thumbnails), the "why not YouTube" framing (adaptive delivery is a Cloudinary-depth proof, not the differentiator), GitHub OAuth vs. the tutor persona, a consent gap (rights confirmation + unlisted default — kept in v2), short-form content narrowing the tutor persona (kept: long-form focus), and track classification. Revisit 2 supersedes its track reasoning and chaptering approach.
