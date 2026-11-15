import { describe, expect, it } from "vitest"
import { AxiosError, AxiosHeaders } from "axios"
import { z } from "zod"
import { loadErrorDetail } from "./errors"

const axiosError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, { status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } })

describe("loadErrorDetail", () => {
  it("names the field a response didn't match", () => {
    const result = z.object({ defaults: z.object({ version: z.string() }) }).safeParse({ defaults: { version: 2 } })
    expect(result.success).toBe(false)
    expect(loadErrorDetail(result.error)).toMatch(/^The server's answer doesn't match what this page expects: defaults\.version: /)
  })

  it("gives the server's status and words", () => {
    expect(loadErrorDetail(axiosError(403, { message: "Forbidden resource" }))).toBe("The server answered 403: Forbidden resource.")
    expect(loadErrorDetail(axiosError(500, { message: ["a", "b"] }))).toBe("The server answered 500: a b.")
    expect(loadErrorDetail(axiosError(304, ""))).toBe("The server answered 304.")
  })

  it("says when there was no answer at all", () => {
    expect(loadErrorDetail(new AxiosError("Network Error", "ERR_NETWORK"))).toBe("No answer from the server (ERR_NETWORK).")
  })
})
