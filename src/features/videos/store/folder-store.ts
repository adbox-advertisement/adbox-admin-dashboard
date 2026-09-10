import { create } from "zustand"
import { z } from "zod"

import { uploadSchools, type UploadSchoolId } from "../data/schools"

const STORAGE_KEY = "adbox-upload-folders-v1"
const SELECTION_KEY = "adbox-upload-folder-selection-v1"
const schoolIdSchema = z.enum(uploadSchools.map(({ id }) => id))

const folderNameSchema = z.string()
  .trim()
  .min(1, "Enter a folder name.")
  .max(60, "Use 60 characters or fewer.")
  .refine((name) => !/[\\/]/.test(name), "Use a name without / or \\.")

const folderSchema = z.object({
  id: z.uuid(),
  schoolId: schoolIdSchema,
  name: folderNameSchema,
})

export type UploadFolder = z.infer<typeof folderSchema>
type CreateFolderResult = { folder: UploadFolder; error?: never } | { folder?: never; error: string }
type FolderSelection = Partial<Record<UploadSchoolId, string>>

function readSelection(): FolderSelection {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SELECTION_KEY) ?? "{}")
    const result = z.partialRecord(schoolIdSchema, z.union([z.literal("general"), z.uuid()])).safeParse(value)
    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

function readFolders(): UploadFolder[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    const result = z.array(folderSchema).safeParse(value)
    return result.success ? result.data : []
  } catch {
    return []
  }
}

// Browser-only draft organization. No API responses or uploaded media are kept in this store.
export const useUploadFolderStore = create<{
  folders: UploadFolder[]
  selectedBySchool: FolderSelection
  selectionError: string
  selectFolder: (schoolId: UploadSchoolId, id: string) => void
  createFolder: (schoolId: UploadSchoolId, name: string) => CreateFolderResult
  renameFolder: (schoolId: UploadSchoolId, id: string, name: string) => CreateFolderResult
}>((set, get) => ({
  folders: readFolders(),
  selectedBySchool: readSelection(),
  selectionError: "",
  selectFolder: (schoolId, id) => {
    if (id !== "general" && !get().folders.some((folder) => folder.schoolId === schoolId && folder.id === id)) return
    const selectedBySchool = { ...get().selectedBySchool, [schoolId]: id }
    let selectionError = ""
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedBySchool))
    } catch {
      selectionError = "Your folder is selected, but this browser couldn't remember it for your next visit."
    }
    set({ selectedBySchool, selectionError })
  },
  createFolder: (schoolId, name) => {
    const parsed = folderNameSchema.safeParse(name)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedName = parsed.data.toLocaleLowerCase()
    if (normalizedName === "general" || get().folders.some((folder) => folder.schoolId === schoolId && folder.name.toLocaleLowerCase() === normalizedName)) {
      return { error: "A folder with this name already exists in this school." }
    }
    const folder: UploadFolder = { id: crypto.randomUUID(), schoolId, name: parsed.data }
    const folders = [...get().folders, folder]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    } catch {
      return { error: "This browser couldn't save the folder. Check that browser storage is available and try again." }
    }
    set({ folders })
    return { folder }
  },
  renameFolder: (schoolId, id, name) => {
    const parsed = folderNameSchema.safeParse(name)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const normalizedName = parsed.data.toLocaleLowerCase()
    if (normalizedName === "general" || get().folders.some((folder) => folder.schoolId === schoolId && folder.id !== id && folder.name.toLocaleLowerCase() === normalizedName)) {
      return { error: "A folder with this name already exists in this school." }
    }
    const folders = get().folders.map((folder) => folder.id === id ? { ...folder, name: parsed.data } : folder)
    const folder = folders.find((entry) => entry.id === id)
    if (!folder) return { error: "This folder no longer exists." }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    } catch {
      return { error: "This browser couldn't save the folder. Check that browser storage is available and try again." }
    }
    set({ folders })
    return { folder }
  },
}))
