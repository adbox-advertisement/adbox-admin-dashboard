import { describe, expect, it } from "vitest"
import { roleInputSchema } from "./validation"

describe("roleInputSchema", () => {
  it.each(["", "A", "Support Lead", "content_manager", "1AUDITOR", "A".repeat(65)])("rejects names the backend will reject: %s", (name) => {
    expect(roleInputSchema.safeParse({ name, description: "" }).success).toBe(false)
  })
  it("accepts optional descriptions and the backend's name and description limits", () => {
    expect(roleInputSchema.parse({ name: " CONTENT_MANAGER ", description: "" })).toEqual({ name: "CONTENT_MANAGER", description: "" })
    expect(roleInputSchema.safeParse({ name: "A".repeat(64), description: "a".repeat(255) }).success).toBe(true)
    expect(roleInputSchema.safeParse({ name: "AUDITOR", description: "a".repeat(256) }).success).toBe(false)
  })
})
