import { Film, Images, Type } from "lucide-react"
import type { UserPost } from "../types"

export const mediaIcons = { VIDEO: Film, IMAGE: Images, TEXT: Type } as const

export function postCover(post: UserPost) {
  const video = post.videoResource
  return post.mediaType === "VIDEO"
    ? video?.thumbnail?.previewImageUrl ?? video?.thumbnail?.imageUrl ?? null
    : post.imgResources[0]?.previewImageUrl ?? post.imgResources[0]?.imageUrl ?? null
}
