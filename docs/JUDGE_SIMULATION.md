# Judge Simulation — Pravaha (v2 plan)

Scored against the v2 plan before code exists. Rows that can only be judged on a running product are `N/A`, not guessed. v1 scores in brackets for comparison.

| Dimension | Score /10 | Why |
|---|---|---|
| Idea | 8 [7] | "Ask your recordings, watch the answer" is immediately graspable and demos itself; v1 was "useful," v2 is "I want that" |
| Problem | 8 [7] | Same real pain, now framed at library scale where it actually hurts (exam-night revision, institute archives) |
| Product / startup-ness | 8 [7] | Clear wedge → paying customer → expansion, a growth loop (shared Moments), and a roadmap (`VISION.md`) — Track 3 asks for a pitchable startup |
| Innovation | 8 [6] | Grounded Q&A where citations are playable clips with server-side citation validation, plus Moments as pure URL transformations — v1's innovation was a reimplementation of a Cloudinary feature |
| Cloudinary usage | 9 [9] | Upload widget, signed uploads, transcription, chaptering, Video Player/HLS, `g_auto` on video, subtitle overlays, trims, `f_auto/q_auto`, webhooks — all load-bearing, and now using Cloudinary's native features instead of rebuilding them |
| AI usage | 8 [6] | Cloudinary's media AI + one well-bounded LLM call with a trust mechanism (refusal, citation validation, eval set) — ambitious and disciplined |
| Technical execution | **N/A** | No code yet |
| UX | 7 [7] | Designed states for every failure; promising on paper, unproven until used |
| Demo | 9 [8] | Ask → clip of the teacher → vertical short on a real phone is a 20-second wow that needs no explanation |
| Differentiation | 8 [8] | Cloudinary's own demo stops at one chaptered video; NotebookLM-style tools answer in text, not source footage |
| Scalability | 6 [6] | Appropriately modest (serverless + CDN + FTS); embeddings are a stated roadmap step |
| Real-world value | 8 [7] | Our campus can use it the following week; institutes are a credible paying market |
| Code quality | **N/A** | No code yet |
| Documentation | 9 [9] | Complete, cross-referenced, honest about limits |

**Average across 12 scoreable dimensions: 8.0 / 10** (v1: 7.25).

## Would We Shortlist It?

Yes — if it works live. The plan's strengths (Cloudinary depth, a self-explaining demo, a startup story) now line up with what a Cloudinary judging team is likely to value. The whole risk sits in the two `N/A` rows and in three days of execution: a polished Ask that fails on the judge's own question is worse than no Ask. That's why Phase 09 runs the eval set and the cold test, and why the cut list protects Find + Ask + Moments over everything else.
