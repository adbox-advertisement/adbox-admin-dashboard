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
} from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import mainLogo from "@/assets/mainlogo.svg"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"

type DashboardNavItem = {
  label: string
  icon?: LucideIcon
  to?: string
  children?: string[]
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
  },
  {
    label: "Ads Management",
    icon: CirclePlay,
    children: ["Ad Requests", "Reported Ads"],
  },
  {
    label: "Financials",
    icon: Banknote,
    children: ["Advertisers payment", "Withdrawals"],
  },
  {
    label: "Support",
    icon: CircleHelp,
  },
  {
    label: "Manage Admins",
    icon: UsersRound,
  },
  {
    label: "Settings",
    icon: Settings,
  },
]

function DashboardNavigationContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <img
          src={mainLogo}
          alt="AdBox"
          className="h-[40.2px] w-[134px] object-contain"
        />

        <div className="h-px w-[calc(100%+32px)] bg-grey-100" />

        <nav aria-label="Dashboard navigation" className="flex w-full flex-col gap-1">
          {navItems.map((item) => (
            <div key={item.label} className="w-full">
              {item.to ? (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 w-full items-center gap-2 rounded-[5px] px-2 text-b2 font-semibold transition-colors",
                      isActive
                        ? "bg-purple text-white"
                        : "text-grey-400 hover:bg-grey-100 hover:text-grey-1000"
                    )
                  }
                >
                  {item.icon ? (
                    <item.icon
                      aria-hidden="true"
                      className="size-6 shrink-0"
                      strokeWidth={1.7}
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0"
                    strokeWidth={1.7}
                  />
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-2 rounded-[5px] px-2 text-left text-b2 font-semibold text-grey-400 transition-colors hover:bg-grey-100 hover:text-grey-1000"
                >
                  {item.icon ? (
                    <item.icon
                      aria-hidden="true"
                      className="size-6 shrink-0"
                      strokeWidth={1.7}
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.children ? (
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 shrink-0"
                      strokeWidth={1.7}
                    />
                  ) : null}
                </button>
              )}

              {item.children ? (
                <div className="flex flex-col gap-1 py-1">
                  {item.children.map((child) => (
                    <a
                      key={child}
                      href="#"
                      onClick={onNavigate}
                      className="flex h-10 items-center rounded-[5px] pl-11 pr-2 text-b2 font-semibold text-grey-400 transition-colors hover:bg-grey-100 hover:text-grey-1000"
                    >
                      <span className="truncate">{child}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>

      <Link
        to={APP_ROUTES.login}
        onClick={onNavigate}
        className="flex h-[45px] w-full items-center gap-3 rounded-[5px] px-2 text-b2 font-semibold text-error-500 transition-colors hover:bg-error-50"
      >
        <LogOut aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.7} />
        <span>Log Out</span>
      </Link>
    </>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] shrink-0 flex-col justify-between overflow-y-auto bg-white px-4 pb-[50px] pt-4 lg:flex">
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
    <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-4 pb-8 pt-4">
      <DashboardNavigationContent onNavigate={onNavigate} />
    </div>
  )
}
