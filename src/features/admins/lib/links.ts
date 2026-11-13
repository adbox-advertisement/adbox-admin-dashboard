import { APP_ROUTES } from "@/routes/paths"

export const adminPath = (id: string) => `${APP_ROUTES.manageAdminsList}/${encodeURIComponent(id)}`
export const rolePath = (id: string) => `${APP_ROUTES.manageAdminsRoles}/${encodeURIComponent(id)}`
