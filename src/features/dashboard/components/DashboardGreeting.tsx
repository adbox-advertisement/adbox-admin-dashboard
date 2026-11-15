import { format } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { useRefreshScreen } from "../hooks"
import { greeting } from "../lib/figures"
import { ink, muted, surface } from "./tokens"

/** The day, and one button that reads every figure on the page again. */
export function DashboardGreeting() {
  const { refresh, fetching } = useRefreshScreen()
  const now = new Date()
  return <section aria-label="Today" className="px-4 sm:px-6">
    <div className={cn(surface, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6")}>
      <div className="min-w-0">
        <p className={cn("font-heading text-h5 font-semibold", ink)}>{greeting(now.getHours())}</p>
        <p className={cn("mt-1 text-b3 md:text-b2", muted)}>{format(now, "EEEE d MMMM yyyy")} · AdBox right now, from the live figures.</p>
      </div>
      <Button type="button" variant="outline" onClick={() => void refresh()} aria-busy={fetching}
        className="h-11 shrink-0 cursor-pointer rounded-[36px] border-grey-300 bg-white px-5 text-b3 font-semibold text-grey-1000 hover:bg-grey-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-background md:text-b2">
        <RefreshCw className={cn("size-4", fetching && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh
      </Button>
    </div>
  </section>
}
