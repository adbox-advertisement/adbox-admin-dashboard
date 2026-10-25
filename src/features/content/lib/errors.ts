import { isAxiosError } from "axios"

export function contentErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 403) return "You don't have permission to perform this action."
    // Nest answers an unregistered route with "Cannot GET /path": the server predates this feature.
    if (status === 404 && isMissingRoute(error.response?.data)) return "The connected server doesn't support this yet. Ask a developer to rebuild or redeploy the super-admin API, then refresh."
    if (status === 404) return "This item no longer exists. Refresh the list and try again."
    if (status === 409 || status === 400) {
      const data: unknown = error.response?.data
      if (data && typeof data === "object" && "message" in data) {
        const message = data.message
        if (typeof message === "string") return message
        if (Array.isArray(message) && message.every((item) => typeof item === "string")) return message.join(" ")
      }
    }
  }
  return fallback
}

function isMissingRoute(data: unknown) {
  return Boolean(data && typeof data === "object" && "message" in data && typeof data.message === "string" && /^Cannot (GET|POST|PATCH|PUT|DELETE) \//.test(data.message))
}
