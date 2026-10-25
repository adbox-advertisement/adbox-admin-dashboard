import { useSearchParams } from "react-router-dom"
import { useUserAccess } from "../hooks"
import { peopleFiltersFromParams, peopleFiltersToParams } from "../lib/people-filters"
import { USER_PERMISSIONS } from "../types"
import { PeopleTable } from "../components/PeopleTable"
import { NoAccess } from "../components/Surface"

export function PeoplePage() {
  const can = useUserAccess()
  const [params, setParams] = useSearchParams()
  const filters = peopleFiltersFromParams(params)

  if (!can(USER_PERMISSIONS.read)) return <NoAccess permission={USER_PERMISSIONS.read} what="platform users" />

  // Filters live in the URL so Overview figures can link straight to a list and
  // the list survives reloads and the back button. Typing replaces the entry.
  return <div className="min-w-0 px-4 sm:px-6">
    <PeopleTable filters={filters} onChange={(next) => setParams(peopleFiltersToParams(next), { replace: next.search !== filters.search })} />
  </div>
}
