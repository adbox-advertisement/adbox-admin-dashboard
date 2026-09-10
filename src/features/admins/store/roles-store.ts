import { create } from "zustand"
import { z } from "zod"
import { seedRoles } from "../data/roles"
import type { Role } from "../types"

export const roleInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a role name.").max(60, "Use 60 characters or fewer."),
  description: z.string().trim().min(1, "Enter a description.").max(300, "Use 300 characters or fewer."),
  permissions: z.array(z.string()).min(1, "Select at least one permission."),
})

export type RoleInput = z.infer<typeof roleInputSchema>
type MutationResult = { role: Role; error?: never } | { role?: never; error: string }

// Local mock state only: there is no roles API yet. Resets on reload, like
// the admins store.
export const useRolesStore = create<{
  roles: Role[]
  addRole: (input: RoleInput) => MutationResult
  updateRole: (id: string, input: RoleInput) => MutationResult
  removeRole: (id: string) => void
}>((set, get) => ({
  roles: seedRoles,
  addRole: (input) => {
    const parsed = roleInputSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedName = parsed.data.name.toLocaleLowerCase()
    if (get().roles.some((role) => role.name.toLocaleLowerCase() === normalizedName)) {
      return { error: "A role with this name already exists." }
    }
    const role: Role = { id: crypto.randomUUID(), updatedAt: new Date().toISOString(), ...parsed.data }
    set({ roles: [role, ...get().roles] })
    return { role }
  },
  updateRole: (id, input) => {
    const parsed = roleInputSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedName = parsed.data.name.toLocaleLowerCase()
    if (get().roles.some((role) => role.id !== id && role.name.toLocaleLowerCase() === normalizedName)) {
      return { error: "A role with this name already exists." }
    }
    const roles = get().roles.map((role) => role.id === id ? { ...role, ...parsed.data, updatedAt: new Date().toISOString() } : role)
    const role = roles.find((entry) => entry.id === id)
    if (!role) return { error: "This role no longer exists." }
    set({ roles })
    return { role }
  },
  removeRole: (id) => set({ roles: get().roles.filter((role) => role.id !== id) }),
}))
