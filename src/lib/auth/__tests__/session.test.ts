
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpirationDate,
} from "@/lib/auth/session";

describe("Session utilities", () => {
  describe("generateSessionToken", () => {
    it("should generate a token with 32 random bytes encoded in Base64URL", () => {
      const token = generateSessionToken();

      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);

      const decoded = Buffer.from(token, "base64url");

      expect(decoded).toHaveLength(32);
    });

    it("should generate different tokens", () => {
      const firstToken = generateSessionToken();
      const secondToken = generateSessionToken();

      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe("hashSessionToken", () => {
    it("should return the SHA-256 hash in hexadecimal format", () => {
      const token = "test-session-token";

      const expectedHash = createHash("sha256")
        .update(token)
        .digest("hex");

      const result = hashSessionToken(token);

      expect(result).toBe(expectedHash);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should return the same hash for the same token", () => {
      const token = "test-session-token";

      expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    });

    it("should return different hashes for different tokens", () => {
      expect(hashSessionToken("token-one")).not.toBe(
        hashSessionToken("token-two")
      );
    });
  });

  describe("getSessionExpirationDate", () => {
    it("should return an expiration date seven days in the future", () => {
      const before = new Date();
      const expiration = getSessionExpirationDate();
      const after = new Date();

      const expectedMinimum = new Date(before);
      expectedMinimum.setDate(expectedMinimum.getDate() + 7);

      const expectedMaximum = new Date(after);
      expectedMaximum.setDate(expectedMaximum.getDate() + 7);

      expect(expiration.getTime()).toBeGreaterThanOrEqual(
        expectedMinimum.getTime()
      );

      expect(expiration.getTime()).toBeLessThanOrEqual(
        expectedMaximum.getTime()
      );
    });
  });
});
