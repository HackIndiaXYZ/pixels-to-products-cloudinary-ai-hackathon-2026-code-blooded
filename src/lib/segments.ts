import { z } from "zod";

import type { Chapter } from "@/lib/chapters";

// Shape of Cloudinary's {public_id}.transcript file: an array of lines with word-level timing.
const Word = z.object({ word: z.string(), start_time: z.number(), end_time: z.number() });
const Line = z.object({ transcript: z.string().optional(), words: z.array(Word).optional(), language: z.string().optional() });
export const TranscriptFile = z.union([z.array(Line), Line.transform((line) => [line])]);
export type TranscriptLine = z.infer<typeof Line>;

// Compact word timing kept per segment so Moments can carry exactly-timed captions.
export type TimedWord = { w: string; s: number; e: number };
export type Segment = { startS: number; endS: number; text: string; chapterTitle: string | null; words: TimedWord[] };

export const MIN_SEGMENT_S = 8;
export const MAX_SEGMENT_S = 15;
const SENTENCE_END = /[.?!।]["')\]]?$/;

// Groups word-timed transcript lines into ~10 s segments: cut at the first sentence end after
// MIN_SEGMENT_S, or hard-cut at MAX_SEGMENT_S. Long enough to carry meaning for retrieval,
// short enough that a citation lands on the right moment.
export function buildSegments(lines: TranscriptLine[], chapters: Chapter[] = []): Segment[] {
  const words = lines
    .flatMap((line) => line.words ?? [])
    .filter((w) => w.word.trim() && w.end_time >= w.start_time)
    .sort((a, b) => a.start_time - b.start_time);

  const segments: Segment[] = [];
  let current: z.infer<typeof Word>[] = [];

  const flush = () => {
    if (!current.length) return;
    const startS = current[0]!.start_time;
    const endS = Math.max(current.at(-1)!.end_time, startS + 0.1);
    const text = current.map((w) => w.word.trim()).join(" ");
    const timed = current.map((w) => ({ w: w.word.trim(), s: round(w.start_time), e: round(w.end_time) }));
    segments.push({ startS, endS, text, chapterTitle: chapterAt(chapters, startS), words: timed });
    current = [];
  };

  for (const word of words) {
    if (current.length && word.end_time - current[0]!.start_time > MAX_SEGMENT_S) flush();
    current.push(word);
    const duration = word.end_time - current[0]!.start_time;
    if (duration >= MIN_SEGMENT_S && SENTENCE_END.test(word.word.trim())) flush();
  }
  flush();
  return segments;
}

const round = (t: number) => Math.round(t * 100) / 100;

// The language Cloudinary detected for the transcript (most common across lines).
export function transcriptLanguage(lines: TranscriptLine[]): string | null {
  const counts = new Map<string, number>();
  for (const l of lines) if (l.language) counts.set(l.language, (counts.get(l.language) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function chapterAt(chapters: Chapter[], t: number): string | null {
  return chapters.find((c) => t >= c.startS && t < c.endS)?.title ?? null;
}
