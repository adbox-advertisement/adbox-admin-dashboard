import type { ComponentProps } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-grey-1000/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none!" />
      <DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-[20px] border border-border bg-card p-6 text-foreground shadow-adbox-large outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none!", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:shadow-adbox-focus-secondary"><X className="size-4" aria-hidden="true" /><span className="sr-only">Close dialog</span></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-heading text-h5 font-semibold leading-7", className)} {...props} />
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />
}
