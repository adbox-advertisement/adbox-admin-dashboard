import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentAdmin, loginAdmin } from "./api"

const currentAdminQueryKey = ["auth", "current-admin"] as const

export function useCurrentAdmin() {
  return useQuery({
    queryKey: currentAdminQueryKey,
    queryFn: ({ signal }) => getCurrentAdmin(signal),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginAdmin(email, password),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: currentAdminQueryKey })
    },
  })
}
