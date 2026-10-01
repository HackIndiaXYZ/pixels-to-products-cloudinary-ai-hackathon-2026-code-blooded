# Phase 12 — Answer Reels

**Status: DONE (Oct 1)** · branch `feature/gemini-answer-reels`

## Objective
Turn every Ask answer into **one watchable video**: the cited moments, from any number of sessions, stitched in citation order, each clip labelled with its speaker. "Watch the answer", literally.

## Why it matters
This is the product's signature moment. Text-answer tools (NotebookLM-style) answer in text; Cloudinary's own demo chapters one video. Pravaha edits a 30–90 s answer video from several lecturers on demand, with no render queue. It's one Cloudinary URL.

## How (verified on real output)
```
so_<a>,eo_<b>,w_1280,h_720,c_fill/                                               clip 1 (the base asset)
l_video:<public_id, '/'→':'>,fl_splice/so_<c>,eo_<d>,w_1280,h_720,c_fill/fl_layer_apply/   clips 2…n appended
l_text:arial_34_bold:<speaker>,co_white,b_rgb:0f766ecc/fl_layer_apply,g_north_west,x_40,y_40,so_<t0>,eo_<t1>/   one label per clip, on the reel's timeline
f_auto:video,q_auto/<first public_id>.mp4
```
- Every clip is scaled to one frame (`w_1280,h_720,c_fill`), so sessions of different resolutions splice cleanly
- Caps: 5 clips and 90 s (cost and abuse bound)
- Verified: 2 sessions → 12.09 s, with the speaker label switching on the second clip (checked on an extracted frame); a real 5-clip answer → 71.4 s, HTTP 200

## Code
`reelUrl()` in `src/lib/media.ts` (pure, unit-tested); `/api/ask` returns `reel: { url, durationS, clips }` for answers and fallbacks; `AskAnswer` shows **Watch the answer** when there are 2+ clips.

## Next
Session highlight reels (Phase 13) reuse `reelUrl()` with AI-picked moments from one session.
