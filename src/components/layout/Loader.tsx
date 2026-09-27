import { LoaderController } from "./LoaderController";

/**
 * First-visit loader — "Preparing your coffee…": a cup fills, steam rises and
 * a caramel rule tracks real readiness (DOM, fonts, first imagery).
 *
 * Server-rendered so it covers the page from the first paint. An inline script
 * in <head> (LOADER_BOOT) hides it on repeat visits in the same session, and
 * CSS retires it after 3.2s even if JavaScript never runs. Hidden entirely
 * under prefers-reduced-motion.
 */
export function Loader() {
  return (
    <div id="noir-loader" className="noir-loader" aria-hidden="true">
      <div className="flex flex-col items-center">
        <div className="relative h-[120px] w-[132px]">
          {/* Steam */}
          <span className="loader-steam left-[38px] [animation-delay:0s]" />
          <span className="loader-steam left-[58px] [animation-delay:0.5s]" />
          <span className="loader-steam left-[78px] [animation-delay:1s]" />

          <svg viewBox="0 0 132 120" className="absolute inset-0 size-full" fill="none">
            <defs>
              <clipPath id="loader-cup">
                <path d="M22 50h76l-7 48a14 14 0 0 1-14 12H43a14 14 0 0 1-14-12z" />
              </clipPath>
            </defs>
            {/* Coffee filling the cup */}
            <g clipPath="url(#loader-cup)">
              <rect className="loader-fill" x="20" y="50" width="80" height="62" fill="var(--noir-walnut)" />
              <path
                className="loader-crema"
                d="M18 54c10-4 20 4 30 0s20-4 30 0 20 4 30 0v8H18z"
                fill="var(--noir-caramel)"
                opacity="0.55"
              />
            </g>
            {/* Cup */}
            <path
              d="M22 50h76l-7 48a14 14 0 0 1-14 12H43a14 14 0 0 1-14-12z"
              stroke="var(--noir-beige)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M97 62h6a10 10 0 0 1 0 20h-9" stroke="var(--noir-beige)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 116h92" stroke="var(--noir-beige)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>

        <p className="mt-8 font-display text-[1.75rem] leading-none text-beige italic">Preparing your coffee…</p>
        <div className="mt-6 h-px w-[160px] overflow-hidden bg-char">
          <span id="noir-loader-bar" className="block h-full w-full origin-left scale-x-0 bg-caramel" />
        </div>
        <p id="noir-loader-pct" className="mt-3 font-mono text-eyebrow text-taupe tabular-nums">
          00%
        </p>
      </div>
      <LoaderController />
    </div>
  );
}

/**
 * Runs before first paint: skip the loader on repeat visits this session, under
 * reduced motion, and on phones (where it would cost the mobile LCP budget).
 */
export const LOADER_BOOT = `try{if(sessionStorage.getItem("noir:loaded")||matchMedia("(prefers-reduced-motion: reduce)").matches||matchMedia("(max-width: 767px)").matches){document.documentElement.classList.add("noir-loaded")}else{document.documentElement.classList.add("noir-loading","noir-intro-late")}}catch(e){document.documentElement.classList.add("noir-loaded")}`;
