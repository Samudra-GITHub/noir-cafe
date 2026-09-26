/** Hand-drawn outline social marks at the Icon system's 1.25 stroke. */
export function SocialIcon({ name, className }: { name: "instagram" | "pinterest" | "spotify"; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "pinterest") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M10.6 20.2 12.4 12.6M12.4 12.6c-.7-1.7.3-4 2-4 1.5 0 2.2 1.1 2.2 2.4 0 2.2-1.3 4.2-3.1 4.2-1 0-1.6-.8-1.3-1.7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.8 9.6c2.9-.9 5.9-.6 8.6.9M8.3 12.4c2.3-.7 4.7-.4 6.8.8M8.8 15c1.8-.5 3.6-.3 5.2.6" />
    </svg>
  );
}
