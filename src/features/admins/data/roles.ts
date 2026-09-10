import type { Role } from "../types"

export const seedRoles: Role[] = [
  {
    id: "role-super-admin",
    name: "Super Admin",
    description: "Full access to every workspace, including billing, roles, and system settings.",
    permissions: ["get/User", "get/PushWallet", "create/Users", "suspend/Users", "createGenerals", "assign/Roles", "create/Profession", "getAll/Profession", "getAll/Users", "editUser/Users"],
    updatedAt: "2026-10-24T23:46:00.000Z",
  },
  {
    id: "role-administrator",
    name: "Administrator",
    description: "Manage users and content across the platform, without access to billing or role management.",
    permissions: ["get/User", "create/Users", "suspend/Users", "createGenerals", "create/Profession", "getAll/Profession", "getAll/Users", "editUser/Users"],
    updatedAt: "2026-10-24T23:46:00.000Z",
  },
  {
    id: "role-accountant",
    name: "Accountant",
    description: "Handle payouts and wallet operations across the platform.",
    permissions: ["get/User", "get/PushWallet", "getAll/Users"],
    updatedAt: "2026-10-24T23:46:00.000Z",
  },
  {
    id: "role-auditor",
    name: "Auditor",
    description: "Read-only access for reviewing users, professions, and platform activity.",
    permissions: ["get/User", "getAll/Profession", "getAll/Users"],
    updatedAt: "2026-10-24T23:46:00.000Z",
  },
]
