import { describe, expect, it } from "vitest";

import { ORG_TTL_S, passcodeMatches, signOrgToken, verifyOrgToken } from "@/lib/auth";

const SECRET = "test-secret-at-least-16-chars";
const NOW = Date.UTC(2026, 9, 1);

describe("organizer token", () => {
  it("verifies a freshly signed token", () => {
    expect(verifyOrgToken(signOrgToken(SECRET, NOW), SECRET, NOW)).toBe(true);
  });

  it("rejects a token signed with another secret", () => {
    expect(verifyOrgToken(signOrgToken("another-secret-value-123", NOW), SECRET, NOW)).toBe(false);
  });

  it("rejects a tampered expiry", () => {
    const [expiry, sig] = signOrgToken(SECRET, NOW).split(".");
    expect(verifyOrgToken(`${Number(expiry) + 3600}.${sig}`, SECRET, NOW)).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = signOrgToken(SECRET, NOW);
    expect(verifyOrgToken(token, SECRET, NOW + (ORG_TTL_S + 1) * 1000)).toBe(false);
  });

  it("rejects missing and malformed tokens", () => {
    for (const bad of [undefined, "", "abc", "123.", ".sig", "notanumber.sig"]) {
      expect(verifyOrgToken(bad, SECRET, NOW)).toBe(false);
    }
  });
});

describe("passcodeMatches", () => {
  it("matches only the exact passcode", () => {
    expect(passcodeMatches("correct horse battery", "correct horse battery")).toBe(true);
    expect(passcodeMatches("correct horse batter", "correct horse battery")).toBe(false);
    expect(passcodeMatches("", "correct horse battery")).toBe(false);
  });
});
