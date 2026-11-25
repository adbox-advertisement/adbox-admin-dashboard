import axios from "axios"
import type { z } from "zod"
import { appPostSchema, imagePresignSchema, partUrlsSchema, videoUploadSchema, type PostType, type PostVisibility, type StudioSession } from "./types"

// The app's own posting API (backend api-gateway resource/post.controller.ts), called as a studio
// account with the short session super-admin opened for it. Everything the phone's composer does
// happens here the same way: create, upload, publish.

/** The gateway answers `{ success, statusCode, message, data }`; the payload is `data`. */
function unwrap(body: unknown) {
  if (body && typeof body === "object" && "success" in body && "data" in body) return (body as { data: unknown }).data
  return body
}

export type UploadedPart = { PartNumber: number; ETag: string }

export function createAppClient(session: Pick<StudioSession, "apiBaseUrl" | "accessToken">) {
  const http = axios.create({
    baseURL: session.apiBaseUrl,
    timeout: 30_000,
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
  })
  const call = async <T extends z.ZodType>(schema: T, request: Promise<{ data: unknown }>) => schema.parse(unwrap((await request).data)) as z.infer<T>

  return {
    /** IMAGE and VIDEO posts are born DRAFT and get their media before publish. */
    createPost: (body: { clientPostId: string; type: PostType; caption?: string; visibility: PostVisibility }) =>
      call(appPostSchema, http.post("/resources", body)),
    presignImages: (postId: string, files: Array<{ fileName: string; contentType: string; size: number; width: number; height: number; position: number }>) =>
      call(imagePresignSchema, http.post(`/resources/${postId}/images/presign`, { files })),
    confirmImages: (postId: string, items: Array<{ s3Key: string; position: number }>) =>
      call(appPostSchema, http.post(`/resources/${postId}/images/confirm`, { items })),
    initiateVideo: (postId: string, body: { fileName: string; contentType: string; size: number; duration: number; width: number; height: number }) =>
      call(videoUploadSchema, http.post(`/resources/${postId}/video/initiate`, body)),
    /** At most 10 part numbers a request. */
    partUrls: (uploadId: string, partNumbers: number[]) =>
      call(partUrlsSchema, http.post("/upload-video/multipart/part-urls", { uploadId, partNumbers })),
    completeVideo: (postId: string, uploadId: string, parts: UploadedPart[]) =>
      call(appPostSchema, http.post(`/resources/${postId}/video/complete`, { uploadId, parts })),
    /** A video then waits in PROCESSING until its transcode is done. */
    publish: (postId: string) => call(appPostSchema, http.post(`/resources/${postId}/publish`)),
    getPost: (postId: string) => call(appPostSchema, http.get(`/resources/${postId}`)),
  }
}

export type AppClient = ReturnType<typeof createAppClient>
