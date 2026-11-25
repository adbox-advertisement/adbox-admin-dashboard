import { isAxiosError } from "axios"

/** What the server said went wrong, for a field or the whole form. */
export function serverMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && !error.response) return "The server didn't answer. Check the connection and try again."
  const response = (error as { response?: { status?: number; data?: { message?: unknown; field?: unknown } } } | null)?.response
  const message = response?.data?.message
  const text = Array.isArray(message) ? message.join(" ") : typeof message === "string" ? message : null
  if (response?.status === 403) return text && text !== "Forbidden resource" ? text : "You don't have permission to do that."
  return text ?? (error instanceof Error && error.message ? error.message : fallback)
}

export function serverField(error: unknown) {
  const field = (error as { response?: { data?: { field?: unknown } } } | null)?.response?.data?.field
  return typeof field === "string" ? field : null
}
