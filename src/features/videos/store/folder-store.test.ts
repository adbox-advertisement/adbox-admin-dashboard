import { beforeEach, describe, expect, it, vi } from "vitest"
import { useUploadFolderStore } from "./folder-store"

const SCHOOL = "ug"
const OTHER_SCHOOL = "knust"

function resetStore() {
  window.localStorage.clear()
  useUploadFolderStore.setState({ folders: [], selectedBySchool: {}, selectionError: "" })
}

describe("folder-store", () => {
  beforeEach(() => {
    resetStore()
  })

  describe("createFolder", () => {
    it("creates a folder and persists it to localStorage", () => {
      const result = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      expect(result.error).toBeUndefined()
      expect(result.folder?.name).toBe("Orientation week")
      expect(result.folder?.schoolId).toBe(SCHOOL)
      expect(useUploadFolderStore.getState().folders).toHaveLength(1)

      const persisted = JSON.parse(window.localStorage.getItem("adbox-upload-folders-v1") ?? "[]")
      expect(persisted).toHaveLength(1)
      expect(persisted[0].name).toBe("Orientation week")
    })

    it("trims whitespace from the name", () => {
      const result = useUploadFolderStore.getState().createFolder(SCHOOL, "  Freshers Week  ")
      expect(result.folder?.name).toBe("Freshers Week")
    })

    it("rejects an empty or whitespace-only name", () => {
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "").error).toBe("Enter a folder name.")
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "   ").error).toBe("Enter a folder name.")
    })

    it("rejects a name longer than 60 characters", () => {
      const result = useUploadFolderStore.getState().createFolder(SCHOOL, "a".repeat(61))
      expect(result.error).toBe("Use 60 characters or fewer.")
    })

    it("rejects a name containing / or \\", () => {
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "a/b").error).toBe("Use a name without / or \\.")
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "a\\b").error).toBe("Use a name without / or \\.")
    })

    it("rejects the reserved name 'General' case-insensitively", () => {
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "general").error).toMatch(/already exists/)
      expect(useUploadFolderStore.getState().createFolder(SCHOOL, "GENERAL").error).toMatch(/already exists/)
    })

    it("rejects a duplicate name within the same school, case-insensitively", () => {
      useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const result = useUploadFolderStore.getState().createFolder(SCHOOL, "orientation WEEK")
      expect(result.error).toMatch(/already exists/)
      expect(useUploadFolderStore.getState().folders).toHaveLength(1)
    })

    it("allows the same name across different schools", () => {
      useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const result = useUploadFolderStore.getState().createFolder(OTHER_SCHOOL, "Orientation week")
      expect(result.error).toBeUndefined()
      expect(useUploadFolderStore.getState().folders).toHaveLength(2)
    })

    it("surfaces a storage error without crashing when localStorage.setItem throws", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota exceeded")
      })
      const result = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      expect(result.error).toMatch(/couldn't save the folder/)
      spy.mockRestore()
    })
  })

  describe("renameFolder", () => {
    it("renames an existing folder", () => {
      const created = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const id = created.folder!.id
      const result = useUploadFolderStore.getState().renameFolder(SCHOOL, id, "Freshers Week")
      expect(result.error).toBeUndefined()
      expect(result.folder?.name).toBe("Freshers Week")
      expect(useUploadFolderStore.getState().folders[0].name).toBe("Freshers Week")
    })

    it("allows saving the folder's own unchanged name", () => {
      const created = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const result = useUploadFolderStore.getState().renameFolder(SCHOOL, created.folder!.id, "Orientation week")
      expect(result.error).toBeUndefined()
    })

    it("rejects renaming to another folder's name in the same school", () => {
      useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const second = useUploadFolderStore.getState().createFolder(SCHOOL, "Graduation")
      const result = useUploadFolderStore.getState().renameFolder(SCHOOL, second.folder!.id, "orientation week")
      expect(result.error).toMatch(/already exists/)
      expect(useUploadFolderStore.getState().folders.find((f) => f.id === second.folder!.id)?.name).toBe("Graduation")
    })

    it("rejects renaming to the reserved name 'General'", () => {
      const created = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      const result = useUploadFolderStore.getState().renameFolder(SCHOOL, created.folder!.id, "General")
      expect(result.error).toMatch(/already exists/)
    })

    it("errors when renaming a folder id that no longer exists", () => {
      const result = useUploadFolderStore.getState().renameFolder(SCHOOL, "missing-id", "New name")
      expect(result.error).toBe("This folder no longer exists.")
    })
  })

  describe("selectFolder", () => {
    it("always allows selecting 'general'", () => {
      useUploadFolderStore.getState().selectFolder(SCHOOL, "general")
      expect(useUploadFolderStore.getState().selectedBySchool[SCHOOL]).toBe("general")
    })

    it("allows selecting a folder that belongs to the school", () => {
      const created = useUploadFolderStore.getState().createFolder(SCHOOL, "Orientation week")
      useUploadFolderStore.getState().selectFolder(SCHOOL, created.folder!.id)
      expect(useUploadFolderStore.getState().selectedBySchool[SCHOOL]).toBe(created.folder!.id)
    })

    it("ignores selecting a folder id that does not belong to the school", () => {
      const created = useUploadFolderStore.getState().createFolder(OTHER_SCHOOL, "Orientation week")
      useUploadFolderStore.getState().selectFolder(SCHOOL, created.folder!.id)
      expect(useUploadFolderStore.getState().selectedBySchool[SCHOOL]).toBeUndefined()
    })

    it("ignores an unknown folder id entirely", () => {
      useUploadFolderStore.getState().selectFolder(SCHOOL, "not-a-real-id")
      expect(useUploadFolderStore.getState().selectedBySchool[SCHOOL]).toBeUndefined()
    })

    it("still updates selection in memory when persistence fails, but records the error", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota exceeded")
      })
      useUploadFolderStore.getState().selectFolder(SCHOOL, "general")
      expect(useUploadFolderStore.getState().selectedBySchool[SCHOOL]).toBe("general")
      expect(useUploadFolderStore.getState().selectionError).toMatch(/couldn't remember it/)
      spy.mockRestore()
    })
  })
})
