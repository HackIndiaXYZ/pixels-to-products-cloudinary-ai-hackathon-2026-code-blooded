import { NextResponse } from "next/server";
import { z } from "zod";

import { isOrganizer } from "@/lib/auth";
import { cld } from "@/lib/cloudinary";
import { env } from "@/lib/env";
import { apiError, parseJson, unauthorized } from "@/lib/http";
import { getLectureByPublicId } from "@/lib/lectures";
import { log } from "@/lib/log";
import { checkParamsToSign } from "@/lib/upload-policy";

// Contract of next-cloudinary's CldUploadWidget `signatureEndpoint`: { paramsToSign } in, { signature } out.
const Body = z.object({ paramsToSign: z.record(z.string(), z.unknown()) });

export async function POST(request: Request) {
  if (!(await isOrganizer())) return unauthorized();
  const parsed = await parseJson(request, Body);
  if ("response" in parsed) return parsed.response;

  const { paramsToSign } = parsed.data;
  const check = checkParamsToSign(paramsToSign, { preset: env().CLOUDINARY_UPLOAD_PRESET });
  if (!check.ok) {
    log("upload.sign_rejected", { reason: check.reason });
    return apiError(400, "unsignable", check.reason);
  }

  const lecture = await getLectureByPublicId(check.publicId);
  if (!lecture || lecture.status !== "processing") {
    return apiError(400, "unknown_lecture", "Create the session before uploading.");
  }

  const signature = cld().utils.api_sign_request(paramsToSign, env().CLOUDINARY_API_SECRET);
  log("upload.signed", { lectureId: lecture.id });
  return NextResponse.json({ signature });
}
