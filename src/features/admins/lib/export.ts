import type { Admin, Role } from "../types"

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function download(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function adminsToCsv(admins: Admin[]) {
  const header = ["First name", "Last name", "Role", "Email", "Telephone", "Last updated"]
  const rows = admins.map((admin) => [admin.firstName, admin.lastName, admin.role, admin.email, admin.telephone, admin.updatedAt])
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")
}

export function downloadAdminsCsv(admins: Admin[]) {
  download(adminsToCsv(admins), `adbox-admins-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function rolesToCsv(roles: Role[]) {
  const header = ["Role", "Description", "Permissions", "Last updated"]
  const rows = roles.map((role) => [role.name, role.description, role.permissions.join(", "), role.updatedAt])
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")
}

export function downloadRolesCsv(roles: Role[]) {
  download(rolesToCsv(roles), `adbox-roles-${new Date().toISOString().slice(0, 10)}.csv`)
}
