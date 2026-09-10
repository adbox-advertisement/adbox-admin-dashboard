import { beforeEach, describe, expect, it } from "vitest"
import { seedAdmins } from "../data/admins"
import { useAdminsStore } from "./admins-store"

function resetStore() {
  useAdminsStore.setState({ admins: [...seedAdmins] })
}

const validInput = { firstName: "Jordan", lastName: "Blake", email: "jordan@adbox.com", telephone: "+233 24 000 0099", role: "Auditor" as const, avatar: "" }

describe("admins-store", () => {
  beforeEach(() => {
    resetStore()
  })

  describe("addAdmin", () => {
    it("adds a new admin to the front of the list", () => {
      const result = useAdminsStore.getState().addAdmin(validInput)
      expect(result.error).toBeUndefined()
      expect(result.admin?.firstName).toBe("Jordan")
      expect(result.admin?.lastName).toBe("Blake")
      expect(result.admin?.role).toBe("Auditor")
      expect(useAdminsStore.getState().admins[0].id).toBe(result.admin!.id)
      expect(useAdminsStore.getState().admins).toHaveLength(seedAdmins.length + 1)
    })

    it("trims whitespace from names", () => {
      const result = useAdminsStore.getState().addAdmin({ ...validInput, firstName: "  Jordan  ", lastName: "  Blake  " })
      expect(result.admin?.firstName).toBe("Jordan")
      expect(result.admin?.lastName).toBe("Blake")
    })

    it("rejects an empty first name", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, firstName: "" }).error).toBe("Enter a first name.")
    })

    it("rejects an empty last name", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, lastName: "" }).error).toBe("Enter a last name.")
    })

    it("rejects an invalid email", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, email: "not-an-email" }).error).toMatch(/valid email/)
    })

    it("rejects an empty email", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, email: "" }).error).toMatch(/email address/)
    })

    it("rejects an empty telephone number", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, telephone: "" }).error).toMatch(/telephone number/)
    })

    it("rejects a telephone number with letters", () => {
      expect(useAdminsStore.getState().addAdmin({ ...validInput, telephone: "call-me-maybe" }).error).toMatch(/digits and/)
    })

    it("rejects a duplicate email case-insensitively", () => {
      const result = useAdminsStore.getState().addAdmin({ ...validInput, email: "ADISON@adbox.com" })
      expect(result.error).toMatch(/already exists/)
      expect(useAdminsStore.getState().admins).toHaveLength(seedAdmins.length)
    })
  })

  describe("updateAdmin", () => {
    it("updates an existing admin's fields and stamps updatedAt", () => {
      const target = seedAdmins[0]
      const before = target.updatedAt
      const result = useAdminsStore.getState().updateAdmin(target.id, { ...validInput, firstName: "New", lastName: "Name", email: "new-name@adbox.com" })
      expect(result.error).toBeUndefined()
      expect(result.admin?.firstName).toBe("New")
      expect(result.admin?.lastName).toBe("Name")
      expect(result.admin?.updatedAt).not.toBe(before)
    })

    it("allows saving the admin's own unchanged email", () => {
      const target = seedAdmins[0]
      const result = useAdminsStore.getState().updateAdmin(target.id, { firstName: target.firstName, lastName: target.lastName, email: target.email, telephone: target.telephone, role: target.role, avatar: target.avatar })
      expect(result.error).toBeUndefined()
    })

    it("rejects updating to another admin's email", () => {
      const [first, second] = seedAdmins
      const result = useAdminsStore.getState().updateAdmin(second.id, { firstName: second.firstName, lastName: second.lastName, email: first.email, telephone: second.telephone, role: second.role, avatar: second.avatar })
      expect(result.error).toMatch(/already exists/)
    })

    it("rejects an invalid email on update", () => {
      const target = seedAdmins[0]
      expect(useAdminsStore.getState().updateAdmin(target.id, { firstName: target.firstName, lastName: target.lastName, email: "nope", telephone: target.telephone, role: target.role, avatar: target.avatar }).error).toMatch(/valid email/)
    })

    it("errors when the admin id no longer exists", () => {
      const result = useAdminsStore.getState().updateAdmin("missing-id", validInput)
      expect(result.error).toBe("This admin no longer exists.")
    })
  })

  describe("removeAdmin", () => {
    it("removes an admin from the list", () => {
      const target = seedAdmins[0]
      useAdminsStore.getState().removeAdmin(target.id)
      expect(useAdminsStore.getState().admins.some((admin) => admin.id === target.id)).toBe(false)
      expect(useAdminsStore.getState().admins).toHaveLength(seedAdmins.length - 1)
    })

    it("is a no-op for an unknown id", () => {
      useAdminsStore.getState().removeAdmin("missing-id")
      expect(useAdminsStore.getState().admins).toHaveLength(seedAdmins.length)
    })
  })
})
