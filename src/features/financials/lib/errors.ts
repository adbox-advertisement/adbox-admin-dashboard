import { isAxiosError } from "axios"
import { formatDistanceToNowStrict } from "date-fns"

/** What to tell the admin when a gold settings call fails. */
export function financeErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data: unknown = error.response?.data
    if (status === 403) return "You don't have permission to perform this action."
    if (status === 404 && hasMessage(data) && /^Cannot (GET|POST|PATCH|PUT|DELETE) \//.test(String(data.message))) {
      return "The connected server doesn't support this yet. Ask a developer to rebuild or redeploy the super-admin API, then refresh."
    }
    if ((status === 400 || status === 409) && hasMessage(data)) {
      const message = data.message
      if (typeof message === "string") return message
      if (Array.isArray(message)) return message.join(" ")
    }
  }
  return fallback
}

const hasMessage = (data: unknown): data is { message: unknown } => Boolean(data && typeof data === "object" && "message" in data)

export const formatRelative = (value: string | null) => (value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null)
