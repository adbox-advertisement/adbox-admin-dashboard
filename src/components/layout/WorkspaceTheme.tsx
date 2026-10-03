import { useEffect, useState, type ReactNode } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { Toaster } from "sonner"

const themeKey = "adbox-theme"

function savedTheme() {
  try {
    const saved = localStorage.getItem(themeKey) ?? localStorage.getItem("adbox-recruitment-theme")
    return saved === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

// Mounted above the router so navigation, authentication, and portals share
// one preference. Retain the previous recruitment choice on first upgrade.
export function WorkspaceTheme({ children }: { children: ReactNode }) {
  const [initialTheme] = useState(savedTheme)
  useEffect(() => {
    try {
      if (!localStorage.getItem(themeKey)) localStorage.setItem(themeKey, initialTheme)
    } catch { /* Appearance still works when browser storage is unavailable. */ }
  }, [initialTheme])
  return <ThemeProvider attribute="class" storageKey={themeKey} defaultTheme={initialTheme} enableSystem={false} disableTransitionOnChange>
    {children}
    <WorkspaceToasts />
  </ThemeProvider>
}

function WorkspaceToasts() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme === "dark" ? "dark" : "light"} position="bottom-right" closeButton richColors />
}
