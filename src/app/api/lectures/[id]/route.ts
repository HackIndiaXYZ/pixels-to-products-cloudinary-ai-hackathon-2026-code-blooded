import { NextResponse } from "next/server";
import { z } from "zod";

import { isOrganizer } from "@/lib/auth";
import { apiError, parseJson, unauthorized } from "@/lib/http";
import { getLecture, updateLecture } from "@/lib/lectures";
import { log } from "@/lib/log";

const Id = z.uuid();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lecture = Id.safeParse(id).success ? await getLecture(id) : null;
  if (!lecture) return apiError(404, "not_found", "This session isn't available.");
  return NextResponse.json(lecture);
}

const Patch = z
  .object({
    visibility: z.enum(["public", "unlisted"]).optional(),
    title: z.string().trim().min(1).max(140).optional(),
    speaker: z.string().trim().max(80).optional(),
  })
  .refine((p) => Object.keys(p).length > 0, "Nothing to update");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOrganizer())) return unauthorized();
  const { id } = await params;
  if (!Id.safeParse(id).success) return apiError(404, "not_found", "This session isn't available.");
  const parsed = await parseJson(request, Patch);
  if ("response" in parsed) return parsed.response;

  const current = await getLecture(id);
  if (!current) return apiError(404, "not_found", "This session isn't available.");
  if (parsed.data.visibility === "public" && current.status !== "ready") {
    return apiError(400, "not_ready", "Only ready sessions can be published.");
  }

  const lecture = await updateLecture(id, parsed.data);
  log("lecture.updated", { lectureId: id, visibility: lecture?.visibility });
  return NextResponse.json(lecture);
}
