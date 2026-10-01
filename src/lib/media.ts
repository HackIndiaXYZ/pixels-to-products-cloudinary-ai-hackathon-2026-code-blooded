// Cloudinary delivery URLs. Pure functions — usable on server and client (cloud name is public).

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const base = (cloud: string) => `https://res.cloudinary.com/${cloud}/video/upload`;
const sec = (t: number) => Math.max(0, Math.round(t * 10) / 10);

export const MOMENT_PAD_S = 1.5;
export const MOMENT_MAX_S = 60;

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

// A Moment is a URL, not a render job: Cloudinary trims, AI-crops to vertical (tracking the speaker),
// burns in subtitles from the transcript, and picks the best format/quality — on first request, then CDN-cached.
// ponytail: transformation order (trim+crop, then subtitles) must be confirmed on real output in Phase 01 —
// if subtitles drift, move l_subtitles before the trim.
export function momentUrl(
  publicId: string,
  startS: number,
  endS: number,
  { durationS, subtitles = true, cloud = CLOUD }: { durationS?: number | null; subtitles?: boolean; cloud?: string } = {},
): string {
  const { start, end } = momentWindow(startS, endS, durationS);
  const layers = [
    `so_${start},eo_${end},c_fill,ar_9:16,w_720,g_auto`,
    ...(subtitles ? [`l_subtitles:${publicId.replaceAll("/", ":")}.transcript`, "fl_layer_apply"] : []),
    "f_auto,q_auto",
  ];
  return `${base(cloud)}/${layers.join("/")}/${publicId}.mp4`;
}

// The same window in the original 16:9 framing — for inline playback of a citation.
export function clipUrl(publicId: string, startS: number, endS: number, cloud = CLOUD): string {
  const { start, end } = momentWindow(startS, endS);
  return `${base(cloud)}/so_${start},eo_${end}/f_auto,q_auto/${publicId}.mp4`;
}
