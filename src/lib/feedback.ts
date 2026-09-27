import { useEffect, useRef } from "react";
import { haptic, type Haptic } from "./haptics";
import { play, type Voice } from "./sound";

/**
 * Sensory feedback — each meaningful moment pairs a haptic tap with a sound.
 * Both are opt-out/opt-in by the visitor (haptics on for touch devices with a
 * motor, sound muted until turned on), so calling these is always safe.
 */
export type Moment = "swipe" | "confirm" | "favorite" | "pour" | "steam" | "grind" | "add";

const MOMENTS: Record<Moment, { haptic?: Haptic; sound?: Voice }> = {
  swipe: { haptic: "swipe", sound: "beans" }, // carousels, galleries, story slides
  confirm: { haptic: "success", sound: "confirm" }, // reservation confirmed
  favorite: { haptic: "toggle", sound: "note" }, // saving a recipe / favourite drink
  pour: { haptic: "press", sound: "pour" }, // starting a brew timer
  steam: { sound: "steam" }, // opening a drink's details
  grind: { haptic: "toggle", sound: "grinder" }, // changing grind size
  add: { haptic: "press", sound: "cup" }, // adding to the bag / an order
};

export function feedback(moment: Moment) {
  const m = MOMENTS[moment];
  if (m.haptic) haptic(m.haptic);
  if (m.sound) play(m.sound);
}

/** Fire `moment` whenever `value` changes after mount (e.g. a swiped-to slide). */
export function useFeedbackOnChange<T>(value: T, moment: Moment) {
  const previous = useRef(value);
  useEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    feedback(moment);
  }, [value, moment]);
}
