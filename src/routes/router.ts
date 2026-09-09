import { createElement } from "react"
import { createBrowserRouter, redirect } from "react-router-dom"
import type { QueryClient } from "@tanstack/react-query"
import { AppLoading } from "@/components/feedback/AppLoading"
import { RouteErrorPage } from "@/components/feedback/RouteErrorPage"
import { pendingPages } from "@/config/pending-pages"
import { authRoutes, logoutAdmin } from "@/features/auth"
import { dashboardRoutes } from "@/features/dashboard"
import { rdiRoutes } from "@/features/rdi"
import { videoRoutes } from "@/features/videos"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { requireAdminSession, redirectToWorkspace } from "./guards"
import { APP_ROUTES } from "./paths"
export function createAppRouter(queryClient: QueryClient) {
  return createBrowserRouter([{
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: AppLoading,
    children: [
      { path: APP_ROUTES.root, loader: redirectToWorkspace },
      ...authRoutes,
      {
        path: APP_ROUTES.logout,
        loader: redirectToWorkspace,
        action: async () => {
          await queryClient.cancelQueries()
          try { await logoutAdmin() }
          catch { /* A failed server request must not keep the local session open. */ }
          finally { queryClient.clear() }
          return redirect(APP_ROUTES.login)
        },
      },
      {
        id: "dashboard-layout",
        Component: DashboardLayout,
        loader: requireAdminSession,
        shouldRevalidate: () => true,
        children: [
          ...dashboardRoutes, ...videoRoutes, ...rdiRoutes,
          ...pendingPages.map(({ path, ...page }) => ({
            path,
            handle: { title: page.title },
            lazy: async () => {
              const { PendingFeaturePage } = await import("@/components/feedback/PendingFeaturePage")
              return { Component: () => createElement(PendingFeaturePage, page) }
            },
          })),
        ],
      },
      { path: "*", loader: () => { throw new Response(null, { status: 404 }) } },
    ],
  }])
}
