import { ChevronDown } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"

import mainLogo from "@/assets/brand/mainlogo.svg"
import { navItems } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"

function DashboardNavigationContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const navigationId = useId()
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

  useEffect(() => {
    setExpandedGroups((current) => {
      const active = navItems.find((item) => item.to === pathname || item.children?.some((child) => child.to === pathname))
      return active?.children && !current.has(active.label) ? new Set([...current, active.label]) : current
    })
  }, [pathname])

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
        <div className="flex min-h-14 items-center border-b border-sidebar-border px-2 pb-4">
          <Link
            to={APP_ROUTES.dashboard}
            onClick={onNavigate}
            aria-label="Go to Dashboard"
            className="rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2"
          >
            <img
              src={mainLogo}
              alt="AdBox"
              className="h-[40.2px] w-[134px] object-contain dark:brightness-0 dark:invert"
            />
          </Link>
        </div>

        <nav aria-label="Dashboard navigation" className="flex w-full flex-col gap-1.5">
          {navItems.map((item) => {
            const isExpanded = expandedGroups.has(item.label)
            const groupId = `${navigationId}-${item.label.toLowerCase().replace(/\s+/g, "-")}-subnavigation`
            const isGroupActive =
              pathname === item.to || item.children?.some((child) => pathname === child.to)

            return (
              <div key={item.label} className="w-full">
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-b2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      isGroupActive
                        ? "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    aria-expanded={isExpanded}
                    aria-controls={groupId}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 transition-colors group-hover:bg-card">
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
                    end={item.to !== APP_ROUTES.rdi}
                    className={({ isActive }) =>
                      cn(
                        "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-b2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                        isActive
                          ? "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )
                    }
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 transition-colors group-hover:bg-card group-aria-[current=page]:bg-card">
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
                    <div className="overflow-hidden" inert={!isExpanded}>
                      <div id={groupId} className="ml-7 flex flex-col gap-0.5 border-l border-sidebar-border py-1 pl-4">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                              cn(
                                "group/child flex min-h-9 items-center gap-2 rounded-lg px-3 text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan",
                                isActive
                                  ? "bg-sidebar-accent font-semibold text-sidebar-foreground"
                                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
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

    </>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[290px] shrink-0 flex-col justify-between overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground px-4 pb-8 pt-4 font-sans max-lg:hidden">
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
