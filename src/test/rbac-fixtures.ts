export const permissionFixtures = [
  { id: "10000000-0000-4000-8000-000000000001", key: "*", description: null },
  { id: "10000000-0000-4000-8000-000000000002", key: "admins.read", description: "View admins" },
  { id: "10000000-0000-4000-8000-000000000003", key: "roles.read", description: "View roles" },
]

export const roleFixtures = [
  { id: "20000000-0000-4000-8000-000000000001", name: "SUPER_ADMIN", description: null, isSystem: true, updatedAt: "2026-09-14T12:00:00.000Z", permissions: [{ permission: permissionFixtures[0] }] },
  { id: "20000000-0000-4000-8000-000000000002", name: "AUDITOR", description: "Read-only access", isSystem: false, updatedAt: "2026-09-14T12:00:00.000Z", permissions: [{ permission: permissionFixtures[1] }] },
]
export const profileFixture = { id: "30000000-0000-4000-8000-000000000001", email: "admin@example.com", roles: ["SUPER_ADMIN"], permissions: ["*"] }

export const adminFixtures: Array<{
  id: string; email: string; firstName: string | null; lastName: string | null
  isActive: boolean; updatedAt: string
  roles: Array<{ role: typeof roleFixtures[number] }>
  permissions: Array<{ permission: typeof permissionFixtures[number] }>
}> = [
  { id: "30000000-0000-4000-8000-000000000001", email: "admin@example.com", firstName: "Adison", lastName: "Cole", isActive: true, updatedAt: "2026-09-14T12:00:00.000Z", roles: [{ role: roleFixtures[0] }], permissions: [] },
  { id: "30000000-0000-4000-8000-000000000002", email: "kaiya@example.com", firstName: "Kaiya", lastName: "Reyes", isActive: true, updatedAt: "2026-09-14T12:00:00.000Z", roles: [{ role: roleFixtures[1] }], permissions: [{ permission: permissionFixtures[2] }] },
  { id: "30000000-0000-4000-8000-000000000003", email: "legacy@example.com", firstName: null, lastName: null, isActive: false, updatedAt: "2026-09-14T12:00:00.000Z", roles: [], permissions: [] },
]
