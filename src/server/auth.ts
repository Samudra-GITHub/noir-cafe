import "server-only";
import { backends } from "./env";

/**
 * The signed-in guest's id (Clerk), or null for guests / when Clerk isn't
 * configured. Clerk's server module is only loaded when it is configured.
 */
export async function currentUserId(): Promise<string | null> {
  if (!backends.clerk) return null;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId ?? null;
}
