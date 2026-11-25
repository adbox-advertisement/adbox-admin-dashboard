import { describe, expect, it, vi } from "vitest"
import type { AppClient } from "../app-client"
import type { AppPost } from "../types"
import type { PreparedImage, PreparedVideo } from "./media"
import { publishPost, type PostDraft, type PublishProgress } from "./publish"
import { StorageRefusedError, inBatches, withRetries, type putWithProgress } from "./upload"

const post = (changes: Partial<AppPost> = {}): AppPost => ({ id: "post-1", type: "TEXT", caption: null, visibility: "DRAFT", media: [], ...changes })

function fakeClient() {
  return {
    createPost: vi.fn(async () => post()),
    presignImages: vi.fn(async (_id: string, files: Array<{ position: number }>) => ({ files: files.map(({ position }) => ({ uploadUrl: `https://s3/put-${position}`, s3Key: `key-${position}`, position })) })),
    confirmImages: vi.fn(async () => post()),
    initiateVideo: vi.fn(async () => ({ uploadId: "upload-1", s3Key: "video-key", chunkSize: 4, totalParts: 3, maxConcurrentParts: 2 })),
    partUrls: vi.fn(async (_uploadId: string, partNumbers: number[]) => ({ urls: partNumbers.map((partNumber) => ({ partNumber, url: `https://s3/part-${partNumber}` })) })),
    completeVideo: vi.fn(async () => post()),
    publish: vi.fn(async () => post({ visibility: "PROCESSING" })),
    getPost: vi.fn(async () => post()),
  } satisfies AppClient
}

const image = (name: string, bytes: number): PreparedImage => ({ id: name, file: new File(["x".repeat(bytes)], name, { type: "image/png" }), url: `blob:${name}`, width: 640, height: 480 })
const video: PreparedVideo = { file: new File(["0123456789"], "clip.mp4", { type: "video/mp4" }), url: "blob:clip", width: 1080, height: 1920, duration: 41.6 }
const draft = (changes: Partial<PostDraft>): PostDraft => ({ type: "TEXT", caption: "  Hello #Legon  ", visibility: "PUBLIC", images: [], video: null, ...changes })

describe("posting as a studio account", () => {
  it("posts words in one step", async () => {
    const client = fakeClient()
    await publishPost(client, draft({}), () => {})
    expect(client.createPost).toHaveBeenCalledWith({ clientPostId: expect.any(String), type: "TEXT", caption: "Hello #Legon", visibility: "PUBLIC" })
    expect(client.publish).not.toHaveBeenCalled()
  })

  it("uploads pictures straight to storage in order, confirms them, then publishes", async () => {
    const client = fakeClient()
    const put = vi.fn(async (_url: string, body: Blob, options: { onProgress?: (sent: number) => void } = {}) => {
      options.onProgress?.(body.size)
      return { etag: null }
    })
    const progress: PublishProgress[] = []
    await publishPost(client, draft({ type: "IMAGE", images: [image("a.png", 3), image("b.png", 5)] }), (step) => progress.push(step), put)

    expect(client.presignImages).toHaveBeenCalledWith("post-1", [
      { fileName: "a.png", contentType: "image/png", size: 3, width: 640, height: 480, position: 0 },
      { fileName: "b.png", contentType: "image/png", size: 5, width: 640, height: 480, position: 1 },
    ])
    expect(put).toHaveBeenCalledWith("https://s3/put-1", expect.any(File), expect.objectContaining({ headers: { "Content-Type": "image/png" } }))
    expect(client.confirmImages).toHaveBeenCalledWith("post-1", [{ s3Key: "key-0", position: 0 }, { s3Key: "key-1", position: 1 }])
    expect(client.publish).toHaveBeenCalledWith("post-1")
    expect(progress.map((step) => step.stage)).toEqual(["creating", "uploading", "uploading", "uploading", "finishing", "publishing"])
    expect(progress[progress.length - 1]).toEqual({ stage: "publishing", sent: 8, total: 8 })
  })

  it("uploads a video in parts, keeping each part's ETag, then publishes it to process", async () => {
    const client = fakeClient()
    const put = vi.fn<typeof putWithProgress>(async (url) => ({ etag: `"etag-${url.slice(-1)}"` }))
    const result = await publishPost(client, draft({ type: "VIDEO", video }), () => {}, put)

    expect(client.initiateVideo).toHaveBeenCalledWith("post-1", { fileName: "clip.mp4", contentType: "video/mp4", size: 10, duration: 42, width: 1080, height: 1920 })
    expect(client.partUrls).toHaveBeenCalledWith("upload-1", [1, 2, 3])
    // 10 bytes in parts of 4: 4, 4 and the last 2.
    expect(put.mock.calls.map(([, body]) => body.size)).toEqual([4, 4, 2])
    expect(client.completeVideo).toHaveBeenCalledWith("post-1", "upload-1", [
      { PartNumber: 1, ETag: '"etag-1"' },
      { PartNumber: 2, ETag: '"etag-2"' },
      { PartNumber: 3, ETag: '"etag-3"' },
    ])
    expect(result.visibility).toBe("PROCESSING")
  })

  it("stops when storage hides the ETag, which only its CORS settings can fix", async () => {
    const client = fakeClient()
    await expect(publishPost(client, draft({ type: "VIDEO", video }), () => {}, async () => ({ etag: null }))).rejects.toBeInstanceOf(StorageRefusedError)
    expect(client.completeVideo).not.toHaveBeenCalled()
    expect(client.publish).not.toHaveBeenCalled()
  })
})

describe("uploading", () => {
  it("runs a few at a time and keeps results in order", async () => {
    let running = 0
    let most = 0
    const tasks = [30, 10, 20, 0].map((ms, index) => async () => {
      running += 1
      most = Math.max(most, running)
      await new Promise((done) => setTimeout(done, ms))
      running -= 1
      return index
    })
    expect(await inBatches(tasks, 2)).toEqual([0, 1, 2, 3])
    expect(most).toBe(2)
  })

  it("retries a dropped part, but not a storage refusal", async () => {
    vi.useFakeTimers()
    try {
      const flaky = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValue("ok")
      const retried = withRetries(flaky)
      await vi.runAllTimersAsync()
      expect(await retried).toBe("ok")
      expect(flaky).toHaveBeenCalledTimes(2)

      const refused = vi.fn().mockRejectedValue(new StorageRefusedError())
      await expect(withRetries(refused)).rejects.toBeInstanceOf(StorageRefusedError)
      expect(refused).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
