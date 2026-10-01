import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const ORG_COOKIE = "pravaha_org";
export const ORG_TTL_S = 7 * 24 * 60 * 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// Hash both sides first so timingSafeEqual always compares equal-length buffers.
export function passcodeMatches(input: string, expected: string): boolean {
  return timingSafeEqual(sha256(input), sha256(expected));
}

const mac = (secret: string, expiry: number) =>
  createHmac("sha256", secret).update(`org:${expiry}`).digest("base64url");

export function signOrgToken(secret: string, nowMs = Date.now()): string {
  const expiry = Math.floor(nowMs / 1000) + ORG_TTL_S;
  return `${expiry}.${mac(secret, expiry)}`;
}

export function verifyOrgToken(token: string | undefined, secret: string, nowMs = Date.now()): boolean {
  if (!token) return false;
  const [expiryText, signature] = token.split(".");
  const expiry = Number(expiryText);
  if (!signature || !Number.isInteger(expiry) || expiry * 1000 <= nowMs) return false;
  const expected = Buffer.from(mac(secret, expiry));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isOrganizer(): Promise<boolean> {
  const store = await cookies();
  return verifyOrgToken(store.get(ORG_COOKIE)?.value, env().SESSION_SECRET);
}
