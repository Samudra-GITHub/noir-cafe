import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge taught the custom type scale so `text-body` and `text-strong` don't collide. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl", "display-xl", "display-lg", "display-md",
            "heading-xl", "heading-lg", "heading", "heading-md", "heading-step", "heading-sm", "logo",
            "body-lg", "body", "body-sm", "body-xs",
            "nav", "button", "mono-md", "mono-sm", "eyebrow", "micro",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
