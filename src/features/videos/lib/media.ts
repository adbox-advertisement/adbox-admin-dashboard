// What the app accepts (backend api-gateway post-images.dto.ts, post-video.dto.ts, feed-query.dto.ts).

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const VIDEO_TYPES = ["video/mp4", "video/quicktime"] as const
export const MAX_IMAGES = 10
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 1024 * 1024 * 1024
export const MAX_VIDEO_SECONDS = 600
export const MAX_DIMENSION = 8192
/** A Short is any video posted in portrait (width/height at most 0.9) and no longer than 90 seconds. */
export const SHORT_MAX_ASPECT = 0.9
export const SHORT_MAX_SECONDS = 90

export type PreparedImage = { id: string; file: File; url: string; width: number; height: number }
export type PreparedVideo = { file: File; url: string; width: number; height: number; duration: number }

const megabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`

/** Why the app would refuse this picture, or null. */
export function imageProblem(file: Pick<File, "type" | "size">, size?: { width: number; height: number }) {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "Use a JPEG, PNG or WebP picture."
  if (file.size > MAX_IMAGE_BYTES) return `Pictures can be up to ${megabytes(MAX_IMAGE_BYTES)}.`
  if (size && (size.width > MAX_DIMENSION || size.height > MAX_DIMENSION)) return `Pictures can be up to ${MAX_DIMENSION} pixels a side.`
  return null
}

/** Why the app would refuse this video, or null. */
export function videoProblem(file: Pick<File, "type" | "size">, meta?: { width: number; height: number; duration: number }) {
  if (!(VIDEO_TYPES as readonly string[]).includes(file.type)) return "Use an MP4 or MOV video."
  if (file.size > MAX_VIDEO_BYTES) return "Videos can be up to 1 GB."
  if (meta && meta.duration > MAX_VIDEO_SECONDS) return "Videos can be up to 10 minutes."
  if (meta && (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION)) return `Videos can be up to ${MAX_DIMENSION} pixels a side.`
  return null
}

export const isShort = (video: { width: number; height: number; duration: number }) =>
  video.height > 0 && video.width / video.height <= SHORT_MAX_ASPECT && video.duration > 0 && video.duration <= SHORT_MAX_SECONDS

/** "0:42", "12:05". */
export function formatDuration(seconds: number) {
  const whole = Math.max(0, Math.round(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/** A picture's size in pixels, read in the browser. */
export async function readImageSize(file: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
      image.onerror = () => reject(new Error("That picture couldn't be read."))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** A video's size and length, read from its metadata in the browser. */
export function readVideoMeta(url: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration })
    video.onerror = () => reject(new Error("That video couldn't be read. Try an MP4 or MOV file."))
    video.src = url
  })
}

/** Reads a picture for posting, or throws why the app would refuse it. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const early = imageProblem(file)
  if (early) throw new Error(early)
  const size = await readImageSize(file)
  const late = imageProblem(file, size)
  if (late) throw new Error(late)
  return { id: crypto.randomUUID(), file, url: URL.createObjectURL(file), ...size }
}

/** Reads a video for posting, or throws why the app would refuse it. */
export async function prepareVideo(file: File): Promise<PreparedVideo> {
  const early = videoProblem(file)
  if (early) throw new Error(early)
  const url = URL.createObjectURL(file)
  try {
    const meta = await readVideoMeta(url)
    const late = videoProblem(file, meta)
    if (late) throw new Error(late)
    return { file, url, ...meta }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

/** "4.2 MB", "1.1 GB". */
export function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
