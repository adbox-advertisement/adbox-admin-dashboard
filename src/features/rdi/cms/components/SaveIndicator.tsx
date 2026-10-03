import { Check, CircleAlert, LoaderCircle } from "lucide-react"
import { useCmsStore } from "../store"
export function SaveIndicator() {
  const status = useCmsStore(state => state.saveState)
  return <span role="status" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-grey-500 dark:text-muted-foreground">
    {status === "saved" ? <Check className="size-3.5 text-success-700 dark:text-success-400" /> : status === "saving" ? <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" /> : <CircleAlert className="size-3.5 text-error-700 dark:text-error-400" />}
    {status === "saved" ? "Saved to this browser" : status === "saving" ? "Saving…" : "Not saved"}
  </span>
}
