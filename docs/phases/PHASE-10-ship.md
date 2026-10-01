# Phase 10 — Ship

**Day 3 evening + Day 4 · ~4 h**

## Objective
Everything a judge sees outside the app: README, demo video, live URL, and a complete, correct submission.

## Prerequisites
Phase 09 (code freeze).

## Tasks
1. **README** (Day 3): rewrite for judges (`README.md` structure is already v2) — add live URL, 3–4 screenshots/GIFs (Ask answer with citations, Moment on a phone, Watch with chapters, Studio), eval results, "How to test in 2 minutes" with a demo passcode-free path (learner flows need no login).
2. **Demo video** (Day 3 evening): follow `DEMO.md` exactly; 2:30–3:00; several takes; screen + phone capture for the Moment; captions on; export 1080p; upload (YouTube unlisted / Drive with public link).
3. **Day 4 submission:**
   - Secrets scan: `git log -p | grep -iE "api_secret|sk-ant|postgres://|passcode"` → nothing.
   - Cold test: someone outside the team opens the live URL on mobile data and asks a question.
   - Cloudinary feedback survey `cld.media/hackathon-survey` — **mandatory for prize eligibility**.
   - Submission form `forms.gle/GtukHAhcua6fviicA`: team, track (PS-03), repo URL, live URL, video URL.
   - HackIndia team page: problem statement filled.
   - Tick every box in `SUBMISSION_CHECKLIST.md`.

## Acceptance Criteria
A judge with only the README link can understand the product in 30 seconds, watch the demo, and try Ask on the live URL in under 2 minutes.

## Definition of Done
Submitted before the deadline with every `SUBMISSION_CHECKLIST.md` item ticked.
