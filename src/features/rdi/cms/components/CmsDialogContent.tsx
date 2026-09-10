import { type ComponentProps, useRef } from "react"
import { DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function CmsDialogContent({ className, ...props }: ComponentProps<typeof DialogContent>) {
  const opener = useRef<HTMLElement | null>(null)

  return <DialogContent
    {...props}
    className={cn("rdi-cms-dialog", className)}
    onOpenAutoFocus={event => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      props.onOpenAutoFocus?.(event)
    }}
    onCloseAutoFocus={event => {
      props.onCloseAutoFocus?.(event)
      if (!event.defaultPrevented && opener.current?.isConnected) {
        event.preventDefault()
        opener.current.focus()
      }
    }}
  />
}
