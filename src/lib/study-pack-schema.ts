import { z } from "zod";

// What the model is asked to return. Every concept, question and highlight must point at a real segment id.
export const RawStudyPack = z.object({
  summary: z.array(z.string()).describe("Exactly 3 short bullet points summarising the session."),
  concepts: z
    .array(z.object({ name: z.string(), segment_id: z.number().int() }))
    .describe("3–6 key concepts, each with the id of the excerpt where it is best explained."),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).describe("Exactly 4 options."),
        correct_index: z.number().int().describe("0-based index of the correct option."),
        explanation: z.string().describe("One sentence, grounded in the cited excerpt."),
        segment_id: z.number().int().describe("Excerpt id where the answer is explained."),
      }),
    )
    .describe("5 multiple-choice questions answerable only from this session."),
  highlight_segment_ids: z
    .array(z.number().int())
    .describe("Up to 5 excerpt ids that together give the best 60-second overview, in any order."),
});
export type RawStudyPack = z.infer<typeof RawStudyPack>;

export type PackSegment = { id: number; startS: number; endS: number; chapterTitle?: string | null };
export type Moment = { segmentId: number; startS: number; endS: number };

export type StudyPack = {
  summary: string[];
  concepts: (Moment & { name: string })[];
  quiz: (Moment & { question: string; options: string[]; correctIndex: number; explanation: string })[];
  highlights: (Moment & { label: string | null })[];
};

const MIN_QUIZ = 3;

// Grounding check, same idea as Ask's citations: anything pointing at a segment that isn't in this
// session is dropped; malformed questions are dropped; too few valid questions → no quiz at all.
export function validateStudyPack(raw: RawStudyPack, segments: PackSegment[]): StudyPack {
  const byId = new Map(segments.map((s) => [s.id, s]));
  const at = (id: number) => {
    const s = byId.get(id);
    return s ? { segmentId: s.id, startS: s.startS, endS: s.endS } : null;
  };

  const concepts = raw.concepts.flatMap((c) => {
    const m = at(c.segment_id);
    return m && c.name.trim() ? [{ ...m, name: c.name.trim() }] : [];
  });

  const quiz = raw.quiz.flatMap((q) => {
    const m = at(q.segment_id);
    const options = q.options.map((o) => o.trim()).filter(Boolean);
    const valid = m && q.question.trim() && options.length === 4 && q.correct_index >= 0 && q.correct_index < 4;
    return valid ? [{ ...m, question: q.question.trim(), options, correctIndex: q.correct_index, explanation: q.explanation.trim() }] : [];
  });

  const highlights = [...new Set(raw.highlight_segment_ids)]
    .flatMap((id) => {
      const m = at(id);
      return m ? [{ ...m, label: byId.get(id)?.chapterTitle ?? null }] : [];
    })
    .sort((a, b) => a.startS - b.startS)
    .slice(0, 5);

  return {
    summary: raw.summary.map((s) => s.trim()).filter(Boolean).slice(0, 3),
    concepts: concepts.slice(0, 6),
    quiz: quiz.length >= MIN_QUIZ ? quiz.slice(0, 5) : [],
    highlights,
  };
}
