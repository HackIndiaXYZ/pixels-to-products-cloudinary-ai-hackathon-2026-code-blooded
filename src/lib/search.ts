import "server-only";

import { query } from "@/lib/db";
import { HIT_END, HIT_START, splitHighlights, type SnippetPart } from "@/lib/highlight";

export type Hit = {
  segmentId: number;
  lectureId: string;
  publicId: string;
  title: string;
  speaker: string | null;
  startS: number;
  endS: number;
  text: string;
  chapterTitle: string | null;
  snippet: SnippetPart[];
};

type Row = {
  id: string;
  lecture_id: string;
  public_id: string;
  title: string;
  speaker: string | null;
  start_s: number;
  end_s: number;
  text: string;
  chapter_title: string | null;
  snippet: string;
};

const HEADLINE = `StartSel=${HIT_START}, StopSel=${HIT_END}, MaxWords=28, MinWords=12, ShortWord=2`;

// Scope: a single lecture (any visibility — you have its link) or the public library.
const SCOPE = `(($2::uuid IS NULL AND l.status = 'ready' AND l.visibility = 'public') OR l.id = $2::uuid)`;

function toHit(r: Row): Hit {
  return {
    segmentId: Number(r.id),
    lectureId: r.lecture_id,
    publicId: r.public_id,
    title: r.title,
    speaker: r.speaker,
    startS: r.start_s,
    endS: r.end_s,
    text: r.text,
    chapterTitle: r.chapter_title,
    snippet: splitHighlights(r.snippet),
  };
}

async function run(tsquery: string, q: string, lectureId: string | null, limit: number): Promise<Hit[]> {
  const rows = await query<Row>(
    `SELECT s.id, s.lecture_id, l.public_id, l.title, l.speaker, s.start_s, s.end_s, s.text, s.chapter_title,
            ts_headline('english', s.text, q, $4) AS snippet
       FROM segments s
       JOIN lectures l ON l.id = s.lecture_id,
            ${tsquery} AS q
      WHERE s.search_vector @@ q AND ${SCOPE}
      ORDER BY ts_rank_cd(s.search_vector, q) DESC, s.start_s
      LIMIT $3`,
    [q, lectureId, limit, HEADLINE],
  );
  return rows.map(toHit);
}

// Find: what the learner typed, as a web-style query ("quoted phrases", -exclusions, AND by default).
export function findSegments(q: string, { lectureId = null as string | null, limit = 20 } = {}) {
  return run(`websearch_to_tsquery('english', $1)`, q, lectureId, limit);
}

// Ask retrieval: questions rarely contain every term verbatim, so OR the stemmed, stop-word-free terms.
export function retrieveForQuestion(q: string, { lectureId = null as string | null, limit = 12 } = {}) {
  return run(`to_tsquery('english', replace(plainto_tsquery('english', $1)::text, '&', '|'))`, q, lectureId, limit);
}
