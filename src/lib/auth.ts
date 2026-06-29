import crypto from "crypto";

const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export function getSessionToken() {
  return crypto.createHmac("sha256", PASSWORD).update("portal-admin-session").digest("hex");
}

export function verifyPassword(password: string): boolean {
  return password === PASSWORD;
}
