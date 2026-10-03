import { QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme"
import { createQueryClient } from "./query-client"

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return <WorkspaceTheme><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></WorkspaceTheme>
}
