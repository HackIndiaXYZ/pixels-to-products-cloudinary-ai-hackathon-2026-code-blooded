import { describe, expect, it } from "vitest";

import { parseChaptersVtt } from "@/lib/chapters";

describe("parseChaptersVtt", () => {
  it("parses cues with and without hours, CRLF and cue ids", () => {
    const vtt = [
      "WEBVTT",
      "",
      "1",
      "00:00:00.000 --> 00:01:30.500",
      "Introduction",
      "",
      "01:30.500 --> 1:02:03.000",
      "Gradient descent",
      "explained",
    ].join("\r\n");
    expect(parseChaptersVtt(vtt)).toEqual([
      { startS: 0, endS: 90.5, title: "Introduction" },
      { startS: 90.5, endS: 3723, title: "Gradient descent explained" },
    ]);
  });

  it("skips cues without a title or with non-positive length", () => {
    const vtt = "WEBVTT\n\n00:00.000 --> 00:10.000\n\n00:10.000 --> 00:05.000\nBackwards";
    expect(parseChaptersVtt(vtt)).toEqual([]);
  });

  it("returns nothing for junk", () => {
    expect(parseChaptersVtt("<html>404</html>")).toEqual([]);
  });
});
