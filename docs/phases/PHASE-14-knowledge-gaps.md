# Phase 14 — Learner Insights & Knowledge Gaps

**Status: DONE (Oct 1)** · branch `feature/study-packs-insights`

## Objective
Give organizers the startup-grade feedback loop: **what learners ask, what the library can't answer yet, and which moments travel.**
- **Knowledge gaps:** questions that came back `not_found`, grouped, so the organizer knows **what to record next**
- **Most asked:** top questions and the sessions answering them
- **Most shared moments:** Moments opened or shared most

## Design
- `ask_log (id, question, status, lecture_ids uuid[], created_at)` stores question text only, never IP (the rate-limit table stays separate and hashed)
- `moment_events (segment_id, kind 'open' | 'share', created_at)` via a small `POST /api/events`
- Studio → **Insights** tab: three ranked lists over the last 30 days, plain SQL grouped by normalised question
- Privacy: no learner identity anywhere; questions are visible to organizers only

## Acceptance Criteria
Asking an uncovered question shows it under Knowledge gaps in the Studio; sharing a Moment raises it in Most shared.
