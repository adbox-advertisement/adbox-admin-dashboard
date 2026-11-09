import type { Socket } from "socket.io-client"
import { env } from "@/config/env"
import { readSession } from "@/lib/auth-session"

/**
 * Where super-admin's /admin namespace lives: same host as the REST API, Socket.IO
 * under the API path (`/api/v1/socket.io`). In development that is the Vite origin,
 * whose /api proxy forwards the WebSocket upgrade.
 */
export function activitySocketTarget(apiBaseUrl = env.apiBaseUrl, origin = window.location.origin) {
  const url = new URL(apiBaseUrl, origin)
  return { url: `${url.origin}/admin`, path: `${url.pathname.replace(/\/$/, "")}/socket.io` }
}

/**
 * Loaded on demand, so Socket.IO stays out of the first page load. Not connected yet:
 * the caller attaches its handlers, then calls connect(). The token is read at each
 * (re)connect, so a refreshed session is used without rebuilding the socket. A refused
 * handshake is not retried by Socket.IO itself; the caller refreshes the session and
 * calls connect() again.
 */
export async function createActivitySocket(): Promise<Socket> {
  const { io } = await import("socket.io-client")
  const { url, path } = activitySocketTarget()
  return io(url, {
    path,
    autoConnect: false,
    auth: (send) => send({ token: readSession()?.accessToken ?? "" }),
    reconnectionDelay: 2_000,
    reconnectionDelayMax: 30_000,
  })
}

/** Refused for its session (connect_error from the server), not for the network. */
export function isAuthRefusal(error: unknown) {
  return (error as { data?: { code?: unknown } } | null)?.data?.code === "UNAUTHENTICATED"
}
