# Phase 13 — Study Packs & "Session in 60 Seconds"

## Objective
Every session gets a **Study Pack**, generated automatically once transcription completes:
- a 3-bullet summary
- key concepts, each linked to the moment it's explained
- a 5-question quiz whose every answer explanation **plays the clip** where the teacher explains it
- **Session in 60 seconds**: an AI-picked highlight reel (reuses `reelUrl()`)

## Why
It turns a passive recording into active revision, and it's the strongest coaching-institute selling point (`VISION.md`). Every AI output is grounded in segment ids and validated like Ask, so the quiz can't invent what the lecture never said.

## Design
- **When:** after ingest, via Next's `after()` so the webhook still returns fast; generated lazily on first view if missing
- **Model call:** `generateJson(StudyPack)` with the session's segments as `<excerpt id="S…">`. Schema: `{ summary: string[3], concepts: [{ name, segment_id }], quiz: [{ question, options[4], correct_index, explanation, segment_id }], highlight_segment_ids: number[≤5] }`
- **Validation (pure, tested):** drop concepts/questions whose `segment_id` isn't in the session; fewer than 3 valid questions → no quiz; highlights deduplicated and kept in timeline order
- **Storage:** `study_packs (lecture_id PK, pack JSONB, model, created_at)` (migration 003)
- **UI:** Watch page tabs **Transcript · Study**: summary, concepts (click to seek), a quiz with instant feedback where every explanation has ▶ *Watch the explanation*, and a **Session in 60 seconds** reel

## Acceptance Criteria
For a ready session, the Study tab shows a summary, concepts and a quiz; every explanation plays the right moment; the highlight reel plays. With no AI key, the tab explains Study Packs are unavailable and the transcript still works.
