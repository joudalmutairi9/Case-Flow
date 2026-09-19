import "server-only";
import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";
import { SESSION_TTL_MINUTES } from "./portals";

const COOKIE_NAME = "cf_session";

export async function createSession(payload: SessionPayload) {
  const ttlMinutes = SESSION_TTL_MINUTES[payload.role];
  const token = await signSessionToken(payload, ttlMinutes);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlMinutes * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export type { SessionPayload };
export { COOKIE_NAME };
