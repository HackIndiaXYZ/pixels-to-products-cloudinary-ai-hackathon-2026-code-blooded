# Decision Record — Pravaha

The running answer to "why did you build it this way," logged as decisions were made. Superseded decisions stay in the table (struck through in the "Status" column) so the reasoning trail is never lost.

## v2 — Oct 1, 2026 re-scope

| Decision | Options considered | Chosen | Why | Trade-off accepted |
|---|---|---|---|---|
| Product thesis | v1 "auto-chaptered lecture player" vs. v2 "searchable, askable, shareable knowledge layer over recordings" | **v2: Watch · Find · Ask · Moments** | Cloudinary already ships single-video transcription + chaptering (and demos it publicly) — a judge would see v1 as their own demo. v2's value starts where Cloudinary's demo ends: across a library, answering questions, with the source moment as the answer | More moving parts than v1 — mitigated by deleting everything Cloudinary already does |
| Track | Track 1 (57 teams) · Track 2 (41) · Track 3 (27) | **Track 3** | Least crowded; its own examples ("creator platform where user videos are stored, transformed, delivered", "ed-tech tool") describe this product. Correction to v1 docs: Track 1 *does* list "image and video transformations" and a video pipeline example — Track 3 is still the better fit because the product is a startup, not a pipeline | If prizes are ranked overall rather than per track, the team-count advantage disappears |
| Chaptering | Custom transcript+tag boundary algorithm (v1) vs. Cloudinary `auto_chaptering` | **`auto_chaptering`** | Native, one parameter, rendered by the Video Player for free; rebuilding it is the first thing a Cloudinary judge would question | "The one custom algorithm" is gone — our original logic now lives in retrieval, grounded Ask and Moments, which are more visible anyway |
| Player | Plain `<video>` on an `sp_auto` URL vs. Cloudinary Video Player | **Cloudinary Video Player (`next-cloudinary`)** | `sp_auto` is HLS, which Chromium desktop hasn't reliably played natively; the player handles HLS, chapters and subtitles — less code, more Cloudinary | Less control over player chrome |
| Answering questions | None · open LLM chat · retrieval + grounded answer with clip citations | **Grounded Ask, citations validated server-side** | "Answers you can watch" is the differentiator; constraining citations to retrieved segment IDs and refusing when none survive makes it trustworthy and demo-safe | One Claude call per question — cost bounded by rate limits |
| Retrieval | Vector DB / pgvector embeddings vs. Postgres FTS | **Postgres FTS (`english` config, OR-ed terms, `ts_rank_cd`)** | No extra infra, explainable, good enough at tens of sessions | Misses pure paraphrase ("ML" vs "machine learning") — roadmap item |
| FTS language config | `simple` (v1) vs. `english` | **`english`** | Ask receives full natural-language questions; `english` removes stopwords and stems ("overfitting" ↔ "overfit"), which retrieval needs. Devanagari text is still tokenized, just not stemmed | Slightly odd stemming on romanized Hindi — acceptable, consistent on both index and query side |
| Shareable clips | FFmpeg render queue vs. Cloudinary URL transformation | **Moment = a Cloudinary URL** (trim + `g_auto` 9:16 crop + `l_subtitles` + `f_auto,q_auto`) | Zero infrastructure, generated on first request, cached on CDN; showcases AI cropping (a named AI Skills Pack capability) on video | First view of a new Moment takes seconds; exact URL composition verified in Phase 01 |
| Auth | NextAuth + GitHub OAuth (v1) vs. organizer passcode | **Passcode → HMAC-signed HttpOnly cookie** | One organizer per deployment in the MVP; OAuth cost ~3 h and four tables to protect one page | No per-organizer ownership — add NextAuth with institute workspaces (roadmap) |
| Rate limiting | Upstash Ratelimit (v1) vs. Postgres counter vs. none | **Postgres `ask_requests` counter** (per-IP-hash hourly + global daily cap) | Correct across serverless instances (shared DB), no new vendor; only Ask needs it (it's the endpoint that costs money) | One extra small table and one extra query per Ask |
| Claude scope | Title cleanup + query normalization (v1) vs. Ask only | **Ask only** | `auto_chaptering` produces titles; `plainto_tsquery` handles queries. Claude now does the one thing nothing else can — reason across transcripts | — |
| Model | Haiku 4.5 vs. Sonnet 5.5 | **`claude-sonnet-5-5`** | Answer quality and citation discipline are the demo; call volume is tiny | Higher per-call cost than Haiku — capped by rate limits |
| Ingest status | Webhook vs. polling Admin API | **Webhook** (unchanged) | Admin API is 500 req/hr on Free | Needs a public URL → deploy on Day 1 |
| `public_id` | Cloudinary-generated vs. server-chosen | **Server-chosen `pravaha/<lecture uuid>`, signed** | Lecture row exists before upload; webhook can never arrive for an unknown asset | — |
| Data access | ORM (Prisma/Drizzle) vs. raw `pg` | **Raw parameterized SQL via `pg`** | Three tables, ~8 queries | Hand-written row mapping |

## v1 decisions still standing

| Decision | Chosen | Why |
|---|---|---|
| Backend | Next.js route handlers only, no Python service | Cloudinary does the heavy AI; our logic is I/O-bound |
| Database | Postgres | Relational data + free full-text search |
| Deployment | Vercel + Neon, no Terraform | Two resources, both created once by hand (`INFRASTRUCTURE.md`) |
| Throttled-delivery demo | Framed as Cloudinary-competency proof, not the main differentiator | YouTube already streams adaptively; the differentiator is Find/Ask/Moments |
| Consent | Rights confirmation before upload; unlisted by default | Moderation checks safety, not permission — two different questions |

## Superseded (v1) — kept for the record

| Decision | v1 choice | Superseded by |
|---|---|---|
| Chapter navigation source | Custom boundary algorithm | `auto_chaptering` |
| Chapter thumbnails | Content-aware crop per chapter | `g_auto` library thumbnails + Moments (AI cropping now on video, which is more visible) |
| Custom AI layer | Claude for title cleanup + query normalization | Claude for grounded Ask only |
| Authentication | NextAuth + GitHub OAuth | Organizer passcode |
| `/api/search` rate limiting | Upstash Ratelimit | Postgres counter on `/api/ask` only |
| Video delivery | Plain `<video>` + `sp_auto` | Cloudinary Video Player (HLS) |
