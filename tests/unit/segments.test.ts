import { describe, expect, it } from "vitest";

import { buildSegments, MAX_SEGMENT_S, TranscriptFile } from "@/lib/segments";

// One word per second: "w0 w1 ... wN", with sentence ends where requested.
function line(count: number, sentenceEndsAt: number[] = [], offset = 0) {
  return {
    transcript: "",
    words: Array.from({ length: count }, (_, i) => ({
      word: `w${i + offset}${sentenceEndsAt.includes(i + offset) ? "." : ""}`,
      start_time: i + offset,
      end_time: i + offset + 0.9,
    })),
  };
}

describe("buildSegments", () => {
  it("cuts at the first sentence end after 8 seconds", () => {
    const segments = buildSegments([line(20, [3, 9, 15])]);
    // w3 is a sentence end but too early; w9 ends at 9.9 s → first cut.
    expect(segments[0]).toMatchObject({ startS: 0, text: expect.stringMatching(/^w0 .* w9\.$/) });
    expect(segments[0]!.endS).toBeCloseTo(9.9);
    expect(segments[1]!.startS).toBe(10);
  });

  it("hard-cuts runs without punctuation at the max length", () => {
    const segments = buildSegments([line(40)]);
    for (const s of segments) expect(s.endS - s.startS).toBeLessThanOrEqual(MAX_SEGMENT_S);
    expect(segments.map((s) => s.text).join(" ").split(" ")).toHaveLength(40);
  });

  it("flattens and orders words across lines", () => {
    const segments = buildSegments([line(5, [], 5), line(5, [], 0)]);
    expect(segments[0]!.text).toBe("w0 w1 w2 w3 w4 w5 w6 w7 w8 w9");
  });

  it("attaches the chapter that contains each segment start", () => {
    const chapters = [
      { startS: 0, endS: 12, title: "Intro" },
      { startS: 12, endS: 100, title: "Gradient descent" },
    ];
    // Segments start at 0, 10 and 22 s; 10 s is still inside "Intro".
    const segments = buildSegments([line(30, [9, 21])], chapters);
    expect(segments.map((s) => s.chapterTitle)).toEqual(["Intro", "Intro", "Gradient descent"]);
  });

  it("handles empty and word-less transcripts", () => {
    expect(buildSegments([])).toEqual([]);
    expect(buildSegments([{ transcript: "no timing" }])).toEqual([]);
  });

  it("accepts both array and single-object transcript files", () => {
    expect(TranscriptFile.parse([line(2)])).toHaveLength(1);
    expect(TranscriptFile.parse(line(2))).toHaveLength(1);
  });
});
