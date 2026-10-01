# Phase 13 — Demo Prep

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Everything `docs/SUBMISSION_CHECKLIST.md` requires, actually done: the demo video recorded, the README upgraded to its full version, the survey completed, the form submitted.

## Context
This is the last phase. Nothing about the product changes here; everything about its presentation does.

## Prerequisites
Phase 12 complete — there has to be a live, working production deployment to record a demo of and link to.

## Tasks
1. Record the demo video following `docs/DEMO.md`'s script exactly, against the real production deployment — not a local dev environment, so what's shown is what a judge can actually reach
2. Upgrade `README.md` from its Phase 00 lightweight version to the full version: real screenshots, the real demo video link, a setup walkthrough followed fresh by someone who didn't write the code
3. Fill in the team's problem statement on the HackIndia registration page — flagged as blank since `docs/SUBMISSION_CHECKLIST.md` was first written, and still the single oldest open item in this whole project
4. Complete Cloudinary's feedback survey (`cld.media/hackathon-survey`) — mandatory for prize eligibility, independent of where the team places
5. Walk `docs/SUBMISSION_CHECKLIST.md` top to bottom, one more time, checking each item against reality rather than intent
6. Submit: live demo link, GitHub repo, README, demo video, team details, completed survey

## Files to Create
None beyond the upgraded README.

## Files to Modify
`README.md` (full version).

## Implementation Requirements
N/A.

## Cloudinary Requirements
The demo video should make the Cloudinary workflow visible on screen — not a new requirement, just the point where `docs/DEMO.md`'s reasoning has to be true of an actual recording, not a script.

## AI Requirements
N/A beyond what's already shipped.

## Security Requirements
One final scan of the repository before it's treated as fully public and final — the same check from Phase 11, run once more, because this is the last chance to catch anything before submission.

## Testing Requirements
N/A — Phases 10 and 11 already covered verification; this phase is presentation.

## Git Requirements
`docs(readme): add full submission README with demo link and screenshots`

## Validation
Every checkbox in `docs/SUBMISSION_CHECKLIST.md` is genuinely, not hopefully, checked.

## Acceptance Criteria
Given the submission form, when filled out, then every field points at something real and already true — a live URL that works, a repo with no secrets, a video that matches what the live product actually does.

## Definition of Done
Submitted. Every requirement traced from `docs/PRD.md`'s Background section all the way to this checklist is satisfied by something real, not by a plan.
