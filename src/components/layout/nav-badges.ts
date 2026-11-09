import { createContext, useContext } from "react"

/** Waiting work by sidebar route ("/ads-management/ad-requests" → 3). The dashboard layout provides it. */
export const NavBadgesContext = createContext<Readonly<Record<string, number>>>({})

export function useNavBadges() {
  return useContext(NavBadgesContext)
}

/** A group's badge is what waits behind its entries; a plain entry's is its own. */
export function navItemCount(badges: Readonly<Record<string, number>>, item: { to: string; children?: Array<{ to: string }> }) {
  return item.children
    ? item.children.reduce((total, child) => total + (badges[child.to] ?? 0), 0)
    : badges[item.to] ?? 0
}

/** Everything waiting, for the mobile menu button that hides the sidebar. */
export function useWaitingTotal() {
  const badges = useNavBadges()
  return Object.values(badges).reduce((total, count) => total + count, 0)
}
