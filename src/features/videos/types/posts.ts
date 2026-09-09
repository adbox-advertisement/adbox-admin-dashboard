import type { UploadSchoolId } from "../data/schools"

export type PostMediaType = "video" | "photo"
export type PostCollection = { id: string; name: string; schoolId: UploadSchoolId; description: string }

export type VideoPost = {
  id: string
  collectionId: string
  title: string
  caption: string
  cover: string
  mediaType: PostMediaType
  createdAt: string
  duration?: string
  videoUrl?: string
}

export type CollectionPostGroup = { collection: PostCollection; posts: VideoPost[] }
