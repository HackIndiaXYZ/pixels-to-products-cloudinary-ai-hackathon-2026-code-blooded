# Cost — Pravaha

Every figure is tagged **ACTUAL** (by design / confirmed plan mechanics), **ESTIMATE**, or **ASSUMPTION**. Exact prices are checked in each console, not invented here.

| Service | Tier | Tag | Notes |
|---|---|---|---|
| Cloudinary | Free — 25 credits/month (1 credit ≈ 1,000 transformations or 1 GB storage or 1 GB bandwidth) | **ESTIMATE** | Heavy items: transcription per minute of video, video derivatives (Moments, HLS renditions). Library of ~8 × 10-min sessions + a few dozen Moments should fit; usage checked daily in the console (Phase 01 records the real burn of one upload) |
| Anthropic (Claude Opus 5.5, effort low) | Pay-as-you-go | **ASSUMPTION** | ~2–3k tokens per Ask (≈ $4 / $20 per MTok in/out); a few hundred Asks during build + judging. Hard-bounded by the app rate limits (20/h/IP, 500/day) **and** a monthly spend limit set in the Anthropic console |
| Neon Postgres | Free | **ESTIMATE** | Thousands of segment rows ≈ a few MB |
| Vercel | Hobby | **ESTIMATE** | Demo traffic is tiny; Ask's 15 s Claude timeout fits within Hobby function limits |
| Media storage elsewhere | None | **ACTUAL** | All media lives in Cloudinary |
| Auth provider | None | **ACTUAL** | Passcode cookie, no third party |

## Bottom Line

Free tiers cover everything except Claude, whose worst case is capped twice (rate limit + console spend limit). The number to watch during the build is Cloudinary credit burn from video transcription and Moment derivatives.

## At Scale (pitch answer)

Cost per institute scales with minutes uploaded (Cloudinary transcription + storage), minutes watched (delivery) and questions asked (Claude) — all usage-priced, all passed through in a per-seat or per-hour-of-content plan (`VISION.md`).
