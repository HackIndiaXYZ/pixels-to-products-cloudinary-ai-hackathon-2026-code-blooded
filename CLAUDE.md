# Pravaha — context for Claude Code

Read this first, then `docs/` for depth. This file is the map, not the territory.

## What this is

**Pravaha: ask your recordings, watch the answer.** Turns a library of raw session recordings into knowledge you can search and question. Four pillars:
- **Watch:** Cloudinary transcription, chaptering and adaptive playback.
- **Find:** library-wide spoken-word search to the exact second.
- **Ask:** grounded answers whose citations are playable clips.
- **Moments:** vertical, AI-cropped, subtitled clips as Cloudinary URLs.

Built for Pixels to Products, the Cloudinary AI Hackathon 2026 (HackIndia × Cloudinary), PS-03 / Track 3, by team Code Blooded. Pitch and roadmap: `docs/VISION.md`.

## Status

Phase 00 done; repo connected to `origin` (HackIndia team repo). v2 re-scope done Oct 1 (`docs/STRATEGY_REVISIT.md`, Revisit 2). **Build window Oct 1–3, submission Oct 4.** Next: **Phase 01, the Cloudinary spike** (`docs/phases/PHASE-01-cloudinary-spike.md`), per `docs/IMPLEMENTATION_PLAN.md`.

## Decisions already made (don't relitigate without a real reason)

- **Stack:** one Next.js 16 app (App Router, TypeScript, pnpm, Tailwind) containing frontend and backend. Neon Postgres via raw `pg`. Cloudinary via `cloudinary` + `next-cloudinary` (Upload Widget, Video Player). Claude (`claude-sonnet-5-5`) for **Ask only**. Organizer passcode cookie, not NextAuth. Vercel.
- **Cloudinary does the media AI:** `auto_transcription`, `auto_chaptering`, Video Player (HLS), `g_auto`, `l_subtitles`, trims, `f_auto/q_auto`. Never rebuild what Cloudinary ships natively. That was v1's mistake (`docs/DECISIONS.md`).
- **What's genuinely ours:** transcript → segment indexing (`src/lib/segments.ts`), library-wide retrieval, grounded Ask with server-side citation validation and refusal (`src/lib/citations.ts`), the Moment URL composer (`src/lib/media.ts`), and the UX.
- **Anti-overengineering is a real constraint:** no separate Python service, no vector DB, no ORM, no Terraform, no `develop` branch. Needing one of these is a signal to re-read `docs/DECISIONS.md`, not a green light.
- **Why each choice, and why not the alternatives:** `docs/TRD.md`, `docs/DECISIONS.md`.

## Git rules (strict, see `docs/GIT_WORKFLOW.md`)

- One `feature/<name>` branch per feature. Commit there, open a PR into `main`, squash merge, delete the branch, then `git checkout main && git pull --ff-only`.
- **Never commit or push without the user's explicit go-ahead.**
- **No AI attribution anywhere:** no `Co-Authored-By: Claude` trailer, no "Generated with Claude Code" in commits or PRs.

## Working style

- Every phase has a spec in `docs/phases/` (v2: `PHASE-01-cloudinary-spike` … `PHASE-10-ship`). Treat it as the spec, and flag plainly when reality diverges; don't silently deviate.
- Items marked **[verify P01]** in `docs/CLOUDINARY.md` are unconfirmed until Phase 01 proves them on real output.
- `docs/CODE_STYLE.md` before the first line of code. Use the `claude-api` skill when writing the Claude call.
- "Learning mode": explain what/why/alternatives/trade-offs for real decisions; the team must be able to defend every choice to a judge.
- **Graceful degradation (NFR4):** transcription fails → video still plays; Claude fails → Ask falls back to clips; slow Moment → "generating" state. New failure modes get the same treatment.
- Never commit secrets. `.env.example` lists names only.
- `docs/TESTING.md`'s scenario table is the bar for "done."
- 45-minute rule: stuck that long, take the next item on the cut list (`docs/IMPLEMENTATION_PLAN.md`).

## Hackathon constraints

Public repo, README covering track/problem/Cloudinary usage/testing, a 2–4 min demo video, live demo, no credentials in the repo, and the mandatory Cloudinary feedback survey. Keep the HackIndia team tag line in `README.md`. Full list: `docs/SUBMISSION_CHECKLIST.md`.

## If something here turns out to be wrong

Say so and update the relevant doc in the same change. `docs/DECISIONS.md` exists so "why did we do it this way" never needs archaeology.
