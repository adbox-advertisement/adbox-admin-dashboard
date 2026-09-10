import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
export function CmsButton({ className, variant = "outline", ...props }: ComponentProps<typeof Button>) {
  return <Button variant={variant} className={cn("h-10 rounded-xl px-4 text-sm font-semibold shadow-none", variant === "default" && "bg-blue text-white hover:bg-blue/90", className)} {...props} />
}
