// Vite exposes these values to the browser. Never put secrets in VITE_* variables.
export const env = {
  apiBaseUrl: import.meta.env.VITE_SUPER_ADMIN_API_URL?.trim().replace(/\/$/, "") || "/api/v1",
} as const
