import { isAxiosError } from "axios"

export function rbacErrorMessage(error: unknown, fallback: string, resource: "role" | "admin" = "role") {
  if (isAxiosError(error)) {
    // The API names the rule, such as "Only a Super Admin can do this".
    if (error.response?.status === 403) return serverMessage(error.response.data) ?? "You don't have permission to do this."
    if (error.response?.status === 409) return resource === "admin" ? "An admin with this email already exists." : "A role with this name already exists."
    if (error.response?.status === 404) return `This ${resource} or assignment no longer exists. Refresh the list and try again.`
    if (error.response?.status === 400) {
      const message = serverMessage(error.response.data)
      if (message) return message
    }
  }
  return fallback
}

function serverMessage(data: unknown) {
  if (!data || typeof data !== "object" || !("message" in data)) return undefined
  const message = data.message
  if (typeof message === "string" && message.trim() && message !== "Insufficient role or permissions") return message
  if (Array.isArray(message) && message.length && message.every((item) => typeof item === "string")) return message.join(" ")
  return undefined
}
