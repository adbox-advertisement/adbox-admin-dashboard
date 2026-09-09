import { redirect } from "react-router-dom"
import { hasAdminSession } from "@/lib/auth-session"
import { APP_ROUTES } from "./paths"
export function requireAdminSession() {
  return hasAdminSession() ? null : redirect(APP_ROUTES.login)
}
export function redirectToWorkspace() {
  return redirect(hasAdminSession() ? APP_ROUTES.dashboard : APP_ROUTES.login)
}
