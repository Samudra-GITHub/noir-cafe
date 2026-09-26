import { FadeUp } from "@/components/motion/FadeUp";
import { Eyebrow, Display } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * PageIntro — the opening band shared by the inner pages (Menu, Brewing Lab,
 * Reservation, Locations, Shop): caramel eyebrow + 60px Cormorant H1 on the
 * left, a muted 15px lead on the right, bottom-aligned. Clears the fixed nav.
 */
export function PageIntro({
  eyebrow,
  title,
  lead,
  titleClassName,
  leadClassName,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  titleClassName?: string;
  leadClassName?: string;
  className?: string;
}) {
  return (
    <FadeUp
      className={cn(
        "container-page flex flex-col gap-6 pt-32 lg:flex-row lg:items-end lg:justify-between lg:pt-[172px]",
        className,
      )}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Display as="h1" size="lg" className={cn("mt-[13px] text-strong", titleClassName)}>
          {title}
        </Display>
      </div>
      <p
        className={cn(
          "max-w-[380px] font-sans text-body-sm leading-[26px] text-stone lg:mb-[3px]",
          leadClassName,
        )}
      >
        {lead}
      </p>
    </FadeUp>
  );
}
