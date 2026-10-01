import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { apiError } from "@/lib/http";
import { ingestTranscript, markTranscriptFailed, setDuration } from "@/lib/ingest";
import { getLectureByPublicId } from "@/lib/lectures";
import { log } from "@/lib/log";
import { verifyCloudinaryWebhook } from "@/lib/webhook-signature";

const Payload = z.looseObject({
  public_id: z.string().optional(),
  notification_type: z.string().optional(),
  info_kind: z.string().optional(),
  info_status: z.string().optional(),
  duration: z.number().optional(),
});

const ok = () => NextResponse.json({ received: true });

export async function POST(request: Request) {
  // Verify against the raw body before parsing anything (SECURITY.md).
  const raw = await request.text();
  const check = verifyCloudinaryWebhook(
    raw,
    request.headers.get("x-cld-timestamp"),
    request.headers.get("x-cld-signature"),
    env().CLOUDINARY_API_SECRET,
  );
  if (!check.ok) {
    log("webhook.rejected", { reason: check.reason });
    return apiError(401, "bad_signature", "Invalid webhook signature.");
  }

  let body: z.infer<typeof Payload>;
  try {
    body = Payload.parse(JSON.parse(raw));
  } catch {
    log("webhook.rejected", { reason: "parse" });
    return apiError(400, "bad_payload", "Unreadable notification.");
  }

  const lecture = body.public_id ? await getLectureByPublicId(body.public_id) : null;
  if (!lecture) {
    // Not ours (or a deleted session): acknowledge so Cloudinary doesn't retry forever.
    log("webhook.unknown_asset", { kind: body.info_kind ?? body.notification_type });
    return ok();
  }
  log("webhook.received", {
    lectureId: lecture.id,
    infoKind: body.info_kind,
    infoStatus: body.info_status,
    type: body.notification_type,
  });

  try {
    if (body.notification_type === "upload" && body.duration) {
      await setDuration(lecture, body.duration);
    }
    const isTranscription = body.info_kind === "auto_transcription";
    // Chaptering may finish after transcription; re-ingesting attaches chapter titles to segments.
    const isChaptering = body.info_kind === "auto_chaptering";
    if ((isTranscription || (isChaptering && lecture.status === "ready")) && body.info_status === "complete") {
      await ingestTranscript(lecture);
    } else if (isTranscription && body.info_status === "failed") {
      await markTranscriptFailed(lecture);
    }
  } catch (error) {
    // 500 → Cloudinary retries; ingest is idempotent.
    log("ingest.error", { lectureId: lecture.id, error: error instanceof Error ? error.message : String(error) });
    return apiError(500, "ingest_failed", "Will retry.");
  }
  return ok();
}
