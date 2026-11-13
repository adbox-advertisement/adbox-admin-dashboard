import { redirect, type RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// Admins, roles and the permission list, each with its own page; the sidebar lists them
// (src/config/navigation.ts). /manage-admins itself opens the admins.
export const adminsRoutes: RouteObject[] = [{
  path: APP_ROUTES.manageAdmins,
  loader: () => redirect(APP_ROUTES.manageAdminsList),
}, {
  path: APP_ROUTES.manageAdminsList,
  handle: { title: "Admins" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/AdminsPage")).AdminsPage }),
}, {
  path: `${APP_ROUTES.manageAdminsList}/:adminId`,
  handle: { title: "Admin" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/AdminDetailPage")).AdminDetailPage }),
}, {
  path: APP_ROUTES.manageAdminsRoles,
  handle: { title: "Roles" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RolesPage")).RolesPage }),
}, {
  path: `${APP_ROUTES.manageAdminsRoles}/:roleId`,
  handle: { title: "Role" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RoleDetailPage")).RoleDetailPage }),
}, {
  path: APP_ROUTES.manageAdminsPermissions,
  handle: { title: "Permissions" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/PermissionsPage")).PermissionsPage }),
}]
