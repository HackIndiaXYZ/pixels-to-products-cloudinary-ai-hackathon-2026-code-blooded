import { after, NextResponse } from "next/server";
import { z } from "zod";

import { validateAnswer } from "@/lib/citations";
import { AiUnconfigured } from "@/lib/ai";
import { askGrounded } from "@/lib/answer";
import { apiError, parseJson } from "@/lib/http";
import { logAsk } from "@/lib/insights";
import { log } from "@/lib/log";
import { momentUrl, reelUrl } from "@/lib/media";
import { clientIp, takeAskToken } from "@/lib/rate-limit";
import { retrieveForQuestion, type Hit } from "@/lib/search";

export const maxDuration = 30;

const Body = z.object({
  question: z.string().trim().min(3).max(300),
  lectureId: z.uuid().optional(),
});

const FALLBACK_CLIPS = 4;

const withMoment = (h: Hit & { n: number }) => ({
  ...h,
  momentUrl: momentUrl(h.publicId, h.startS, h.endS, { durationS: h.durationS, words: h.words }),
});

// Answer Reel: every cited moment, across sessions, stitched into one video in citation order.
const reelFor = (hits: Hit[]) =>
  reelUrl(hits.map((h) => ({ publicId: h.publicId, startS: h.startS, endS: h.endS, label: h.speaker ?? h.title })));

export async function POST(request: Request) {
  const started = Date.now();
  const parsed = await parseJson(request, Body);
  if ("response" in parsed) return parsed.response;
  const { question, lectureId } = parsed.data;

  // Rate-limit before any work that costs money (SECURITY.md).
  const token = await takeAskToken(clientIp(request));
  if (!token.ok) {
    log("ask.rate_limited", { scope: token.scope });
    const response = apiError(429, "rate_limited", "You've asked a lot — try again in a few minutes.");
    response.headers.set("Retry-After", String(token.retryAfterS));
    return response;
  }

  const hits = await retrieveForQuestion(question, { lectureId: lectureId ?? null });
  if (hits.length === 0) {
    // Nothing in the library matches — no reason to call the model.
    log("ask.done", { status: "not_found", retrieved: 0, cited: 0, dropped: 0, ms: Date.now() - started });
    after(() => logAsk(question, "not_found", []));
    return NextResponse.json({ status: "not_found", answer: null, citations: [] });
  }

  try {
    const result = validateAnswer(await askGrounded(question, hits), hits);
    log("ask.done", {
      status: result.status,
      retrieved: hits.length,
      cited: result.citations.length,
      dropped: result.dropped,
      ms: Date.now() - started,
    });
    after(() => logAsk(question, result.status, result.citations.map((c) => c.lectureId)));
    return NextResponse.json({
      status: result.status,
      answer: result.answer,
      citations: result.citations.map(withMoment),
      reel: reelFor(result.citations),
    });
  } catch (error) {
    // NFR4: the model failing never means an error page — show the most relevant moments instead.
    const kind = error instanceof AiUnconfigured ? "unconfigured" : error instanceof Error ? error.name : "unknown";
    log("ai.error", { kind, message: error instanceof Error ? error.message.slice(0, 200) : undefined, ms: Date.now() - started });
    const citations = hits.slice(0, FALLBACK_CLIPS).map((h, i) => withMoment({ ...h, n: i + 1 }));
    after(() => logAsk(question, "fallback", citations.map((c) => c.lectureId)));
    return NextResponse.json({ status: "fallback", answer: null, citations, reel: reelFor(citations) });
  }
}
