import { Bell, Menu, Search } from "lucide-react"
import { useState } from "react"

import adminAvatar from "@/assets/dashboard/admin-avatar.jpg"
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

export function DashboardHeader() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <header className="grid min-h-[101px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-auth-background px-4 py-6 sm:px-6 md:grid-cols-[auto_minmax(0,415px)_auto] md:gap-6 lg:grid-cols-[minmax(0,1fr)_415px]">
      <h1 className="min-w-0 truncate font-heading text-h5 font-semibold text-grey-1000 md:text-h4">
        Dashboard
      </h1>

      <div className="justify-self-end md:col-start-3 lg:hidden">
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

      <div className="col-span-2 row-start-2 flex h-[61px] w-full max-w-full shrink-0 items-center justify-end gap-3 rounded-[30px] bg-white py-2.5 pl-2.5 pr-[11px] shadow-[14px_17px_20px_rgba(112,144,176,0.08)] md:col-span-1 md:col-start-2 md:row-start-1 md:max-w-[415px] md:justify-self-center md:gap-5 lg:justify-self-end">
        <label className="relative h-[41px] min-w-0 flex-1">
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

        <img
          src={adminAvatar}
          alt="Admin profile"
          className="size-[41px] shrink-0 rounded-full object-cover"
        />
      </div>
    </header>
  )
}
