import { NextResponse } from "next/server";
import { z } from "zod";

import { AiUnconfigured } from "@/lib/ai";
import { isOrganizer } from "@/lib/auth";
import { apiError, unauthorized } from "@/lib/http";
import { getLecture } from "@/lib/lectures";
import { log } from "@/lib/log";
import { generateStudyPack } from "@/lib/study-packs";

export const maxDuration = 60;

// Organizer: (re)generate a session's Study Pack now, e.g. for sessions ingested before Study Packs existed.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOrganizer())) return unauthorized();
  const { id } = await params;
  const lecture = z.uuid().safeParse(id).success ? await getLecture(id) : null;
  if (!lecture) return apiError(404, "not_found", "This session isn't available.");
  if (lecture.status !== "ready") return apiError(400, "not_ready", "The session must be transcribed first.");

  try {
    const pack = await generateStudyPack(lecture);
    if (!pack) return apiError(400, "too_short", "This session is too short for a Study Pack.");
    return NextResponse.json(pack);
  } catch (error) {
    if (error instanceof AiUnconfigured) return apiError(503, "ai_unconfigured", "Set GEMINI_API_KEY to generate Study Packs.");
    log("study_pack.failed", { lectureId: id, error: error instanceof Error ? error.message.slice(0, 160) : String(error) });
    return apiError(502, "ai_failed", "The AI couldn't build a Study Pack right now — try again shortly.");
  }
}
