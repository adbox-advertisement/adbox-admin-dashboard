export const permissionCatalog = [
  "get/User",
  "get/PushWallet",
  "create/Users",
  "suspend/Users",
  "createGenerals",
  "assign/Roles",
  "create/Profession",
  "getAll/Profession",
  "getAll/Users",
  "editUser/Users",
] as const
export type Permission = (typeof permissionCatalog)[number]
