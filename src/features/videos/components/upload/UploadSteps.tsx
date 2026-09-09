import { Check, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function UploadSteps({ step }: { step: 1 | 2 }) {
  return (
    <ol aria-label="Upload progress" className="flex items-center gap-3 text-xs font-medium sm:gap-4">
      <li aria-current={step === 1 ? "step" : undefined} className="flex items-center gap-2 text-foreground">
        <span className={cn("flex size-7 items-center justify-center rounded-full", step === 1 ? "bg-secondary text-secondary-foreground" : "bg-secondary/10 text-secondary")}>
          {step === 1 ? "1" : <Check className="size-3.5" aria-hidden="true" />}
        </span>
        School
      </li>
      <li aria-hidden="true"><ChevronRight className="size-3.5 text-muted-foreground/50" /></li>
      <li aria-current={step === 2 ? "step" : undefined} className={cn("flex items-center gap-2", step === 2 ? "text-foreground" : "text-muted-foreground")}>
        <span className={cn("flex size-7 items-center justify-center rounded-full", step === 2 ? "bg-secondary text-secondary-foreground" : "border border-border bg-card")}>2</span>
        Upload content
      </li>
    </ol>
  )
}
