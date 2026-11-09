import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Socket } from "socket.io-client"
import { toast } from "sonner"
import { getActivityCounts } from "./api"
import { playChime } from "./chime"
import { createActivitySocket, isAuthRefusal } from "./realtime"
import { activitySectionInfo } from "./sections"
import { useActivitySound } from "./store"
import { activityCountEventSchema, type ActivityCounts } from "./types"

export const activityCountsQueryKey = ["activity", "counts"] as const
/** Polling only stands in while the socket is down. */
const POLL_MS = 60_000
/** A session the server keeps refusing is not retried forever. */
const MAX_SESSION_RETRIES = 3

const fetchCounts = ({ signal }: { signal?: AbortSignal }) => getActivityCounts(signal)

export function useActivityCounts(live: boolean, enabled = true) {
  return useQuery({
    queryKey: activityCountsQueryKey,
    queryFn: fetchCounts,
    staleTime: 30_000,
    refetchInterval: live ? false : POLL_MS,
    enabled,
  })
}

/**
 * Keeps the signed-in admin's work-queue counts live. Mount it once, in the
 * dashboard layout: new work updates the counts, refreshes that queue's lists,
 * shows a toast and plays the chime (unless it is turned off in Settings).
 * Switched off (`enabled: false`) it makes no requests, holds no socket and
 * reports no counts.
 */
export function useLiveActivity({ enabled = true }: { enabled?: boolean } = {}) {
  const client = useQueryClient()
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  const [live, setLive] = useState(false)
  const counts = useActivityCounts(live, enabled)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    if (!enabled) return
    let socket: Socket | null = null
    let sessionRetries = 0
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let closed = false

    // Refused or ended for its session: renew it through the REST client (which
    // refreshes an expired token, or signs out when it cannot), then try again.
    const reconnectWithFreshSession = () => {
      setLive(false)
      if (sessionRetries >= MAX_SESSION_RETRIES) return
      const delay = 2_000 * 2 ** sessionRetries
      sessionRetries += 1
      retryTimer = setTimeout(() => {
        client.fetchQuery({ queryKey: activityCountsQueryKey, queryFn: fetchCounts, staleTime: 0 }).then(
          () => { if (!closed) socket?.connect() },
          () => undefined,
        )
      }, delay)
    }

    const listen = (live: Socket) => {
      live.on("connect", () => {
        sessionRetries = 0
        setLive(true)
        // Whatever changed while the socket was down.
        void client.invalidateQueries({ queryKey: activityCountsQueryKey })
      })
      live.on("disconnect", (reason) => {
        setLive(false)
        if (reason === "io server disconnect") reconnectWithFreshSession()
      })
      live.on("connect_error", (error) => {
        if (isAuthRefusal(error)) reconnectWithFreshSession()
      })
      live.on("activity:count", (payload: unknown) => {
        const event = activityCountEventSchema.safeParse(payload)
        if (!event.success) return
        const { section, count, increased } = event.data
        const info = activitySectionInfo[section]
        client.setQueryData<ActivityCounts>(activityCountsQueryKey, (current) => ({ ...current, [section]: count }))
        void client.invalidateQueries({ queryKey: info.queryKey })
        if (!increased) return
        toast(`New in ${info.label}`, {
          id: `activity-${section}`,
          description: `${count} waiting`,
          action: { label: "View", onClick: () => navigateRef.current(info.route) },
        })
        if (useActivitySound.getState().soundEnabled) playChime()
      })
    }

    createActivitySocket().then(
      (created) => {
        if (closed) return
        socket = created
        listen(created)
        created.connect()
      },
      // The socket code failed to load (a stale deploy, offline): the counts still poll.
      () => undefined,
    )

    return () => {
      closed = true
      clearTimeout(retryTimer)
      socket?.removeAllListeners()
      socket?.disconnect()
      setLive(false)
    }
  }, [client, enabled])

  return { counts: enabled ? counts.data : undefined, live: enabled && live }
}
