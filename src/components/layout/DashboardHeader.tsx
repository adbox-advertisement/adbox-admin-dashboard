import { Bell, Menu, Search } from "lucide-react"
import { useState, type ReactNode } from "react"

import { DashboardSheetNavigation } from "@/components/layout/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function DashboardHeader({ title = "Dashboard", account }: { title?: string; account: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <header className="grid min-h-[101px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-auth-background px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:gap-6">
      <h1 className="min-w-0 truncate py-1 font-heading text-h5 font-semibold leading-tight text-grey-1000 md:text-h4">
        {title}
      </h1>

      <div className="justify-self-end lg:hidden">
        <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-grey-500 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" strokeWidth={1.8} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 lg:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Dashboard navigation</SheetTitle>
              <SheetDescription>
                Navigate to dashboard sections and account actions.
              </SheetDescription>
            </SheetHeader>
            <DashboardSheetNavigation onNavigate={() => setIsNavOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="col-span-2 row-start-2 grid min-h-[61px] w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl bg-white p-2.5 shadow-adbox-small sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:col-span-1 xl:col-start-2 xl:row-start-1">
        <label className="relative h-[41px] min-w-0">
          <span className="sr-only">Search dashboard</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1/2 size-[11px] -translate-y-1/2 text-[#2b3674]"
            strokeWidth={2}
          />
          <Input
            type="search"
            placeholder="Search"
            className="h-full rounded-[49px] border-0 bg-auth-background pl-[42px] pr-4 text-sm text-grey-1000 placeholder:text-[#8f9bba] focus-visible:ring-0"
          />
        </label>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 rounded-full text-secondary-grey-600 hover:bg-transparent hover:text-grey-1000"
          aria-label="Notifications"
        >
          <Bell className="size-6" strokeWidth={1.7} />
        </Button>

        <div className="col-span-2 min-w-0 border-t border-grey-100 px-1 pb-1 pt-3 sm:col-span-1 sm:border-l sm:border-t-0 sm:py-0 sm:pl-3 sm:pr-0">
          {account}
        </div>
      </div>
    </header>
  )
}
