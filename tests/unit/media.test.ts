import { describe, expect, it } from "vitest";

import { clipUrl, MOMENT_MAX_S, momentUrl, momentWindow, thumbUrl } from "@/lib/media";

const ID = "pravaha/3f2b8c1e-0d4a-4c55-9b7e-1a2b3c4d5e6f";
const CLOUD = "demo";

describe("momentWindow", () => {
  it("pads both sides by 1.5 s", () => {
    expect(momentWindow(754.2, 764.9)).toEqual({ start: 752.7, end: 766.4 });
  });

  it("never starts before 0 or ends after the video", () => {
    expect(momentWindow(0.5, 4, 5)).toEqual({ start: 0, end: 5 });
  });

  it("caps clips at 60 s", () => {
    const { start, end } = momentWindow(100, 400);
    expect(end - start).toBe(MOMENT_MAX_S);
  });

  it("always yields a positive window", () => {
    const { start, end } = momentWindow(10, 10, 9);
    expect(end).toBeGreaterThan(start);
  });
});

describe("Cloudinary URLs", () => {
  it("builds the vertical, AI-cropped, subtitled Moment", () => {
    expect(momentUrl(ID, 754.2, 764.9, { cloud: CLOUD })).toBe(
      `https://res.cloudinary.com/demo/video/upload/so_752.7,eo_766.4,c_fill,ar_9:16,w_720,g_auto/` +
        `l_subtitles:pravaha:3f2b8c1e-0d4a-4c55-9b7e-1a2b3c4d5e6f.transcript/fl_layer_apply/f_auto,q_auto/${ID}.mp4`,
    );
  });

  it("can drop subtitles (cut-list fallback)", () => {
    expect(momentUrl(ID, 10, 20, { cloud: CLOUD, subtitles: false })).not.toContain("l_subtitles");
  });

  it("builds a 16:9 clip and a g_auto thumbnail", () => {
    expect(clipUrl(ID, 10, 20, CLOUD)).toBe(`https://res.cloudinary.com/demo/video/upload/so_8.5,eo_21.5/f_auto,q_auto/${ID}.mp4`);
    expect(thumbUrl(ID, 12.345, CLOUD)).toBe(
      `https://res.cloudinary.com/demo/video/upload/so_12.3,c_fill,ar_16:9,w_640,g_auto/f_auto,q_auto/${ID}.jpg`,
    );
  });
});
