import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom"

import { LoginPage } from "@/features/auth"
import { DashboardPage } from "@/features/dashboard"
import { RdiPage } from "@/features/rdi"
import { APP_ROUTES } from "@/routes/paths"

const router = createBrowserRouter([
  {
    path: APP_ROUTES.root,
    loader: () => redirect(APP_ROUTES.login),
  },
  {
    path: APP_ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: APP_ROUTES.dashboard,
    element: <DashboardPage />,
  },
  {
    path: APP_ROUTES.rdi,
    element: <RdiPage />,
  },
  {
    path: "*",
    loader: () => redirect(APP_ROUTES.login),
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
