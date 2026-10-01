# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/); versioning: [SemVer](https://semver.org/). Each merged feature PR adds its own entry.

## [Unreleased]

### Planned (v2 — `docs/IMPLEMENTATION_PLAN.md`)
- Phase 01 — Cloudinary spike
- Phase 02 — App shell + deploy
- Phase 03 — Studio: organizer auth + upload
- Phase 04 — Watch page
- Phase 05 — Ingest: webhook → segments
- Phase 06 — Find
- Phase 07 — Library + Moments
- Phase 08 — Ask
- Phase 09 — Hardening
- Phase 10 — Ship

### Changed
- **v2 re-scope (Oct 1):** product reframed as "Ask your recordings. Watch the answer." — Watch · Find · Ask · Moments. Custom chapter algorithm replaced by Cloudinary `auto_chaptering`; Cloudinary Video Player replaces plain `<video>`; NextAuth/GitHub OAuth replaced by an organizer passcode; Upstash replaced by a Postgres rate-limit table; Claude scope moved from title cleanup/query normalization to grounded Ask. Rationale: `docs/STRATEGY_REVISIT.md` (Revisit 2), `docs/DECISIONS.md`.
- Local repository connected to the HackIndia team remote, history based on its initial commit.

### Added
- `docs/VISION.md`, `docs/GIT_WORKFLOW.md`, v2 phase specs (`docs/phases/PHASE-01-cloudinary-spike.md` … `PHASE-10-ship.md`).
- Repository scaffold, CI, conventions, full documentation set (Phase 00).
