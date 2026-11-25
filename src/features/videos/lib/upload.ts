// Uploads straight from the browser to storage, as the phone does. Storage must allow the
// dashboard's address (CORS: PUT, exposing ETag), or the browser stops the upload.

export class StorageRefusedError extends Error {
  constructor(message = "Storage refused the upload from this address. Its CORS settings must allow PUT from the dashboard and expose ETag.") {
    super(message)
    this.name = "StorageRefusedError"
  }
}

/**
 * PUTs a file or a slice of one to a presigned URL, reporting the bytes sent. Resolves with the
 * stored object's ETag (null when storage doesn't expose it).
 */
export function putWithProgress(url: string, body: Blob, options: { headers?: Record<string, string>; onProgress?: (sent: number) => void; signal?: AbortSignal } = {}) {
  return new Promise<{ etag: string | null }>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("PUT", url)
    for (const [name, value] of Object.entries(options.headers ?? {})) request.setRequestHeader(name, value)
    request.upload.onprogress = (event) => options.onProgress?.(event.loaded)
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        options.onProgress?.(body.size)
        resolve({ etag: request.getResponseHeader("ETag") })
      } else reject(new Error(`Storage answered ${request.status}`))
    }
    // A CORS refusal surfaces as a network error with no status.
    request.onerror = () => reject(new StorageRefusedError())
    request.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"))
    options.signal?.addEventListener("abort", () => request.abort(), { once: true })
    request.send(body)
  })
}

/** Retries a step a few times with a growing pause: a dropped connection mid-upload shouldn't lose the post. */
export async function withRetries<T>(step: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await step()
    } catch (error) {
      lastError = error
      if (error instanceof StorageRefusedError || (error instanceof DOMException && error.name === "AbortError")) throw error
      await new Promise((done) => setTimeout(done, 400 * 2 ** attempt))
    }
  }
  throw lastError
}

/** Runs tasks with at most `limit` at a time, in order of start. */
export async function inBatches<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  const worker = async () => {
    while (next < tasks.length) {
      const index = next
      next += 1
      results[index] = await tasks[index]()
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, worker))
  return results
}

/** Lowercase hex SHA-256 of a file, as the media library asks for. */
export async function sha256Hex(file: Blob) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}
