import { isAxiosError } from "axios"

export function rbacErrorMessage(error: unknown, fallback: string, resource: "role" | "admin" = "role") {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return "You don't have permission to perform this action."
    if (error.response?.status === 409) return resource === "admin" ? "An admin with this email already exists." : "A role with this name already exists."
    if (error.response?.status === 404) return `This ${resource} or assignment no longer exists. Refresh the list and try again.`
    if (error.response?.status === 400) {
      const data: unknown = error.response.data
      if (data && typeof data === "object" && "message" in data) {
        const message = data.message
        if (typeof message === "string") return message
        if (Array.isArray(message) && message.every((item) => typeof item === "string")) return message.join(" ")
      }
    }
  }
  return fallback
}
