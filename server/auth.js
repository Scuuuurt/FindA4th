import crypto from "crypto";

export function hashPassword(password) {
  return crypto.scryptSync(password, "finda4th-salt", 64).toString("hex");
}

export function verifyPassword(password, hash) {
  const passwordBuffer = Buffer.from(hashPassword(password), "hex");
  const storedBuffer = Buffer.from(hash, "hex");
  if (passwordBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(passwordBuffer, storedBuffer);
}

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}
