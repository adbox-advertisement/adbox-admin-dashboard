import { LoaderCircle } from "lucide-react"
import mainLogo from "@/assets/brand/mainlogo.svg"
export function AppLoading() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-auth-background dark:bg-background px-6">
      <img src={mainLogo} alt="AdBox" className="w-40 dark:brightness-0 dark:invert" />
      <p role="status" className="flex items-center gap-2 text-sm text-grey-500 dark:text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />Loading your workspace…
      </p>
    </main>
  )
}
