import { NextResponse } from "next/server";
import type { z } from "zod";

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const unauthorized = () => apiError(401, "unauthorized", "Organizer access required.");

// Parses a JSON body against a schema; returns the data or a ready-made 400 response.
export async function parseJson<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: apiError(400, "invalid_json", "Request body must be JSON.") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    return { response: apiError(400, "invalid_body", detail) };
  }
  return { data: parsed.data };
}
