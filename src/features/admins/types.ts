export type AdminRole = Pick<Role, "id" | "name" | "isSystem">

export type Admin = {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  roles: AdminRole[]
  permissions: Permission[]
  updatedAt: string
}

export function adminDisplayName(admin: Pick<Admin, "firstName" | "lastName" | "email">) {
  return `${admin.firstName} ${admin.lastName}`.trim() || admin.email
}

export type Permission = {
  id: string
  key: string
  description: string
}

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: Permission[]
  updatedAt: string
}
