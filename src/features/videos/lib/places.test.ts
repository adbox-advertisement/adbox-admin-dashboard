import { afterEach, describe, expect, it, vi } from "vitest"
import type { InstitutionDirectory } from "../types"
import { matchScore, placeLabel, readRecentInstitutions, regionsOf, rememberInstitution, searchInstitutions } from "./places"

const institution = (id: string, shortName: string, name: string, region: string, isActive = true) => ({ id, shortName, name, region, isActive, campuses: [] })
const directory: InstitutionDirectory = [
  institution("ug", "UG", "University of Ghana", "Greater Accra"),
  institution("knust", "KNUST", "Kwame Nkrumah University of Science and Technology", "Ashanti"),
  institution("ucc", "UCC", "University of Cape Coast", "Central"),
  institution("pent", "PUC", "Pentecost University", "Greater Accra"),
  institution("old", "OLD", "Closed College", "Ashanti", false),
]

describe("finding one of hundreds of institutions", () => {
  afterEach(() => localStorage.clear())

  it("ranks the short name first, then the name, then the region", () => {
    expect(matchScore(directory[0], "ug")).toBeGreaterThan(matchScore(directory[0], "univ"))
    // Names starting with it beat names with it later on; ties go by short name.
    expect(searchInstitutions(directory, "university").map((item) => item.id)).toEqual(["ucc", "ug", "knust", "pent"])
    expect(searchInstitutions(directory, "ashanti").map((item) => item.id)).toEqual(["knust"])
    expect(searchInstitutions(directory, "pentecost").map((item) => item.id)).toEqual(["pent"])
  })

  it("leaves closed institutions out", () => {
    expect(searchInstitutions(directory, "closed")).toEqual([])
    expect(regionsOf(directory)).toEqual([{ region: "Ashanti", count: 1 }, { region: "Central", count: 1 }, { region: "Greater Accra", count: 2 }])
  })

  it("remembers this browser's recent picks, newest first, and copes without storage", () => {
    rememberInstitution("ug")
    rememberInstitution("knust")
    rememberInstitution("ug")
    expect(readRecentInstitutions()).toEqual(["ug", "knust"])
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked") })
    expect(readRecentInstitutions()).toEqual([])
  })

  it("names a place from institution to hall", () => {
    expect(placeLabel({ institution: { shortName: "UG" }, campus: { name: "Legon" }, hall: { name: "Commonwealth Hall" } })).toBe("UG · Legon · Commonwealth Hall")
    expect(placeLabel({ institution: null })).toBe("")
  })
})
