import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-adbox-focus-secondary disabled:opacity-50", className)} {...props} />
}
