import { beforeEach, describe, expect, it } from "vitest"
import { seedRoles } from "../data/roles"
import { useRolesStore } from "./roles-store"

function resetStore() {
  useRolesStore.setState({ roles: [...seedRoles] })
}

const validInput = { name: "Support Lead", description: "Handles support tickets and user escalations.", permissions: ["get/User"] }

describe("roles-store", () => {
  beforeEach(() => {
    resetStore()
  })

  describe("addRole", () => {
    it("adds a new role to the front of the list", () => {
      const result = useRolesStore.getState().addRole(validInput)
      expect(result.error).toBeUndefined()
      expect(result.role?.name).toBe("Support Lead")
      expect(result.role?.permissions).toEqual(["get/User"])
      expect(useRolesStore.getState().roles[0].id).toBe(result.role!.id)
      expect(useRolesStore.getState().roles).toHaveLength(seedRoles.length + 1)
    })

    it("trims whitespace from the name", () => {
      const result = useRolesStore.getState().addRole({ ...validInput, name: "  Support Lead  " })
      expect(result.role?.name).toBe("Support Lead")
    })

    it("rejects an empty name", () => {
      expect(useRolesStore.getState().addRole({ ...validInput, name: "" }).error).toBe("Enter a role name.")
    })

    it("rejects an empty description", () => {
      expect(useRolesStore.getState().addRole({ ...validInput, description: "" }).error).toBe("Enter a description.")
    })

    it("rejects zero permissions", () => {
      expect(useRolesStore.getState().addRole({ ...validInput, permissions: [] }).error).toMatch(/at least one permission/)
    })

    it("rejects a duplicate role name case-insensitively", () => {
      const result = useRolesStore.getState().addRole({ ...validInput, name: "super admin" })
      expect(result.error).toMatch(/already exists/)
      expect(useRolesStore.getState().roles).toHaveLength(seedRoles.length)
    })
  })

  describe("updateRole", () => {
    it("updates an existing role's fields and stamps updatedAt", () => {
      const target = seedRoles[0]
      const before = target.updatedAt
      const result = useRolesStore.getState().updateRole(target.id, { ...validInput, name: "Renamed Role" })
      expect(result.error).toBeUndefined()
      expect(result.role?.name).toBe("Renamed Role")
      expect(result.role?.updatedAt).not.toBe(before)
    })

    it("allows saving the role's own unchanged name", () => {
      const target = seedRoles[0]
      const result = useRolesStore.getState().updateRole(target.id, { name: target.name, description: target.description, permissions: target.permissions })
      expect(result.error).toBeUndefined()
    })

    it("rejects renaming to another role's name", () => {
      const [first, second] = seedRoles
      const result = useRolesStore.getState().updateRole(second.id, { name: first.name, description: second.description, permissions: second.permissions })
      expect(result.error).toMatch(/already exists/)
    })

    it("errors when the role id no longer exists", () => {
      const result = useRolesStore.getState().updateRole("missing-id", validInput)
      expect(result.error).toBe("This role no longer exists.")
    })
  })

  describe("removeRole", () => {
    it("removes a role from the list", () => {
      const target = seedRoles[0]
      useRolesStore.getState().removeRole(target.id)
      expect(useRolesStore.getState().roles.some((role) => role.id === target.id)).toBe(false)
      expect(useRolesStore.getState().roles).toHaveLength(seedRoles.length - 1)
    })

    it("is a no-op for an unknown id", () => {
      useRolesStore.getState().removeRole("missing-id")
      expect(useRolesStore.getState().roles).toHaveLength(seedRoles.length)
    })
  })
})
