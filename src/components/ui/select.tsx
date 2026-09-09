import type { ComponentProps } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger className={cn("flex h-10 min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:shadow-adbox-focus-secondary disabled:opacity-50 [&>span]:truncate", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild><ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content position="popper" sideOffset={6} className={cn("z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-adbox-medium", className)} {...props}>
        <SelectPrimitive.ScrollUpButton className="flex justify-center py-1"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex justify-center py-1"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className={cn("relative flex cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm outline-none focus:bg-secondary/8 focus:text-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-3"><Check className="size-4" aria-hidden="true" /></SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
