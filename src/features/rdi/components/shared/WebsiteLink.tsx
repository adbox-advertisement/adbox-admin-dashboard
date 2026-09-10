import type { AnchorHTMLAttributes } from "react"
import { Link, useLocation } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
export function WebsiteLink({ href = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { pathname } = useLocation()
  const preview = pathname.startsWith("/rdi/preview/")
  if (href.startsWith("/") && !href.startsWith("/rdi-assets/") && !href.startsWith("//")) {
    return <Link {...props} to={preview ? `${APP_ROUTES.rdi}/preview/${href === "/" ? "home" : href.slice(1)}` : `${APP_ROUTES.rdi}/website${href === "/" ? "" : href}`}>
      {children}
    </Link>
  }
  return <a {...props} href={href}>
    {children}
  </a>
}
