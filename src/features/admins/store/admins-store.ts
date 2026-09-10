import { create } from "zustand"
import { z } from "zod"
import { seedAdmins } from "../data/admins"
import { adminRoles, type Admin } from "../types"

export const adminInputSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name.").max(60, "Use 60 characters or fewer."),
  lastName: z.string().trim().min(1, "Enter a last name.").max(60, "Use 60 characters or fewer."),
  email: z.string().trim().min(1, "Enter an email address.").email("Enter a valid email address.").max(150, "Use 150 characters or fewer."),
  telephone: z.string().trim().min(1, "Enter a telephone number.").max(30, "Use 30 characters or fewer.").refine((value) => /^[+()\-\s\d]+$/.test(value), "Use digits and + ( ) - only."),
  role: z.enum(adminRoles, { message: "Choose a role." }),
  avatar: z.string().max(5_000_000, "That image is too large."),
})

export type AdminInput = z.infer<typeof adminInputSchema>
type MutationResult = { admin: Admin; error?: never } | { admin?: never; error: string }

// Local mock state only: there is no admins API yet. Resets on reload, like
// the video-upload folder list. Passwords are collected in the form for
// realism but are never sent here or stored anywhere.
export const useAdminsStore = create<{
  admins: Admin[]
  addAdmin: (input: AdminInput) => MutationResult
  updateAdmin: (id: string, input: AdminInput) => MutationResult
  removeAdmin: (id: string) => void
}>((set, get) => ({
  admins: seedAdmins,
  addAdmin: (input) => {
    const parsed = adminInputSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedEmail = parsed.data.email.toLocaleLowerCase()
    if (get().admins.some((admin) => admin.email.toLocaleLowerCase() === normalizedEmail)) {
      return { error: "An admin with this email already exists." }
    }
    const admin: Admin = { id: crypto.randomUUID(), updatedAt: new Date().toISOString(), ...parsed.data }
    set({ admins: [admin, ...get().admins] })
    return { admin }
  },
  updateAdmin: (id, input) => {
    const parsed = adminInputSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedEmail = parsed.data.email.toLocaleLowerCase()
    if (get().admins.some((admin) => admin.id !== id && admin.email.toLocaleLowerCase() === normalizedEmail)) {
      return { error: "An admin with this email already exists." }
    }
    const admins = get().admins.map((admin) => admin.id === id ? { ...admin, ...parsed.data, updatedAt: new Date().toISOString() } : admin)
    const admin = admins.find((entry) => entry.id === id)
    if (!admin) return { error: "This admin no longer exists." }
    set({ admins })
    return { admin }
  },
  removeAdmin: (id) => set({ admins: get().admins.filter((admin) => admin.id !== id) }),
}))
