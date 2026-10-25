import { describe, expect, it } from "vitest"
import { activeFilterCount, emptyPeopleFilters, peopleFiltersFromParams, peopleFiltersToParams, peopleQuery } from "./people-filters"

const institutionId = "50000000-0000-4000-8000-000000000001"

describe("People filters", () => {
  it("reads valid filters from the URL and drops anything the API would reject", () => {
    const filters = peopleFiltersFromParams(new URLSearchParams(`role=PUBLISHER&affiliation=ALUMNI&status=deleted&badge=honour&institutionId=${institutionId}&campusId=nope&page=3`))
    expect(filters).toEqual({ ...emptyPeopleFilters, role: "PUBLISHER", affiliation: "ALUMNI", badge: "honour", institutionId, page: 3 })
  })

  it("falls back to the first page for a nonsense page number", () => {
    expect(peopleFiltersFromParams(new URLSearchParams("page=-2")).page).toBe(1)
  })

  it("writes only the filters that are set, round-tripping through the URL", () => {
    const filters = { ...emptyPeopleFilters, role: "CREATOR" as const, search: "ama" }
    const params = peopleFiltersToParams(filters)
    expect(params.toString()).toBe("search=ama&role=CREATOR")
    expect(peopleFiltersFromParams(params)).toEqual(filters)
  })

  it("turns cleared filters into missing API parameters", () => {
    expect(peopleQuery({ ...emptyPeopleFilters, affiliation: "NONE", page: 2 }, "", 20)).toEqual({
      search: undefined, role: undefined, affiliation: "NONE", status: undefined, verificationTier: undefined,
      badge: undefined, institutionId: undefined, campusId: undefined, page: 2, limit: 20,
    })
  })

  it("counts active filters, not the search box or locked ones", () => {
    const filters = { ...emptyPeopleFilters, search: "x", role: "VIEWER" as const, institutionId, page: 4 }
    expect(activeFilterCount(filters)).toBe(2)
    expect(activeFilterCount(filters, ["institutionId"])).toBe(1)
  })
})
