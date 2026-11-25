import { describe, expect, it } from "vitest"
import { formatBytes, formatDuration, imageProblem, isShort, videoProblem } from "./media"

const MB = 1024 * 1024

describe("what the app accepts", () => {
  it("takes JPEG, PNG and WebP pictures up to 10 MB and 8192 pixels a side", () => {
    expect(imageProblem({ type: "image/jpeg", size: 2 * MB })).toBeNull()
    expect(imageProblem({ type: "image/gif", size: MB })).toBe("Use a JPEG, PNG or WebP picture.")
    expect(imageProblem({ type: "image/png", size: 11 * MB })).toBe("Pictures can be up to 10 MB.")
    expect(imageProblem({ type: "image/webp", size: MB }, { width: 9000, height: 100 })).toBe("Pictures can be up to 8192 pixels a side.")
  })

  it("takes MP4 and MOV videos up to 1 GB and 10 minutes", () => {
    expect(videoProblem({ type: "video/mp4", size: 200 * MB }, { width: 1080, height: 1920, duration: 59 })).toBeNull()
    expect(videoProblem({ type: "video/webm", size: MB })).toBe("Use an MP4 or MOV video.")
    expect(videoProblem({ type: "video/quicktime", size: 1025 * MB })).toBe("Videos can be up to 1 GB.")
    expect(videoProblem({ type: "video/mp4", size: MB }, { width: 1920, height: 1080, duration: 601 })).toBe("Videos can be up to 10 minutes.")
  })

  it("calls a portrait video up to 90 seconds a Short", () => {
    expect(isShort({ width: 1080, height: 1920, duration: 90 })).toBe(true)
    expect(isShort({ width: 1080, height: 1200, duration: 30 })).toBe(true)
    expect(isShort({ width: 1080, height: 1080, duration: 30 })).toBe(false)
    expect(isShort({ width: 1080, height: 1920, duration: 91 })).toBe(false)
  })

  it("writes lengths and sizes briefly", () => {
    expect(formatDuration(42.4)).toBe("0:42")
    expect(formatDuration(725)).toBe("12:05")
    expect(formatBytes(3.25 * MB)).toBe("3.3 MB")
    expect(formatBytes(1.5 * 1024 * MB)).toBe("1.5 GB")
    expect(formatBytes(200)).toBe("1 KB")
  })
})
