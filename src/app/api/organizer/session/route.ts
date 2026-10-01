import { NextResponse } from "next/server";
import { z } from "zod";

import { ORG_COOKIE, ORG_TTL_S, passcodeMatches, signOrgToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { apiError, parseJson } from "@/lib/http";
import { log } from "@/lib/log";

const Body = z.object({ passcode: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = await parseJson(request, Body);
  if ("response" in parsed) return parsed.response;

  const { ORGANIZER_PASSCODE, SESSION_SECRET } = env();
  if (!passcodeMatches(parsed.data.passcode, ORGANIZER_PASSCODE)) {
    log("organizer.signin_failed");
    return apiError(401, "wrong_passcode", "That passcode isn't right.");
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(ORG_COOKIE, signOrgToken(SESSION_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ORG_TTL_S,
  });
  log("organizer.signin");
  return response;
}

export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ORG_COOKIE);
  return response;
}
