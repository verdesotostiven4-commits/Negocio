import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bm_tv_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string | null {
  return process.env.AUTH_SECRET || null;
}

function sign(value: string): string {
  const key = secret();
  if (!key) throw new Error("AUTH_SECRET no está configurado.");
  return createHmac("sha256", key).update(value).digest("hex");
}

export function makeSessionToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token || !secret()) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  const expected = sign(issuedAt);
  if (signature.length !== expected.length) return false;
  const validSignature = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  const age = Date.now() - Number(issuedAt);
  return validSignature && Number.isFinite(age) && age >= 0 && age < MAX_AGE_SECONDS * 1000;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export function adminCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  };
}

export function clearAdminCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}
