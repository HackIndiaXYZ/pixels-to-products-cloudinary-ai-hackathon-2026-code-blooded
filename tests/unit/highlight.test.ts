import { describe, expect, it } from "vitest";

import { HIT_END as E, HIT_START as S, splitHighlights } from "@/lib/highlight";

describe("splitHighlights", () => {
  it("splits marked hits from plain text", () => {
    expect(splitHighlights(`we use ${S}gradient${E} ${S}descent${E} here`)).toEqual([
      { text: "we use ", hit: false },
      { text: "gradient", hit: true },
      { text: " ", hit: false },
      { text: "descent", hit: true },
      { text: " here", hit: false },
    ]);
  });

  it("keeps HTML in transcripts as inert text", () => {
    const parts = splitHighlights(`<script>alert(1)</script> ${S}xss${E}`);
    expect(parts[0]).toEqual({ text: "<script>alert(1)</script> ", hit: false });
    expect(parts[1]).toEqual({ text: "xss", hit: true });
  });

  it("handles snippets with no hits or only hits", () => {
    expect(splitHighlights("plain")).toEqual([{ text: "plain", hit: false }]);
    expect(splitHighlights(`${S}all${E}`)).toEqual([{ text: "all", hit: true }]);
    expect(splitHighlights("")).toEqual([]);
  });
});
