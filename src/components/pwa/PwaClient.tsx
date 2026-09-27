"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { whenIdle, whenLoaded } from "@/lib/page-ready";
import { cn } from "@/lib/cn";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const DISMISS_KEY = "noir:install-dismissed";
const VISITS_KEY = "noir:visits";

function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

const isStandalone = () => matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

/**
 * PWA client — registers the service worker (production, after load + idle),
 * shows a quiet "offline" note when the connection drops, and on phones
 * offers installation from the second visit: Chrome's own install sheet
 * where the browser supports it, Share → Add to Home Screen instructions on
 * iOS Safari. Dismissed once, it stays dismissed.
 */
export function PwaClient() {
  const online = useOnline();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [offer, setOffer] = useState<"prompt" | "ios" | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void whenLoaded()
      .then(() => whenIdle())
      .then(() => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isStandalone() || !matchMedia("(max-width: 767px)").matches) return;
    let visits = 0;
    let dismissed = false;
    try {
      if (!sessionStorage.getItem("noir:visit-counted")) {
        sessionStorage.setItem("noir:visit-counted", "1");
        localStorage.setItem(VISITS_KEY, String(Number(localStorage.getItem(VISITS_KEY) ?? 0) + 1));
      }
      visits = Number(localStorage.getItem(VISITS_KEY) ?? 0);
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (dismissed || visits < 2) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setOffer("prompt");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const ios = isIos() ? window.setTimeout(() => setOffer("ios"), 4000) : undefined;
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(ios);
    };
  }, []);

  const dismiss = () => {
    setOffer(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <>
      <p
        role="status"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-[calc(var(--safe-top)+84px)] z-50 mx-auto w-max rounded-full bg-espresso px-4 py-2 font-mono text-micro text-beige uppercase shadow-lg transition-all duration-500 ease-noir md:top-28",
          online ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        {online ? "" : "Offline · showing saved pages"}
      </p>

      {offer && (
        <aside
          aria-label="Install Noir Café"
          className="fixed inset-x-4 z-40 mx-auto max-w-[420px] rounded-2xl bg-espresso p-4 text-beige shadow-[0_18px_40px_-12px_rgb(23_18_14/0.6)] md:hidden motion-safe:animate-[float-up_0.5s_var(--ease-noir)_both]"
          style={{ bottom: "calc(var(--dock-height) + 28px + var(--safe-bottom))" }}
        >
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
            <img src="/icons/icon-192.png" alt="" width={44} height={44} className="rounded-xl" />
            <div className="flex-1">
              <p className="font-sans text-body-sm font-semibold">Noir Café on your home screen</p>
              <p className="mt-0.5 font-sans text-body-xs text-cream">
                {offer === "ios" ? "Tap Share, then “Add to Home Screen”." : "Opens like an app — the menu and our cafés work offline."}
              </p>
              {offer === "prompt" && deferred && (
                <button
                  type="button"
                  onClick={async () => {
                    await deferred.prompt();
                    await deferred.userChoice.catch(() => null);
                    setDeferred(null);
                    dismiss();
                  }}
                  className="mt-3 h-10 rounded-full bg-beige px-5 font-sans text-button font-semibold text-espresso uppercase"
                >
                  Install
                </button>
              )}
            </div>
            <button type="button" onClick={dismiss} aria-label="Not now" className="grid size-11 shrink-0 place-items-center rounded-full text-cream hover:bg-beige/10">
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
