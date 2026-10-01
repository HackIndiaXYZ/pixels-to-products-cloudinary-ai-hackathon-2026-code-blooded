# Red Team — v2 Plan

Top reasons Pravaha could still lose, each with a concrete fix and the phase that owns it.

| # | Reason | Impact | Fix | Owner |
|---|---|---|---|---|
| 1 | Three days is tight for 10 phases | Unfinished core loop | Strict phase order, 45-minute rule, cut list, deployed every evening | `IMPLEMENTATION_PLAN.md` |
| 2 | Transcription quality on our speakers' accents | Find and Ask both degrade | Phase 01 tests a real recording at hour 2; re-record with a lapel mic / set `original_language` if needed | Phase 01 |
| 3 | Ask answers a judge's off-script question badly | Kills trust in the core feature | Citation validation + refusal; library with overlapping topics; eval set incl. unanswerable questions; example-question chips steer first use | Phases 08, 09 |
| 4 | Moment URL syntax (trim + crop + subtitles) misbehaves | Second wow moment fails | Verified by hand in Phase 01 before code; cut list drops subtitles first, keeping crop + trim | Phases 01, 07 |
| 5 | Thin demo library | Ask looks unimpressive | 5–8 real sessions on overlapping topics, recorded Day 2 in parallel | Day 2 content task |
| 6 | Cloudinary credit burn | Uploads/Moments stop working mid-build | Short sessions, daily console check, pre-warm only the Moments used in the demo | All |
| 7 | Live demo stalls (cold derivative, slow or overloaded model) | Bad impression in judging | Pre-warmed Moments, clip cards render before the answer, backup screen recording | Phase 10 |
| 8 | "Isn't this just NotebookLM?" | Weakens differentiation | The answer is footage, not text; Moments; built on the institution's own video library; private-by-default — said explicitly in README and demo | Phase 10 |
| 9 | Admin gaps (problem statement blank, survey missed) | Disqualification or lost prize | Day 1 admin block; Day 4 checklist | `SUBMISSION_CHECKLIST.md` |
| 10 | No published judging rubric | Mis-weighted priorities | Balance across Cloudinary depth, working demo, startup story, docs — none sacrificed | All |
