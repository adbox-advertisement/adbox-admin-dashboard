import type { ComponentProps } from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-grey-300 p-0.5 outline-none transition-colors focus-visible:shadow-adbox-focus-secondary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-purple dark:bg-muted dark:data-[state=checked]:bg-purple",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-white shadow-adbox-small transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}
