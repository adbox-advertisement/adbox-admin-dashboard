import { useSearchParams } from "react-router-dom"
import { useUserAccess } from "../hooks"
import { peopleFiltersFromParams, peopleFiltersToParams } from "../lib/people-filters"
import { USER_PERMISSIONS } from "../types"
import { PeopleTable } from "../components/PeopleTable"
import { NoAccess } from "../components/Surface"
import { PageIntro } from "../components/ListParts"

export function PeoplePage() {
  const can = useUserAccess()
  const [params, setParams] = useSearchParams()
  const filters = peopleFiltersFromParams(params)

  if (!can(USER_PERMISSIONS.read)) return <NoAccess permission={USER_PERMISSIONS.read} what="platform users" />

  // Filters live in the URL so Overview figures can link straight to a list and
  // the list survives reloads and the back button. Typing replaces the entry.
  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro>Everyone with an AdBox account. Filter by role, campus, verification, badge or status, and select a person to open their profile.</PageIntro>
    <PeopleTable filters={filters} onChange={(next) => setParams(peopleFiltersToParams(next), { replace: next.search !== filters.search })} />
  </div>
}
