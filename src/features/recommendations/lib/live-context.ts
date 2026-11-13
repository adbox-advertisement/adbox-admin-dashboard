import { createContext, useContext } from "react"
import type { LiveSettings } from "../hooks"

/** The live settings, read once by the section's layout and shared by every page and chip in it. */
export const LiveSettingsContext = createContext<LiveSettings | null>(null)

export function useLive(): LiveSettings {
  const live = useContext(LiveSettingsContext)
  if (!live) throw new Error("useLive() needs RecommendationsLayout above it")
  return live
}

/** The URL parameter that opens a parameter's details from anywhere in the section. */
export const PARAM_QUERY = "param"
