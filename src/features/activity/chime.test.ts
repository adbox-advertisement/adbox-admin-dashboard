import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

function fakeAudio() {
  const node = () => ({ connect: vi.fn((next: unknown) => next), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: "", gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } })
  const created = { contexts: 0, oscillators: 0 }
  const suspend = vi.fn(() => Promise.resolve())
  class FakeAudioContext {
    currentTime = 0
    destination = {}
    constructor() { created.contexts += 1 }
    resume = vi.fn(() => Promise.resolve())
    suspend = suspend
    createOscillator = () => { created.oscillators += 1; return node() }
    createGain = node
  }
  return { FakeAudioContext, created, suspend }
}

let audio: ReturnType<typeof fakeAudio>

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
  localStorage.clear()
  audio = fakeAudio()
  vi.stubGlobal("AudioContext", audio.FakeAudioContext)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("playChime", () => {
  it("starts no audio until a chime plays, then plays two notes and lets the device rest", async () => {
    const { playChime } = await import("./chime")
    expect(audio.created.contexts).toBe(0)

    playChime()
    expect(audio.created.contexts).toBe(1)
    expect(audio.created.oscillators).toBe(2)

    vi.advanceTimersByTime(900)
    expect(audio.suspend).toHaveBeenCalledOnce()
  })

  it("chimes once per burst, across tabs, unless asked from Settings", async () => {
    const { playChime } = await import("./chime")
    playChime()
    playChime()
    expect(audio.created.oscillators).toBe(2)

    playChime({ force: true })
    expect(audio.created.oscillators).toBe(4)

    vi.setSystemTime(Date.now() + 2_000)
    playChime()
    expect(audio.created.oscillators).toBe(6)
    expect(audio.created.contexts).toBe(1)
  })
})
