/** What the page and business request reviews share that is not drawn. */

export const firstName = (name: string) => name.split(" ")[0]

/** Pictures can be shown on the page; a PDF opens in a new tab. */
export function isPicture(name: string) {
  return /\.(jpe?g|png|webp)$/i.test(name)
}

/**
 * What the username field says: the rules first, then the server's answer (it also knows whether
 * the requested one was taken since).
 */
export function usernameHint({ cleaned, requested, formatProblem, answer, failed }: {
  cleaned: string
  requested: string
  formatProblem: string | null
  answer: { available: boolean; reason: string | null } | undefined
  failed: boolean
}): { error: string | null; hint: string } {
  if (formatProblem) return { error: formatProblem, hint: "" }
  if (answer && !answer.available) return { error: answer.reason ?? "That username is taken.", hint: "" }
  if (answer) return { error: null, hint: cleaned === requested ? "What they asked for. Available." : "Available." }
  return { error: null, hint: failed ? "Couldn't check it now; approving checks again." : "Checking…" }
}
