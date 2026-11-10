import { describe, expect, it } from "vitest"
import { ghanaRegions, projectToMap } from "../data/ghana-regions"
import { townCoordinates } from "../data/ghana-towns"
import { groupOf, placeInstitutions, regionIdFor, shadeFor, shadeSteps, summariseRegions } from "./institution-map"

const institution = (id: string, town: string, region: string, type = "TRADITIONAL_UNIVERSITY", isActive = true) =>
  ({ id, name: `Institution ${id}`, shortName: id, type, region, town, isActive })

describe("the Ghana map data", () => {
  it("has the 16 regions, each with a shape and a centre", () => {
    expect(ghanaRegions.map((region) => region.name).sort()).toEqual([
      "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
      "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North",
    ])
    for (const region of ghanaRegions) {
      expect(region.path).toMatch(/^M[\d. L]+Z/)
      expect(region.center.x).toBeGreaterThan(0)
    }
  })

  it("places Accra south-east of Kumasi and Tamale north of both", () => {
    const [accra, kumasi, tamale] = ["Accra|Greater Accra", "Kumasi|Ashanti", "Tamale|Northern"].map((key) => projectToMap(...townCoordinates[key]))
    expect(accra.x).toBeGreaterThan(kumasi.x)
    expect(accra.y).toBeGreaterThan(kumasi.y)
    expect(tamale.y).toBeLessThan(kumasi.y)
  })
})

describe("placeInstitutions", () => {
  it("puts each institution at its town, spreading those that share one", () => {
    const placed = placeInstitutions([institution("a", "Kumasi", "Ashanti"), institution("b", "Kumasi", "Ashanti"), institution("c", "Tamale", "Northern")])
    expect(placed).toHaveLength(3)
    const kumasi = projectToMap(...townCoordinates["Kumasi|Ashanti"])
    const [first, second] = placed.filter((item) => item.regionId === "ashanti")
    expect({ x: first.x, y: first.y }).toEqual(kumasi)
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThan(3)
    expect(placed.every((item) => !item.approximate)).toBe(true)
  })

  it("draws a town it doesn't know at its region's centre, and leaves inactive ones out", () => {
    const placed = placeInstitutions([institution("new", "Somewhere New", "Volta Region"), institution("off", "Kumasi", "Ashanti", "TRADITIONAL_UNIVERSITY", false)])
    expect(placed).toHaveLength(1)
    const volta = ghanaRegions.find((region) => region.id === "volta")!
    expect(placed[0]).toMatchObject({ regionId: "volta", approximate: true, x: volta.center.x, y: volta.center.y })
  })

  it("groups the catalogue's kinds into three colours", () => {
    expect(groupOf("PRIVATE_TERTIARY")).toBe("university")
    expect(groupOf("PUBLIC_COLLEGE_OF_EDUCATION")).toBe("education")
    expect(groupOf("PUBLIC_HEALTH_TRAINING")).toBe("health")
    expect(groupOf("SOMETHING_NEW")).toBe("health")
  })
})

describe("summariseRegions", () => {
  it("lists all 16 regions, busiest first, with each kind counted", () => {
    const summaries = summariseRegions(placeInstitutions([
      institution("a", "Accra", "Greater Accra"), institution("b", "Accra", "Greater Accra", "PUBLIC_COLLEGE_OF_EDUCATION"), institution("c", "Kumasi", "Ashanti"),
    ]))
    expect(summaries).toHaveLength(16)
    expect(summaries[0]).toMatchObject({ id: "greater-accra", count: 2, groups: { university: 1, education: 1, health: 0 } })
    expect(summaries[1]).toMatchObject({ id: "ashanti", count: 1 })
    expect(summaries[summaries.length - 1].count).toBe(0)
  })

  it("matches region names with or without \"Region\"", () => {
    expect(regionIdFor("Greater Accra Region")).toBe("greater-accra")
    expect(regionIdFor("western north")).toBe("western-north")
    expect(regionIdFor("Atlantis")).toBeNull()
  })

  it("shades regions in five steps by how many institutions they hold", () => {
    expect(shadeFor(3)).toBe(shadeSteps[0].fill)
    expect(shadeFor(9)).toBe(shadeSteps[1].fill)
    expect(shadeFor(44)).toBe(shadeSteps[4].fill)
  })
})
