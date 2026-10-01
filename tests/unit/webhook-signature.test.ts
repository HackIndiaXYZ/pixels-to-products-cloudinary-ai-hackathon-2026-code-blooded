import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyCloudinaryWebhook } from "@/lib/webhook-signature";

const SECRET = "cloudinary-secret";
const NOW = Date.UTC(2026, 9, 1);
const TS = String(NOW / 1000 - 60);
const BODY = JSON.stringify({ public_id: "pravaha/x", info_kind: "auto_transcription", info_status: "complete" });
const sign = (alg: "sha1" | "sha256", body = BODY, ts = TS) =>
  createHash(alg).update(body + ts + SECRET).digest("hex");

describe("verifyCloudinaryWebhook", () => {
  it("accepts SHA-1 and SHA-256 signatures", () => {
    expect(verifyCloudinaryWebhook(BODY, TS, sign("sha1"), SECRET, NOW)).toEqual({ ok: true });
    expect(verifyCloudinaryWebhook(BODY, TS, sign("sha256"), SECRET, NOW)).toEqual({ ok: true });
  });

  it("rejects a tampered body", () => {
    const tampered = BODY.replace("complete", "failed");
    expect(verifyCloudinaryWebhook(tampered, TS, sign("sha1"), SECRET, NOW)).toEqual({ ok: false, reason: "mismatch" });
  });

  it("rejects a signature made with another secret", () => {
    const forged = createHash("sha1").update(BODY + TS + "guess").digest("hex");
    expect(verifyCloudinaryWebhook(BODY, TS, forged, SECRET, NOW).ok).toBe(false);
  });

  it("rejects missing headers and stale timestamps (replay)", () => {
    expect(verifyCloudinaryWebhook(BODY, null, sign("sha1"), SECRET, NOW)).toEqual({ ok: false, reason: "missing" });
    expect(verifyCloudinaryWebhook(BODY, TS, null, SECRET, NOW)).toEqual({ ok: false, reason: "missing" });
    const old = String(NOW / 1000 - 3 * 3600);
    expect(verifyCloudinaryWebhook(BODY, old, sign("sha1", BODY, old), SECRET, NOW)).toEqual({
      ok: false,
      reason: "stale",
    });
  });
});
