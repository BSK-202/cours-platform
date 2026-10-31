import { createHash, randomBytes } from "crypto";

const SESSION_DURATION_DAYS = 7;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpirationDate(): Date {
  const expiration = new Date();

  expiration.setDate(
    expiration.getDate() + SESSION_DURATION_DAYS
  );

  return expiration;
}