import { z } from "zod"

export const roleInputSchema = z.object({
  name: z.string().trim().regex(/^[A-Z][A-Z0-9_]{1,63}$/, "Use 2–64 uppercase letters, numbers or underscores, starting with a letter."),
  description: z.string().trim().max(255, "Use 255 characters or fewer."),
})

export type RoleInput = z.infer<typeof roleInputSchema>

export const permissionSchema = z.object({
  id: z.uuidv4(),
  key: z.string().min(1),
  description: z.string().nullable().transform((value) => value ?? ""),
})

export const roleRecordSchema = z.object({
  id: z.uuidv4(),
  name: z.string().min(1),
  description: z.string().nullable().transform((value) => value ?? ""),
  isSystem: z.boolean(),
  updatedAt: z.iso.datetime(),
})

export const roleSchema = roleRecordSchema.extend({
  permissions: z.array(z.object({ permission: permissionSchema })).transform((assignments) => assignments.map(({ permission }) => permission)),
})

export const permissionIdsSchema = z.array(z.uuidv4()).refine((ids) => new Set(ids).size === ids.length, "Select each permission only once.")

export const roleIdsSchema = z.array(z.uuidv4()).refine((ids) => new Set(ids).size === ids.length, "Select each role only once.")

const adminNameSchema = z.string().trim().max(100, "Use 100 characters or fewer.")

export const createAdminSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(5, "Password must be at least 5 characters.").max(128, "Password must be 128 characters or fewer."),
  firstName: adminNameSchema.optional(),
  lastName: adminNameSchema.optional(),
  roleIds: roleIdsSchema.optional(),
})

export const updateAdminSchema = z.object({
  firstName: adminNameSchema.optional(),
  lastName: adminNameSchema.optional(),
  isActive: z.boolean().optional(),
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>

export const adminSchema = z.object({
  id: z.uuidv4(),
  email: z.email(),
  firstName: z.string().nullable().transform((name) => name ?? ""),
  lastName: z.string().nullable().transform((name) => name ?? ""),
  isActive: z.boolean(),
  roles: z.array(z.object({ role: roleRecordSchema.pick({ id: true, name: true, isSystem: true }) })).transform((assignments) => assignments.map(({ role }) => role)),
  permissions: z.array(z.object({ permission: permissionSchema })).transform((assignments) => assignments.map(({ permission }) => permission)),
  updatedAt: z.iso.datetime(),
})
