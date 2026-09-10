import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"
const websiteRoute: RouteObject = {
  path: `${APP_ROUTES.rdi}/website`,
  handle: { title: "RDI Website", layout: "workspace" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./layouts/RdiWebsiteLayout")).RdiWebsiteLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/RdiHomePage")).RdiHomePage }) },
    { path: "about", handle: { title: "About RDI" }, lazy: async () => ({ Component: (await import("./pages/RdiAboutPage")).RdiAboutPage }) },
    { path: "construction", handle: { title: "RDI Construction" }, lazy: async () => ({ Component: (await import("./pages/RdiConstructionPage")).RdiConstructionPage }) },
    { path: "media", handle: { title: "RDI Media" }, lazy: async () => ({ Component: (await import("./pages/RdiMediaPage")).RdiMediaPage }) },
    { path: "solar", handle: { title: "RDI Solar Technology" }, lazy: async () => ({ Component: (await import("./pages/RdiSolarPage")).RdiSolarPage }) },
    { path: "contact", handle: { title: "Contact RDI" }, lazy: async () => ({ Component: (await import("./pages/RdiContactPage")).RdiContactPage }) },
  ],
}

export const rdiRoutes: RouteObject[] = [
  {
    path: APP_ROUTES.rdi,
    handle: { title: "RDI Website Manager", layout: "workspace" } satisfies AppRouteHandle,
    lazy: async () => ({ Component: (await import("./cms/components/CmsLayout")).CmsLayout }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./cms/pages/CmsPagesPage")).CmsPagesPage }) },
      { path: "pages/:pageId", lazy: async () => ({ Component: (await import("./cms/pages/CmsEditorPage")).CmsEditorPage }) },
      { path: "library", handle: { title: "RDI Media Library" }, lazy: async () => ({ Component: (await import("./cms/pages/CmsMediaPage")).CmsMediaPage }) },
      { path: "settings", handle: { title: "RDI Site Settings" }, lazy: async () => ({ Component: (await import("./cms/pages/CmsSettingsPage")).CmsSettingsPage }) },
    ],
  },
  websiteRoute,
]

export const rdiPreviewRoutes: RouteObject[] = [{
  path: `${APP_ROUTES.rdi}/preview/:pageId`,
  lazy: async () => ({ Component: (await import("./cms/components/WebsitePreviewRoute")).WebsitePreviewRoute }),
}]
