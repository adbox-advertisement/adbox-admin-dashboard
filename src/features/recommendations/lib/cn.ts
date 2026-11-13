import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The shared `cn` reads the theme's type scale (`text-h1`…`text-h6`, `text-b1`…`text-b4`) as colours,
// so `cn("text-b3", "text-grey-500")` drops the size. This feature merges them as font sizes.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["h1", "h2", "h3", "h4", "h5", "h6", "b1", "b2", "b3", "b4"] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
