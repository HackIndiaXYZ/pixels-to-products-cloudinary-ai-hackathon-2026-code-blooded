import { createHash, timingSafeEqual } from "node:crypto";

const MAX_AGE_S = 2 * 60 * 60;

// Cloudinary signs notifications as hex(hash(rawBody + timestamp + apiSecret)), SHA-1 by default
// or SHA-256 if the account is configured for it — the hex length tells us which.
// Mirrors the SDK's verifyNotificationSignature, but with a constant-time compare.
export function verifyCloudinaryWebhook(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  apiSecret: string,
  nowMs = Date.now(),
): { ok: true } | { ok: false; reason: "missing" | "stale" | "mismatch" } {
  if (!timestamp || !signature) return { ok: false, reason: "missing" };
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || nowMs / 1000 - ts > MAX_AGE_S) return { ok: false, reason: "stale" };

  const algorithm = signature.length === 64 ? "sha256" : "sha1";
  const expected = createHash(algorithm).update(rawBody + timestamp + apiSecret).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b) ? { ok: true } : { ok: false, reason: "mismatch" };
}
