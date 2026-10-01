// Cloudinary delivery URLs. Pure functions — usable on server and client (cloud name is public).
// Every composition here was verified against real output in Phase 01 (docs/phases/PHASE-01-cloudinary-spike.md).

import type { TimedWord } from "@/lib/segments";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const base = (cloud: string) => `https://res.cloudinary.com/${cloud}/video/upload`;
const sec = (t: number) => Math.max(0, Math.round(t * 10) / 10);

export const MOMENT_PAD_S = 1.5;
export const MOMENT_MAX_S = 60;
const CAPTION_MAX_WORDS = 4;
const CAPTION_MAX_S = 1.8;
const CAPTION_STYLE = "co_white,b_rgb:000000b3,w_660,c_fit";
const VERTICAL_CROP = "c_fill,ar_9:16,w_720,g_auto"; // g_auto must sit in its own component, not with so_/eo_

// A content-aware 16:9 frame at a moment: g_auto keeps the speaker/slide in frame instead of a blind centre crop.
export function thumbUrl(publicId: string, atS: number, cloud = CLOUD): string {
  return `${base(cloud)}/so_${sec(atS)},c_fill,ar_16:9,w_640,g_auto/f_auto,q_auto/${publicId}.jpg`;
}

// The clip window for a moment: padded so it doesn't start mid-word, clamped to the video, capped at 60 s
// (cost/abuse bound — a learner can't request a full-length derivative).
export function momentWindow(startS: number, endS: number, durationS?: number | null) {
  const start = Math.max(0, startS - MOMENT_PAD_S);
  let end = endS + MOMENT_PAD_S;
  if (durationS) end = Math.min(end, durationS);
  if (end - start > MOMENT_MAX_S) end = start + MOMENT_MAX_S;
  if (end <= start) end = start + 1;
  return { start: sec(start), end: sec(end) };
}

export type Caption = { text: string; from: number; to: number };

// Groups words into short caption cards (≤4 words / ≤1.8 s), timed relative to the clip start.
// Cloudinary's l_subtitles overlay times against the *trimmed* clip, so a mid-video Moment drifts —
// one timed l_text layer per card is exact by construction.
export function captionChunks(words: TimedWord[], clipStart: number, clipEnd: number): Caption[] {
  const inClip = words.filter((w) => w.e > clipStart && w.s < clipEnd);
  const chunks: Caption[] = [];
  let group: TimedWord[] = [];
  const flush = () => {
    if (!group.length) return;
    const from = sec(Math.max(0, group[0]!.s - clipStart));
    const next = Math.min(clipEnd, group.at(-1)!.e + 0.25) - clipStart;
    chunks.push({ text: group.map((w) => w.w).join(" "), from, to: Math.max(sec(next), from + 0.3) });
    group = [];
  };
  for (const w of inClip) {
    if (group.length && (group.length >= CAPTION_MAX_WORDS || w.e - group[0]!.s > CAPTION_MAX_S)) flush();
    group.push(w);
  }
  flush();
  // Cards never overlap: each ends when the next begins.
  for (let i = 0; i < chunks.length - 1; i++) chunks[i]!.to = Math.min(chunks[i]!.to, chunks[i + 1]!.from);
  return chunks.filter((c) => c.to > c.from);
}

// Cloudinary text layers need commas and slashes double-escaped (and % so it survives one decode).
export function encodeLayerText(text: string): string {
  return encodeURIComponent(text).replace(/%2C/g, "%252C").replace(/%2F/g, "%252F").replace(/%25(?!2[CF])/g, "%2525");
}

// A Moment is a URL, not a render job: Cloudinary trims, AI-crops to vertical (tracking the speaker),
// burns in timed captions and picks the best format/quality — generated on first request, then CDN-cached.
// The first request for an asset's g_auto crop returns 423 while Cloudinary analyses the video (see MomentButton).
export function momentUrl(
  publicId: string,
  startS: number,
  endS: number,
  { durationS, words = [], cloud = CLOUD }: { durationS?: number | null; words?: TimedWord[]; cloud?: string } = {},
): string {
  const { start, end } = momentWindow(startS, endS, durationS);
  const captions = captionChunks(words, start, end).map(
    (c) => `l_text:arial_46_bold:${encodeLayerText(c.text)},${CAPTION_STYLE}/fl_layer_apply,g_south,y_220,so_${c.from},eo_${c.to}`,
  );
  return [base(cloud), `so_${start},eo_${end}`, VERTICAL_CROP, ...captions, `f_auto:video,q_auto`, `${publicId}.mp4`].join("/");
}

// A tiny g_auto derivative whose only job is to start Cloudinary's tracking analysis at ingest time,
// so a learner's first Moment doesn't wait on it.
export function trackingWarmupUrl(publicId: string, cloud = CLOUD): string {
  return [base(cloud), "so_0,eo_1", VERTICAL_CROP.replace("w_720", "w_90"), "q_auto", `${publicId}.mp4`].join("/");
}

// The same window in the original 16:9 framing — for inline playback of a citation.
export function clipUrl(publicId: string, startS: number, endS: number, cloud = CLOUD): string {
  const { start, end } = momentWindow(startS, endS);
  return `${base(cloud)}/so_${start},eo_${end}/f_auto:video,q_auto/${publicId}.mp4`;
}
