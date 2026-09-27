"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useI18n } from "@/i18n/client";

/** Sign-in (Clerk) — only rendered when accounts are configured. Signed in, favourites sync to the account. */
export function AccountButton() {
  const { tr } = useI18n();
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="h-11 rounded-full border border-sand px-5 font-mono text-eyebrow text-strong uppercase hover:border-espresso">{tr("Sign in to sync favourites")}</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
