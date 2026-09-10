import { describe, expect, it } from "vitest"
import { uploadSchools } from "./schools"

describe("uploadSchools", () => {
  it("has at least one entry", () => {
    expect(uploadSchools.length).toBeGreaterThan(0)
  })

  it("has a unique id for every school", () => {
    const ids = uploadSchools.map((school) => school.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("gives every school a non-empty name, initials, and image", () => {
    for (const school of uploadSchools) {
      expect(school.name.length).toBeGreaterThan(0)
      expect(school.initials.length).toBeGreaterThan(0)
      expect(typeof school.image).toBe("string")
      expect(school.image.length).toBeGreaterThan(0)
    }
  })

  it("includes Ghana International School (GIS)", () => {
    const gis = uploadSchools.find((school) => school.id === "gis")
    expect(gis).toBeDefined()
    expect(gis?.name).toBe("Ghana International School")
    expect(gis?.initials).toBe("GIS")
  })
})
