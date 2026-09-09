import { useMutation } from "@tanstack/react-query"
import { loginAdmin } from "./api"

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginAdmin(email, password),
  })
}
