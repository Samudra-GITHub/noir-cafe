import { Badge, NoteChip, Price, RoastMeter } from "@/components/ui";
import type { MenuItem } from "@/data/types";
import { cn } from "@/lib/cn";

/**
 * MenuItemRow — one 88px menu line: name + description, the HOUSE badge,
 * price in Plex Mono. On hover (or keyboard focus within) the name eases right,
 * the price warms to caramel and the tasting notes rise in as chips.
 * Espresso-based drinks carry a roast meter beside the price.
 */
export function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <li
      className={cn(
        "group/row relative grid min-h-[88px] grid-cols-[1fr_auto] gap-x-6 pt-[13px] pb-5 md:grid-cols-[318px_1fr_auto] md:pb-[31px]",
        "before:pointer-events-none before:absolute before:-inset-x-4 before:inset-y-0 before:rounded-md before:bg-cream/0 before:transition-colors before:duration-500 before:ease-noir hover:before:bg-cream/60",
      )}
    >
      <div className="relative">
        <h3 className="font-sans text-body-sm leading-[22.5px] font-semibold text-strong transition-transform duration-500 ease-noir group-hover/row:translate-x-1">
          {item.name}
        </h3>
        <p className="font-sans text-[0.6875rem] leading-5 text-stone transition-transform delay-[40ms] duration-500 ease-noir group-hover/row:translate-x-1">
          {item.description}
        </p>
        {/* Small screens: notes always visible beneath the description. */}
        <ul aria-label="Tasting notes" className="mt-3 flex flex-wrap gap-1.5 md:hidden">
          {item.notes.map((note) => (
            <li key={note}>
              <NoteChip>{note}</NoteChip>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative hidden items-start gap-3 pt-1 md:flex">
        {item.house && <Badge>House</Badge>}
        <ul aria-label="Tasting notes" className="flex flex-wrap gap-1.5">
          {item.notes.map((note, i) => (
            <li
              key={note}
              className="translate-y-1.5 opacity-0 transition-[opacity,translate] duration-500 ease-noir group-focus-within/row:translate-y-0 group-focus-within/row:opacity-100 group-hover/row:translate-y-0 group-hover/row:opacity-100 motion-reduce:translate-y-0"
              style={{ transitionDelay: `${60 + i * 60}ms` }}
            >
              <NoteChip>{note}</NoteChip>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-start gap-3 pt-1">
        {item.house && <Badge className="md:hidden">House</Badge>}
        {item.roast && <RoastMeter roast={item.roast} className="mt-[5px]" />}
        <Price
          value={item.price}
          size="sm"
          className="transition-colors duration-500 ease-noir group-hover/row:text-caramel-ink"
        />
      </div>
    </li>
  );
}
