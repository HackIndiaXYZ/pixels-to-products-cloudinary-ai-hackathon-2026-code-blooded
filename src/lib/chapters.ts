export type Chapter = { startS: number; endS: number; title: string };

// "01:02:03.456" or "02:03.456" → seconds
function toSeconds(stamp: string): number {
  const parts = stamp.trim().split(":").map(Number);
  return parts.reduce((acc, part) => acc * 60 + part, 0);
}

const CUE = /^((?:\d+:)?\d{1,2}:\d{2}(?:\.\d+)?)\s+-->\s+((?:\d+:)?\d{1,2}:\d{2}(?:\.\d+)?)/;

// Parses a WebVTT chapters file: each cue's first text line is the chapter title.
export function parseChaptersVtt(vtt: string): Chapter[] {
  const chapters: Chapter[] = [];
  const blocks = vtt.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const cueIndex = lines.findIndex((l) => CUE.test(l));
    if (cueIndex === -1) continue;
    const [, start, end] = lines[cueIndex]!.match(CUE)!;
    const title = lines.slice(cueIndex + 1).join(" ").trim();
    const startS = toSeconds(start!);
    const endS = toSeconds(end!);
    if (title && endS > startS) chapters.push({ startS, endS, title });
  }
  return chapters.sort((a, b) => a.startS - b.startS);
}
