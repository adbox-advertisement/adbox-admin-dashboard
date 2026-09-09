import type { UploadSchoolId } from "../data/schools"

export type MediaKind = "videos" | "photos"
export type MediaSelectionCounts = Record<MediaKind, number>
export type UploadDestination = { schoolId: UploadSchoolId; folderId: string }
export type SelectedMediaFile = UploadDestination & { id: string; file: File; url: string }
