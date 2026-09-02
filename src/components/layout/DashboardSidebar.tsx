import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  ChevronDown,
  CircleHelp,
  CirclePlay,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"

import mainLogo from "@/assets/mainlogo.svg"
import rdiMark from "@/assets/rdi-mark.svg"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"

type DashboardNavItem = {
  label: string
  icon?: LucideIcon
  imageSrc?: string
  to: string
  children?: Array<{
    label: string
    to: string
  }>
}

const navItems: DashboardNavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: APP_ROUTES.dashboard,
  },
  {
    label: "Manage Users",
    icon: UserRound,
    to: APP_ROUTES.manageUsers,
  },
  {
    label: "Ads Management",
    icon: CirclePlay,
    to: APP_ROUTES.adsManagement,
    children: [
      { label: "Ad Requests", to: APP_ROUTES.adRequests },
      { label: "Reported Ads", to: APP_ROUTES.reportedAds },
    ],
  },
  {
    label: "Video Management",
    icon: Video,
    to: APP_ROUTES.videoManagement,
  },
  {
    label: "RDI",
    imageSrc: rdiMark,
    to: APP_ROUTES.rdi,
  },
  {
    label: "Financials",
    icon: Banknote,
    to: APP_ROUTES.financials,
    children: [
      { label: "Advertisers Payment", to: APP_ROUTES.advertisersPayment },
      { label: "Withdrawals", to: APP_ROUTES.withdrawals },
    ],
  },
  {
    label: "Support",
    icon: CircleHelp,
    to: APP_ROUTES.support,
  },
  {
    label: "Manage Admins",
    icon: UsersRound,
    to: APP_ROUTES.manageAdmins,
  },
  {
    label: "Settings",
    icon: Settings,
    to: APP_ROUTES.settings,
  },
]

function DashboardNavigationContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () =>
      new Set(
        navItems
          .filter(
            (item) =>
              item.children?.some((child) => pathname === child.to) || pathname === item.to
          )
          .map((item) => item.label)
      )
  )

  const toggleGroup = (label: string) => {
    setExpandedGroups((currentGroups) => {
      const nextGroups = new Set(currentGroups)
      if (nextGroups.has(label)) nextGroups.delete(label)
      else nextGroups.add(label)
      return nextGroups
    })
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex min-h-14 items-center border-b border-grey-100 px-2 pb-4">
          <Link
            to={APP_ROUTES.dashboard}
            onClick={onNavigate}
            aria-label="Go to Dashboard"
            className="rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2"
          >
            <img
              src={mainLogo}
              alt="AdBox"
              className="h-[40.2px] w-[134px] object-contain"
            />
          </Link>
        </div>

        <nav aria-label="Dashboard navigation" className="flex w-full flex-col gap-1.5">
          {navItems.map((item) => {
            const isExpanded = expandedGroups.has(item.label)
            const groupId = `${item.label.toLowerCase().replace(/\s+/g, "-")}-subnavigation`
            const isGroupActive =
              pathname === item.to || item.children?.some((child) => pathname === child.to)

            return (
              <div key={item.label} className="w-full">
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-b2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      isGroupActive
                        ? "bg-purple/10 text-purple"
                        : "text-grey-500 hover:bg-auth-background hover:text-grey-1000"
                    )}
                    aria-expanded={isExpanded}
                    aria-controls={groupId}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-grey-50 transition-colors group-hover:bg-white">
                      {item.icon ? (
                        <item.icon aria-hidden="true" className="size-5" strokeWidth={1.65} />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn("size-4 shrink-0 text-grey-400 transition-transform duration-200", isExpanded && "rotate-180")}
                      strokeWidth={1.65}
                    />
                  </button>
                ) : (
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    end
                    className={({ isActive }) =>
                    cn(
                      "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-b2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      isActive
                        ? "bg-purple/10 text-purple"
                        : "text-grey-500 hover:bg-auth-background hover:text-grey-1000"
                    )
                  }
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-grey-50 transition-colors group-hover:bg-white group-aria-[current=page]:bg-white">
                    {item.imageSrc ? (
                      <img src={item.imageSrc} alt="" className="size-5 object-contain" />
                    ) : item.icon ? (
                      <item.icon aria-hidden="true" className="size-5" strokeWidth={1.65} />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </NavLink>
                )}

              {item.children ? (
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div id={groupId} className="ml-7 flex flex-col gap-0.5 border-l border-grey-200 py-1 pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              "group/child flex min-h-9 items-center gap-2 rounded-lg px-3 text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan",
                              isActive
                                ? "bg-auth-background font-semibold text-grey-1000"
                                : "text-grey-500 hover:bg-auth-background hover:text-grey-1000"
                            )
                          }
                        >
                          <span className="size-1.5 shrink-0 rounded-full bg-grey-300 transition-colors group-aria-[current=page]/child:bg-purple" />
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            )
          })}
        </nav>
      </div>

      <Link
        to={APP_ROUTES.login}
        onClick={onNavigate}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-b2 text-error-500 outline-none transition-colors hover:border-error-100 hover:bg-error-50 focus-visible:ring-2 focus-visible:ring-error-300"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-error-50">
          <LogOut aria-hidden="true" className="size-5" strokeWidth={1.65} />
        </span>
        <span>Log Out</span>
      </Link>
    </>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[290px] shrink-0 flex-col justify-between overflow-y-auto border-r border-grey-100 bg-white px-4 pb-8 pt-4 font-sans max-lg:hidden">
      <DashboardNavigationContent />
    </aside>
  )
}

export function DashboardSheetNavigation({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-4 pb-8 pt-4 font-sans">
      <DashboardNavigationContent onNavigate={onNavigate} />
    </div>
  )
}
