import { z } from "zod"

export const currentAdminSchema = z.object({
  id: z.string().min(1),
  email: z.string().trim().email(),
  roles: z.array(z.string().trim().min(1)),
  permissions: z.array(z.string().trim().min(1)).default([]),
})
