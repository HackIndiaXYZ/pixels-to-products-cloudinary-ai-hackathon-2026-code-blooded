import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, parseJson } from "@/lib/http";
import { recordMomentEvent } from "@/lib/insights";

const Body = z.object({ segmentId: z.number().int().positive(), kind: z.enum(["open", "share"]) });

// Anonymous Moment analytics for organizer Insights — no identity, no IP stored.
export async function POST(request: Request) {
  const parsed = await parseJson(request, Body);
  if ("response" in parsed) return parsed.response;
  const ok = await recordMomentEvent(parsed.data.segmentId, parsed.data.kind);
  return ok ? new NextResponse(null, { status: 204 }) : apiError(404, "not_found", "Unknown moment.");
}
