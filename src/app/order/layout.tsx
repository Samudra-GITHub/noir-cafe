import { ClerkProvider } from "@clerk/nextjs";

/**
 * Accounts are optional: Clerk wraps the order pages only when it is
 * configured, so the rest of the site never loads it and guests can always
 * order without signing in.
 */
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return children;
  return <ClerkProvider>{children}</ClerkProvider>;
}
