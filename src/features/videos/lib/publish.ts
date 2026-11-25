import type { AppClient, UploadedPart } from "../app-client"
import type { AppPost, PostType, PostVisibility } from "../types"
import type { PreparedImage, PreparedVideo } from "./media"
import { StorageRefusedError, inBatches, putWithProgress, withRetries } from "./upload"

// Posting as a studio account, step for step as the phone's composer does (backend api-gateway
// post.controller.ts): create the post, upload its media straight to storage, finish the upload,
// then publish. A video then waits in PROCESSING until its transcode is done.

export type PostDraft = {
  type: PostType
  caption: string
  visibility: PostVisibility
  images: PreparedImage[]
  video: PreparedVideo | null
}

export type PublishStage = "creating" | "uploading" | "finishing" | "publishing"
export type PublishProgress = { stage: PublishStage; sent: number; total: number }

type Put = typeof putWithProgress

const PART_URLS_PER_REQUEST = 10

export async function publishPost(client: AppClient, draft: PostDraft, onProgress: (progress: PublishProgress) => void, put: Put = putWithProgress): Promise<AppPost> {
  const total = draft.type === "IMAGE" ? draft.images.reduce((sum, image) => sum + image.file.size, 0) : draft.type === "VIDEO" ? (draft.video?.file.size ?? 0) : 0
  let sentBefore = 0
  const report = (stage: PublishStage, sent = sentBefore) => onProgress({ stage, sent: Math.min(sent, total), total })

  report("creating")
  const post = await client.createPost({
    // The app treats it as the post's id, so a retried create can't make a second post.
    clientPostId: crypto.randomUUID(),
    type: draft.type,
    caption: draft.caption.trim() || undefined,
    visibility: draft.visibility,
  })
  if (draft.type === "TEXT") return post

  if (draft.type === "IMAGE") {
    const presigned = await client.presignImages(post.id, draft.images.map((image, position) => ({
      fileName: image.file.name,
      contentType: image.file.type,
      size: image.file.size,
      width: image.width,
      height: image.height,
      position,
    })))
    const sentPer = new Array<number>(draft.images.length).fill(0)
    report("uploading", 0)
    await inBatches(presigned.files.map((file) => () => withRetries(() => put(file.uploadUrl, draft.images[file.position].file, {
      headers: { "Content-Type": draft.images[file.position].file.type },
      onProgress: (sent) => {
        sentPer[file.position] = sent
        report("uploading", sentPer.reduce((sum, value) => sum + value, 0))
      },
    }))), 3)
    sentBefore = total
    report("finishing")
    await client.confirmImages(post.id, presigned.files.map((file) => ({ s3Key: file.s3Key, position: file.position })))
  } else {
    const video = draft.video
    if (!video) throw new Error("Choose a video first.")
    const session = await client.initiateVideo(post.id, {
      fileName: video.file.name,
      contentType: video.file.type,
      size: video.file.size,
      duration: Math.max(1, Math.round(video.duration)),
      width: video.width,
      height: video.height,
    })
    const partNumbers = Array.from({ length: session.totalParts }, (_, index) => index + 1)
    const sentPer = new Map<number, number>()
    const parts: UploadedPart[] = []
    report("uploading", 0)
    for (let start = 0; start < partNumbers.length; start += PART_URLS_PER_REQUEST) {
      const { urls } = await client.partUrls(session.uploadId, partNumbers.slice(start, start + PART_URLS_PER_REQUEST))
      const uploaded = await inBatches(urls.map(({ partNumber, url }) => async () => {
        const from = (partNumber - 1) * session.chunkSize
        const chunk = video.file.slice(from, Math.min(from + session.chunkSize, video.file.size))
        const { etag } = await withRetries(() => put(url, chunk, {
          onProgress: (sent) => {
            sentPer.set(partNumber, sent)
            report("uploading", [...sentPer.values()].reduce((sum, value) => sum + value, 0))
          },
        }))
        if (!etag) throw new StorageRefusedError("Storage didn't share the uploaded part's ETag. Its CORS settings must expose ETag.")
        return { PartNumber: partNumber, ETag: etag }
      }), session.maxConcurrentParts)
      parts.push(...uploaded)
    }
    sentBefore = total
    report("finishing")
    await client.completeVideo(post.id, session.uploadId, parts)
  }

  report("publishing")
  return client.publish(post.id)
}
