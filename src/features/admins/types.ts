export const adminRoles = ["Super Admin", "Administrator", "Accountant", "Auditor"] as const
export type AdminRole = (typeof adminRoles)[number]

export type Admin = {
  id: string
  firstName: string
  lastName: string
  email: string
  telephone: string
  role: AdminRole
  avatar: string
  updatedAt: string
}

export function adminDisplayName(admin: Pick<Admin, "firstName" | "lastName">) {
  return `${admin.firstName} ${admin.lastName}`.trim()
}

// The role catalog managed on the "Manage Roles and permissions" tab is
// intentionally independent from `adminRoles` above (which drives the fixed
// "Assign Role" choices on the Admin tab). Unifying them — so a role added
// here becomes assignable to an admin — is a reasonable follow-up, but a
// bigger change than this tab's scope: `Admin.role` is a strict union today
// for compile-time safety, and loosening it to an arbitrary role name is a
// deliberate call the rest of the Admin flow wasn't built to make.
export type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  updatedAt: string
}
