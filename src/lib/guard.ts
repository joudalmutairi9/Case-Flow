import "server-only";
import type { Role } from "@prisma/client";
import { getSession } from "./session";

/**
 * Server Actions are reachable directly, not only through the UI that calls
 * them, so every mutation must re-check the caller's role even though the
 * proxy already restricts page navigation by role.
 */
export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}
