import { describe, expect, it } from "vitest";

import { validateStudyPack, type RawStudyPack } from "@/lib/study-pack-schema";

const segments = [
  { id: 1, startS: 0, endS: 10, chapterTitle: "Introduction" },
  { id: 2, startS: 10, endS: 20, chapterTitle: "Regularization" },
  { id: 3, startS: 20, endS: 30, chapterTitle: "Dropout" },
];

const q = (segment_id: number, extra: Partial<RawStudyPack["quiz"][number]> = {}) => ({
  question: "What does dropout do?",
  options: ["A", "B", "C", "D"],
  correct_index: 1,
  explanation: "It switches neurons off.",
  segment_id,
  ...extra,
});

const raw: RawStudyPack = {
  summary: [" Overfitting basics ", "Regularization", "Dropout", "extra"],
  concepts: [
    { name: "Weight decay", segment_id: 2 },
    { name: "Invented concept", segment_id: 99 },
  ],
  quiz: [q(3), q(2), q(1), q(42), q(2, { options: ["A", "B"] }), q(1, { correct_index: 7 })],
  highlight_segment_ids: [3, 1, 3, 77],
};

describe("validateStudyPack", () => {
  const pack = validateStudyPack(raw, segments);

  it("keeps at most 3 trimmed summary bullets", () => {
    expect(pack.summary).toEqual(["Overfitting basics", "Regularization", "Dropout"]);
  });

  it("drops concepts that point outside the session and resolves timings", () => {
    expect(pack.concepts).toEqual([{ segmentId: 2, startS: 10, endS: 20, name: "Weight decay" }]);
  });

  it("drops ungrounded or malformed questions", () => {
    expect(pack.quiz.map((x) => x.segmentId)).toEqual([3, 2, 1]);
    expect(pack.quiz[0]).toMatchObject({ correctIndex: 1, startS: 20, options: ["A", "B", "C", "D"] });
  });

  it("dedupes highlights, drops unknown ids, orders by time and labels by chapter", () => {
    expect(pack.highlights.map((h) => [h.segmentId, h.label])).toEqual([
      [1, "Introduction"],
      [3, "Dropout"],
    ]);
  });

  it("omits the quiz entirely when fewer than 3 questions are valid", () => {
    const thin = validateStudyPack({ ...raw, quiz: [q(1), q(99)] }, segments);
    expect(thin.quiz).toEqual([]);
  });
});
