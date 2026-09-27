"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Bookmark, X } from "lucide-react";
import { Button, Eyebrow } from "@/components/ui";
import { LazyScene } from "@/components/three/LazyScene";
import { LATTE_ARTS, type LatteArt } from "@/components/three/art";
import { BREW_METHODS } from "@/data/brewing";
import {
  band,
  brewSeconds,
  cremaHex,
  extractionYield,
  flavourEmphasis,
  grindName,
  referenceRecipe,
  roastLevel,
  tds,
  type Recipe,
} from "@/lib/brew-model";
import { feedback } from "@/lib/feedback";
import { haptic } from "@/lib/haptics";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/layout/PageTitle";
import { ExtractionMeter } from "./ExtractionMeter";
import { FlavorWheel } from "./FlavorWheel";
import { RoastSimulator } from "./RoastSimulator";
import { StudioSlider } from "./StudioSlider";
import { StudioTimer } from "./StudioTimer";

const loadStudio = () => import("@/components/three/StudioScene");
const SAVED_KEY = "noir:studio-recipes";
type Saved = Recipe & { name: string; savedAt: number };

// Saved recipes live in localStorage; this tiny store keeps every reader in sync.
const savedListeners = new Set<() => void>();
let savedCache: Saved[] | null = null;
const EMPTY: Saved[] = [];
function readSaved(): Saved[] {
  if (savedCache) return savedCache;
  try {
    savedCache = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as Saved[];
  } catch {
    savedCache = [];
  }
  return savedCache;
}
function useSavedRecipes() {
  const saved = useSyncExternalStore(
    (cb) => {
      savedListeners.add(cb);
      return () => savedListeners.delete(cb);
    },
    readSaved,
    () => EMPTY,
  );
  const write = (next: Saved[]) => {
    savedCache = next;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {}
    savedListeners.forEach((l) => l());
  };
  return { saved, write };
}

function Card({ title, eyebrow, children, className }: { title: string; eyebrow: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn("rounded-xl border border-sand bg-surface p-6 md:p-8", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-display text-[2rem] leading-none text-strong">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Recipe Studio — start from a house recipe, then change dose, ratio, grind,
 * water temperature and roast. The 3D cup's crema, the extraction meter, the
 * flavour wheel, the roast curve and the brew timer all follow each change.
 * Recipes can be saved on this device.
 */
export function RecipeStudio() {
  const safe = useMotionSafe();
  const [methodId, setMethodId] = useState(BREW_METHODS[0].id);
  const method = BREW_METHODS.find((m) => m.id === methodId)!;
  const [recipe, setRecipe] = useState<Recipe>(() => referenceRecipe(BREW_METHODS[0]));
  const [art, setArt] = useState<LatteArt>("rosetta");
  const { saved, write } = useSavedRecipes();

  const espresso = method.id === "espresso";
  const ref = referenceRecipe(method);
  const ey = extractionYield(method, recipe);
  const strength = tds(method, recipe, ey);
  const result = band(ey);
  const seconds = brewSeconds(method, recipe);
  const emphasis = useMemo(() => flavourEmphasis(recipe.roast, ey), [recipe.roast, ey]);
  const crema = cremaHex(recipe.roast, ey);
  const set = (patch: Partial<Recipe>) => setRecipe((r) => ({ ...r, ...patch }));

  const chooseMethod = (id: string) => {
    const next = BREW_METHODS.find((m) => m.id === id)!;
    haptic("toggle");
    setMethodId(id);
    setRecipe(referenceRecipe(next));
  };

  const grindRange: [number, number] = espresso ? [150, 450] : [Math.max(250, ref.grind - 350), Math.min(1200, ref.grind + 350)];
  const water = Math.round(recipe.dose * recipe.ratio);
  const name = `${method.method} · 1:${recipe.ratio.toFixed(1)} · ${recipe.temperature}°C · ${roastLevel(recipe.roast)}`;
  const isSaved = saved.some((s) => s.name === name);

  const save = () => {
    if (isSaved) return;
    feedback("favorite");
    write([{ ...recipe, name, savedAt: Date.now() }, ...saved].slice(0, 8));
  };

  return (
    <div className="container-page pt-32 pb-24 lg:pt-[172px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Brewing Lab · Studio</Eyebrow>
          <PageTitle>
            <h1 className="type-display-lg mt-[13px] text-strong">Recipe studio</h1>
          </PageTitle>
        </div>
        <p className="max-w-[420px] font-sans text-body-sm leading-[26px] text-stone">
          Start from one of our house recipes, then change the dose, ratio, grind, heat and roast. The cup, the extraction and the flavour wheel follow every move.
        </p>
      </header>

      {/* Method presets */}
      <div role="radiogroup" aria-label="House recipe" className="swipe-rail -mx-[var(--gutter)] mt-10 gap-2 px-[var(--gutter)] [&>*]:snap-start">
        {BREW_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === methodId}
            onClick={() => chooseMethod(m.id)}
            className={cn(
              "h-11 rounded-full border px-5 font-mono text-eyebrow uppercase transition-colors duration-300",
              m.id === methodId ? "border-espresso bg-espresso text-beige" : "border-sand text-strong hover:border-espresso",
            )}
          >
            {m.method}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        {/* The cup and what's in it */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-xl bg-cream">
            <LazyScene
              load={loadStudio}
              props={{ roast: recipe.roast, ey, art, onTap: () => setArt((a) => LATTE_ARTS[(LATTE_ARTS.indexOf(a) + 1) % LATTE_ARTS.length]), still: !safe }}
              label={`A latte in 3D, its crema coloured by this recipe (${roastLevel(recipe.roast).toLowerCase()} roast, ${ey.toFixed(1)}% extraction)`}
              className="aspect-square w-full"
              fallback={<Image src="/videos/latte-art-poster.webp" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
              <span className="font-mono text-micro text-stone uppercase">Drag to turn · tap to pour</span>
              <span aria-hidden className="size-6 rounded-full border-2 border-ivory shadow" style={{ background: crema }} />
            </div>
          </div>
          <ExtractionMeter ey={ey} tds={strength} band={result} />
        </div>

        <div className="flex flex-col gap-6">
          <Card eyebrow={method.code} title="The recipe">
            <div className="flex flex-col gap-7">
              <StudioSlider
                label="Dose"
                value={recipe.dose}
                min={espresso ? 14 : 8}
                max={espresso ? 22 : 40}
                step={0.5}
                display={`${recipe.dose.toFixed(1)} g`}
                valueText={`${recipe.dose} grams of coffee`}
                onChange={(dose) => set({ dose })}
              />
              <StudioSlider
                label={espresso ? "Brew ratio" : "Ratio"}
                value={recipe.ratio}
                min={espresso ? 1.5 : 12}
                max={espresso ? 3 : 18}
                step={0.1}
                display={`1:${recipe.ratio.toFixed(1)}`}
                valueText={`1 to ${recipe.ratio.toFixed(1)}, ${water} grams ${espresso ? "out" : "of water"}`}
                hint={espresso ? `${water} g in the cup. Ristretto near 1:1.5, lungo toward 1:3.` : `${water} g water. Most filter coffee sits between 1:15 and 1:17.`}
                onChange={(ratio) => set({ ratio: Math.round(ratio * 10) / 10 })}
              />
              <StudioSlider
                label="Grind"
                value={recipe.grind}
                min={grindRange[0]}
                max={grindRange[1]}
                step={10}
                display={`${recipe.grind} µm`}
                valueText={`${recipe.grind} microns, ${grindName(recipe.grind)}`}
                hint={grindName(recipe.grind)}
                ends={["Finer", "Coarser"]}
                onChange={(grind) => set({ grind })}
                onCommit={() => feedback("grind")}
              />
              <StudioSlider
                label="Water"
                value={recipe.temperature}
                min={85}
                max={98}
                step={0.5}
                display={`${recipe.temperature}°C`}
                valueText={`${recipe.temperature} degrees Celsius`}
                hint={recipe.temperature < 90 ? "Cooler water softens bitterness but extracts less." : recipe.temperature > 95 ? "Hot water extracts fast — watch for bitterness." : "The sweet spot for most coffees."}
                onChange={(temperature) => set({ temperature })}
              />
              <div className="flex flex-wrap gap-3 border-t border-sand pt-6">
                <Button onClick={save} aria-pressed={isSaved} arrow={false}>
                  <span className="inline-flex items-center gap-2">
                    <Bookmark aria-hidden className={cn("size-4", isSaved && "fill-current")} strokeWidth={1.5} />
                    {isSaved ? "Saved" : "Save recipe"}
                  </span>
                </Button>
                <Button variant="secondary" arrow={false} onClick={() => setRecipe(referenceRecipe(method))}>
                  Reset to house
                </Button>
              </div>
            </div>
          </Card>

          <Card eyebrow="Timer" title="Brew it">
            <StudioTimer method={method} seconds={seconds} crema={crema} />
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <Card eyebrow="Roast" title="Roast simulator">
          <RoastSimulator roast={recipe.roast} onChange={(roast) => set({ roast })} onCommit={() => haptic("toggle")} />
        </Card>
        <Card eyebrow="Taste" title="Flavour wheel">
          <FlavorWheel emphasis={emphasis} />
        </Card>
        {saved.length > 0 && (
          <Card eyebrow="On this device" title="Saved recipes">
            <ul className="flex flex-col">
              {saved.map((s) => (
                <li key={s.savedAt} className="flex items-center justify-between gap-4 border-b border-sand py-3">
                  <button
                    type="button"
                    className="min-h-11 flex-1 text-left font-sans text-body-sm font-semibold text-strong hover:text-caramel-ink"
                    onClick={() => {
                      setMethodId(s.methodId);
                      setRecipe({ methodId: s.methodId, dose: s.dose, ratio: s.ratio, grind: s.grind, temperature: s.temperature, roast: s.roast });
                    }}
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    onClick={() => write(saved.filter((x) => x.savedAt !== s.savedAt))}
                    className="grid size-11 place-items-center rounded-full text-stone hover:bg-cream hover:text-strong"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
