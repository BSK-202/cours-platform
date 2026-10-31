
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72;

export async function hashPassword(
  password: string
): Promise<string> {
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    throw new Error("Le mot de passe dépasse la limite autorisée.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
