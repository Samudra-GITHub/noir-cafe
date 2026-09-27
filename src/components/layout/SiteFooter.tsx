import Link from "next/link";
import { Logo } from "@/components/ui";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { FOOTER_LINKS, SITE, SOCIAL_LINKS } from "@/constants/site";

/**
 * Global footer — espresso band, tagline, meta row (address, store hours,
 * contact · links · social) and the oversized wordmark.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 bg-espresso text-beige">
      <div className="container-page pt-16 pb-12 md:pb-[68px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <Logo tone="inverse" />
          <p className="font-display text-[1.75rem] leading-[1.07] md:w-[480px] md:text-heading">
            Coffee, composed with care.
            <br />
            Every day, in every cup.
          </p>
        </div>

        <hr className="mt-12 h-px border-0 bg-sand md:mt-14" />

        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-start md:justify-between">
          <address className="font-mono text-eyebrow leading-[1.7] text-cream uppercase not-italic">
            {SITE.address}
            <br />
            {SITE.hours}
            <br />
            <a href={`mailto:${SITE.email}`} className="normal-case transition-colors duration-250 hover:text-caramel-glow max-md:relative max-md:after:absolute max-md:after:-inset-y-3.5 max-md:after:-inset-x-1 max-md:after:content-['']">
              {SITE.email}
            </a>
            {" · "}
            <a href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} className="transition-colors duration-250 hover:text-caramel-glow max-md:relative max-md:after:absolute max-md:after:-inset-y-3.5 max-md:after:-inset-x-1 max-md:after:content-['']">
              {SITE.phone}
            </a>
          </address>

          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center font-sans text-[0.75rem] leading-none text-beige transition-colors duration-250 ease-noir hover:text-caramel-glow md:min-h-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 md:items-end">
            <p className="font-mono text-eyebrow text-taupe uppercase">
              © {SITE.year} {SITE.name}
            </p>
            <ul aria-label="Social" className="-ml-2.5 flex gap-1 md:-mr-2.5 md:ml-0">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (opens in a new tab)`}
                    className="grid size-11 place-items-center rounded-full text-cream transition-[color,translate] duration-250 ease-noir hover:-translate-y-0.5 hover:text-caramel-glow"
                  >
                    <SocialIcon name={link.icon} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-12 text-center font-display text-[clamp(3.25rem,7.9vw,7.125rem)] leading-[0.9] tracking-[0.005em] uppercase md:mt-[42px]"
        >
          {SITE.name}
        </p>
      </div>
    </footer>
  );
}
