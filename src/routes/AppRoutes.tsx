import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { createAppRouter } from "./router"
export function AppRoutes() {
  const queryClient = useQueryClient()
  const [router] = useState(() => createAppRouter(queryClient))
  return <RouterProvider router={router} />
}
