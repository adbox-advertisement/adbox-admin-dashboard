import { describe, expect, it } from "vitest"
import { cn } from "./cn"

describe("content cn", () => {
  it("keeps a type-scale size beside a text colour", () => {
    expect(cn("text-h4 font-bold", "text-grey-1000")).toBe("text-h4 font-bold text-grey-1000")
    expect(cn("text-b3", "md:text-b2", "text-destructive")).toBe("text-b3 md:text-b2 text-destructive")
  })

  it("lets a later size override an earlier one", () => {
    expect(cn("text-b3", "text-b1")).toBe("text-b1")
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
