import { randomBytes } from "crypto";

export function generateInviteCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}
