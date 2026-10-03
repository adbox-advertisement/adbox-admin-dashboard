import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const Icon = isDark ? Sun : Moon
  return <Button type="button" variant="outline" className="min-h-11 gap-2 rounded-full bg-card px-5 text-foreground" onClick={() => setTheme(isDark ? "light" : "dark")}>
    <Icon className="size-4" aria-hidden="true" /><span>Switch to {isDark ? "light" : "dark"} mode</span>
  </Button>
}
