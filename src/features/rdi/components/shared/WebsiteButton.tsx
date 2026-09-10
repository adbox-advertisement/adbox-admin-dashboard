import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
export function WebsiteButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button {...props} className={cn("h-10 rounded-md px-4 py-2 font-medium focus-visible:ring-2 focus-visible:ring-offset-2", className)} />
}
