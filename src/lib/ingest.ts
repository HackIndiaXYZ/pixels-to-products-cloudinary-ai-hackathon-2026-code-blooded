import "server-only";

import { parseChaptersVtt, type Chapter } from "@/lib/chapters";
import { query, transaction } from "@/lib/db";
import { env } from "@/lib/env";
import type { Lecture } from "@/lib/lectures";
import { log } from "@/lib/log";
import { buildSegments, TranscriptFile } from "@/lib/segments";

// Built from our own cloud name + the public_id in our DB — never from a URL in the webhook payload (no SSRF).
const rawUrl = (file: string) =>
  `https://res.cloudinary.com/${env().NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${file}`;

async function fetchChapters(publicId: string): Promise<Chapter[]> {
  // ponytail: chapters file name per Cloudinary's player convention — confirm in Phase 01; titles are optional polish.
  const res = await fetch(rawUrl(`${publicId}-chapters.vtt`), { cache: "no-store" });
  return res.ok ? parseChaptersVtt(await res.text()) : [];
}

export async function ingestTranscript(lecture: Lecture): Promise<number> {
  const started = Date.now();
  const res = await fetch(rawUrl(`${lecture.publicId}.transcript`), { cache: "no-store" });
  if (!res.ok) throw new Error(`transcript fetch failed: ${res.status}`);

  const lines = TranscriptFile.parse(await res.json());
  const segments = buildSegments(lines, await fetchChapters(lecture.publicId));
  const durationS = segments.at(-1)?.endS ?? null;

  // Delete-then-insert in one transaction: a retried webhook produces the same rows, never duplicates.
  await transaction(async (client) => {
    await client.query("DELETE FROM segments WHERE lecture_id = $1", [lecture.id]);
    if (segments.length) {
      await client.query(
        `INSERT INTO segments (lecture_id, start_s, end_s, text, chapter_title)
         SELECT $1, * FROM unnest($2::real[], $3::real[], $4::text[], $5::text[])`,
        [
          lecture.id,
          segments.map((s) => s.startS),
          segments.map((s) => s.endS),
          segments.map((s) => s.text),
          segments.map((s) => s.chapterTitle),
        ],
      );
    }
    await client.query(
      `UPDATE lectures SET status = 'ready', duration_s = coalesce(duration_s, $2), updated_at = now() WHERE id = $1`,
      [lecture.id, durationS],
    );
  });

  log("ingest.done", { lectureId: lecture.id, segments: segments.length, ms: Date.now() - started });
  return segments.length;
}

export async function markTranscriptFailed(lecture: Lecture): Promise<void> {
  await query(`UPDATE lectures SET status = 'transcript_failed', updated_at = now() WHERE id = $1`, [lecture.id]);
  log("ingest.failed", { lectureId: lecture.id, reason: "transcription_failed" });
}

export async function setDuration(lecture: Lecture, durationS: number): Promise<void> {
  await query(`UPDATE lectures SET duration_s = $2, updated_at = now() WHERE id = $1`, [lecture.id, durationS]);
}
