import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/http";
import { findSegments } from "@/lib/search";

const Query = z.object({
  q: z.string().trim().min(2).max(200),
  lectureId: z.uuid().optional(),
});

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = Query.safeParse(params);
  if (!parsed.success) return apiError(400, "invalid_query", "Search needs 2–200 characters.");

  const results = await findSegments(parsed.data.q, { lectureId: parsed.data.lectureId ?? null });
  return NextResponse.json({ results });
}
