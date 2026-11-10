import { useQuery } from "@tanstack/react-query"
import { getInstitutions } from "./api"

/** Every institution, for the map. The catalogue changes rarely, so it is kept for a while. */
export function useMapInstitutions() {
  return useQuery({
    queryKey: ["dashboard", "institutions"],
    queryFn: ({ signal }) => getInstitutions(signal),
    staleTime: 5 * 60_000,
  })
}
