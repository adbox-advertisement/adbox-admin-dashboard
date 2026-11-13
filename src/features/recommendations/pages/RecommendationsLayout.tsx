import { Outlet } from "react-router-dom"
import { useLiveSettings } from "../hooks"
import { LiveSettingsContext } from "../lib/live-context"
import { ParameterSheet } from "../components/ParameterSheet"

/**
 * The Recommendations section: reads the live settings once for every page and chip in it, and
 * opens any parameter's details over the page (`?param=<id>`). The sidebar moves between pages.
 */
export function RecommendationsLayout() {
  const live = useLiveSettings()
  return <LiveSettingsContext.Provider value={live}>
    <div className="flex w-full min-w-0 flex-col gap-6 pb-10 pt-6 sm:pb-12">
      <Outlet />
    </div>
    <ParameterSheet />
  </LiveSettingsContext.Provider>
}
