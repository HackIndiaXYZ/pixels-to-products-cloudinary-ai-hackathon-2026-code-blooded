import { NextResponse } from "next/server";

import { isOrganizer } from "@/lib/auth";
import { unauthorized } from "@/lib/http";
import { getInsights } from "@/lib/insights";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isOrganizer())) return unauthorized();
  return NextResponse.json(await getInsights());
}
