import type { ReactNode } from "react"
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createTestQueryClient } from "@/test/test-utils"
import { getActivityCounts } from "./api"
import { playChime } from "./chime"
import { activityCountsQueryKey, useLiveActivity } from "./hooks"
import { createActivitySocket } from "./realtime"
import { useActivitySound } from "./store"

vi.mock("./api", () => ({ getActivityCounts: vi.fn() }))
vi.mock("./chime", () => ({ playChime: vi.fn() }))
vi.mock("sonner", () => ({ toast: vi.fn() }))
vi.mock("./realtime", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./realtime")>()),
  createActivitySocket: vi.fn(),
}))

type Handler = (...args: unknown[]) => void

function fakeSocket() {
  const handlers = new Map<string, Handler[]>()
  return {
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler])
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(() => handlers.clear()),
    fire: (event: string, ...args: unknown[]) => act(() => handlers.get(event)?.forEach((handler) => handler(...args))),
  }
}

let socket: ReturnType<typeof fakeSocket>
let client: QueryClient

function renderLive(initialProps: { enabled: boolean } = { enabled: true }) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return renderHook((props: { enabled: boolean }) => useLiveActivity(props), { wrapper, initialProps })
}

// The socket code loads on demand; it connects once its handlers are attached.
async function renderConnected() {
  const rendered = renderLive()
  await waitFor(() => expect(socket.connect).toHaveBeenCalledOnce())
  return rendered
}

beforeEach(() => {
  socket = fakeSocket()
  client = createTestQueryClient()
  vi.mocked(createActivitySocket).mockResolvedValue(socket as never)
  vi.mocked(getActivityCounts).mockResolvedValue({ adRequests: 2, contentReports: 1 })
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
  useActivitySound.setState({ soundEnabled: true })
})

describe("useLiveActivity", () => {
  it("starts from the server's counts", async () => {
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toEqual({ adRequests: 2, contentReports: 1 }))
    expect(result.current.live).toBe(false)
    socket.fire("connect")
    expect(result.current.live).toBe(true)
  })

  it("announces new work: count, toast, chime and the queue's lists refreshed", async () => {
    const invalidate = vi.spyOn(client, "invalidateQueries")
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toBeDefined())

    socket.fire("activity:count", { section: "adRequests", count: 3, increased: true })

    await waitFor(() => expect(result.current.counts).toEqual({ adRequests: 3, contentReports: 1 }))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["ads"] })
    expect(toast).toHaveBeenCalledWith("New in Ad Requests", expect.objectContaining({ id: "activity-adRequests", description: "3 waiting" }))
    expect(playChime).toHaveBeenCalledOnce()
  })

  it("stays quiet when the sound is turned off", async () => {
    useActivitySound.setState({ soundEnabled: false })
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toBeDefined())

    socket.fire("activity:count", { section: "recruitment", count: 1, increased: true })

    expect(toast).toHaveBeenCalledOnce()
    expect(playChime).not.toHaveBeenCalled()
  })

  it("lowers a badge without a toast or a chime when work is done", async () => {
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toBeDefined())

    socket.fire("activity:count", { section: "contentReports", count: 0, increased: false })

    await waitFor(() => expect(result.current.counts).toEqual({ adRequests: 2, contentReports: 0 }))
    expect(toast).not.toHaveBeenCalled()
    expect(playChime).not.toHaveBeenCalled()
  })

  it("ignores a message it does not understand", async () => {
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toBeDefined())

    socket.fire("activity:count", { section: "somethingElse", count: 9, increased: true })

    expect(client.getQueryData(activityCountsQueryKey)).toEqual({ adRequests: 2, contentReports: 1 })
    expect(toast).not.toHaveBeenCalled()
  })

  it("renews the session and reconnects when the server refuses it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { result } = await renderConnected()
    await waitFor(() => expect(result.current.counts).toBeDefined())
    vi.mocked(getActivityCounts).mockClear()
    socket.connect.mockClear()

    socket.fire("connect_error", Object.assign(new Error("Admin session is not active"), { data: { code: "UNAUTHENTICATED" } }))
    await act(() => vi.advanceTimersByTimeAsync(2_000))

    expect(getActivityCounts).toHaveBeenCalledOnce()
    await waitFor(() => expect(socket.connect).toHaveBeenCalledOnce())
  })

  it("leaves a network failure to Socket.IO's own reconnection", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderConnected()
    socket.fire("connect_error", new Error("xhr poll error"))
    await act(() => vi.advanceTimersByTimeAsync(10_000))
    expect(socket.connect).toHaveBeenCalledOnce()
  })

  it("closes the socket when the dashboard unmounts", async () => {
    const { unmount } = await renderConnected()
    unmount()
    expect(socket.removeAllListeners).toHaveBeenCalled()
    expect(socket.disconnect).toHaveBeenCalled()
  })

  it("makes no requests and holds no socket while switched off (RDI pages)", async () => {
    const { result } = renderLive({ enabled: false })
    await act(() => Promise.resolve())
    expect(createActivitySocket).not.toHaveBeenCalled()
    expect(getActivityCounts).not.toHaveBeenCalled()
    expect(result.current).toEqual({ counts: undefined, live: false })
  })

  it("closes the socket and hides the counts when switched off after connecting", async () => {
    const { result, rerender } = await renderConnected()
    socket.fire("connect")
    await waitFor(() => expect(result.current.counts).toBeDefined())

    rerender({ enabled: false })

    expect(socket.disconnect).toHaveBeenCalled()
    expect(result.current).toEqual({ counts: undefined, live: false })
  })

  it("never connects when the dashboard is gone before the socket code loads", async () => {
    const { unmount } = renderLive()
    unmount()
    await act(() => Promise.resolve())
    expect(socket.on).not.toHaveBeenCalled()
    expect(socket.connect).not.toHaveBeenCalled()
  })
})
