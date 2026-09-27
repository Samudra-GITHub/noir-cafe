import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Proxy — runs only on the ordering routes (see matcher). With Clerk
 * configured it attaches the session so route handlers can read the guest's
 * account; without Clerk it is a pass-through and ordering works as a guest.
 */
const clerk = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerk ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: ["/order/:path*", "/api/orders/:path*", "/api/favorites"],
};
