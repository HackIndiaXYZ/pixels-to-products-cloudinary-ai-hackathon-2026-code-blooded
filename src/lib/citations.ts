// Turns Claude's raw answer into something safe to show: every citation must point at a segment we
// actually retrieved and handed to the model. Anything else is deleted before the learner sees it,
// and an answer left with no valid citation is not shown at all.

export type RawAnswer = { answer: string; cited_segment_ids: number[] };

export type Validated<T> =
  | { status: "answered"; answer: string; citations: (T & { n: number })[]; dropped: number }
  | { status: "not_found"; answer: null; citations: []; dropped: number };

// Matches [S812], [S812, S813], [S812][S813] — the model is told to use the first form.
const MARKER = /\[(S\d+(?:\s*[,;]\s*S\d+)*)\]/g;

export function validateAnswer<T extends { segmentId: number }>(raw: RawAnswer, retrieved: T[]): Validated<T> {
  const byId = new Map(retrieved.map((s) => [s.segmentId, s]));
  const order: number[] = [];
  const invalid = new Set<number>(); // distinct hallucinated ids, for the logs

  const note = (id: number) => {
    if (!byId.has(id)) {
      invalid.add(id);
      return null;
    }
    if (!order.includes(id)) order.push(id);
    return order.indexOf(id) + 1;
  };

  // Rewrite markers in reading order: valid ids become [1], [2]…; hallucinated ids disappear.
  const text = raw.answer
    .replace(MARKER, (_, group: string) => {
      const numbers = group
        .split(/[,;]/)
        .map((s) => note(Number(s.trim().slice(1))))
        .filter((n): n is number => n !== null);
      return [...new Set(numbers)].map((n) => `[${n}]`).join("");
    })
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  // Ids listed in cited_segment_ids but never marked in the text still count as sources (appended).
  for (const id of raw.cited_segment_ids) {
    if (!byId.has(id)) invalid.add(id);
    else if (!order.includes(id)) order.push(id);
  }
  const dropped = invalid.size;

  if (order.length === 0 || !text) return { status: "not_found", answer: null, citations: [], dropped };
  return {
    status: "answered",
    answer: text,
    citations: order.map((id, i) => ({ ...byId.get(id)!, n: i + 1 })),
    dropped,
  };
}
