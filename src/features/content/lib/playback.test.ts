import { describe, expect, it } from "vitest"
import { canPlayHlsNatively, playbackOrder } from "./playback"

const sources = { hlsUrl: "https://cdn.test/master.m3u8", mp4Url: "https://cdn.test/clip.mp4" }

describe("video playback order", () => {
  it("prefers the adaptive stream where HLS plays natively", () => {
    expect(playbackOrder(sources, true)).toEqual([sources.hlsUrl, sources.mp4Url])
  })

  it("uses the MP4 original in browsers without native HLS", () => {
    expect(playbackOrder(sources, false)).toEqual([sources.mp4Url])
    expect(playbackOrder({ ...sources, mp4Url: null }, false)).toEqual([])
  })

  it("detects native HLS support", () => {
    expect(canPlayHlsNatively({ canPlayType: () => "maybe" })).toBe(true)
    expect(canPlayHlsNatively({ canPlayType: () => "" })).toBe(false)
  })
})
