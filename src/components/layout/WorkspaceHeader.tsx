import { useState, type ReactNode } from "react"
import { ChevronRight, Menu } from "lucide-react"
import { DashboardSheetNavigation } from "./DashboardSidebar"
import { useWaitingTotal } from "./nav-badges"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function WorkspaceHeader({ title, account }: { title: string; account: ReactNode }) {
  const [open, setOpen] = useState(false)
  const waiting = useWaitingTotal()
  return <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-4 sm:px-8">
    <div className="flex items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild><Button size="icon" variant="outline" className="relative size-10 lg:hidden" aria-label={waiting ? `Open navigation, ${waiting} waiting` : "Open navigation"}><Menu aria-hidden="true" />{waiting ? <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-purple ring-2 ring-card" /> : null}</Button></SheetTrigger>
        <SheetContent side="left" className="bg-sidebar p-0 text-sidebar-foreground lg:hidden"><SheetHeader className="sr-only"><SheetTitle>Dashboard navigation</SheetTitle><SheetDescription>Navigate to dashboard sections and account actions.</SheetDescription></SheetHeader><DashboardSheetNavigation onNavigate={() => setOpen(false)} /></SheetContent>
      </Sheet>
      <span className="hidden text-sm text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" /><p className="text-sm font-semibold text-foreground">{title}</p>
    </div>
    <div className="hidden max-w-64 md:block">{account}</div>
  </header>
}
