import { Menu } from "lucide-react"
import { useState } from "react"
import { DashboardSheetNavigation } from "@/components/layout/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function RdiMobileNavigationButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="hidden size-10 shrink-0 border-grey-200 bg-white text-grey-600 max-lg:inline-flex"
          aria-label="Open dashboard navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="hidden p-0 max-lg:block">
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard navigation</SheetTitle>
          <SheetDescription>Navigate to dashboard sections and account actions.</SheetDescription>
        </SheetHeader>
        <DashboardSheetNavigation onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
