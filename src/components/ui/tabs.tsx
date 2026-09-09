import type { ComponentProps } from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex gap-6 border-b border-border", className)} {...props} />
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("inline-flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:shadow-adbox-focus-secondary data-[state=active]:border-primary data-[state=active]:text-primary", className)} {...props} />
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none focus-visible:shadow-adbox-focus-secondary", className)} {...props} />
}
