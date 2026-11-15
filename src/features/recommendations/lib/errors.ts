import { isAxiosError } from "axios"
import { ZodError } from "zod"

const hasMessage = (data: unknown): data is { message: unknown } => Boolean(data && typeof data === "object" && "message" in data)

/** What to tell the admin when saving the ranked share fails. */
export function saveErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data: unknown = error.response?.data
    if (status === 403) return "You don't have permission to change the feed ranking. Ask a Super Admin for feed.ranking.manage."
    if (status === 404 && hasMessage(data) && /^Cannot POST \//.test(String(data.message))) {
      return "The connected server doesn't support this yet. Ask a developer to redeploy the super-admin API."
    }
    if (status === 400 && hasMessage(data)) {
      if (typeof data.message === "string") return data.message
      if (Array.isArray(data.message)) return data.message.join(" ")
    }
    if (!error.response) return "The server couldn't be reached. The change may still have been saved: check the versions before trying again."
  }
  return "Could not save the ranked share."
}

/** What to tell the admin when an override can't be saved or ended. */
export function overrideErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data: unknown = error.response?.data
    if (status === 403) return "You don't have permission to change Trending. Ask a Super Admin for discover.trends.manage."
    if (status === 404 && hasMessage(data) && /^Cannot (GET|POST) \//.test(String(data.message))) {
      return "The connected server doesn't support this yet. Ask a developer to redeploy the super-admin API."
    }
    if ((status === 400 || status === 404 || status === 409) && hasMessage(data)) {
      if (typeof data.message === "string") return data.message
      if (Array.isArray(data.message)) return data.message.join(" ")
    }
    if (!error.response) return "The server couldn't be reached. The change may still have been saved: check the overrides before trying again."
  }
  return "Could not save the override."
}

/** Why a read failed, specifically enough to act on: the server's status and words, or the field that didn't match. */
export function loadErrorDetail(error: unknown) {
  if (error instanceof ZodError) {
    const issue = error.issues[0]
    const path = issue?.path.map(String).join(".") || "the response"
    return `The server's answer doesn't match what this page expects: ${path}: ${issue?.message ?? "unexpected shape"}.`
  }
  if (isAxiosError(error)) {
    if (!error.response) return `No answer from the server (${error.code ?? error.message}).`
    const data: unknown = error.response.data
    const message = hasMessage(data) ? (Array.isArray(data.message) ? data.message.join(" ") : String(data.message)) : ""
    return `The server answered ${error.response.status}${message ? `: ${message}` : ""}.`
  }
  return error instanceof Error ? error.message : "Unknown error."
}
