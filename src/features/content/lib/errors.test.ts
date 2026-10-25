import { describe, expect, it } from "vitest"
import { AxiosError, AxiosHeaders } from "axios"
import { contentErrorMessage } from "./errors"

function httpError(status: number, data: unknown) {
  return new AxiosError("failed", undefined, undefined, undefined, { status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } })
}

describe("contentErrorMessage", () => {
  it("explains when the server does not have the endpoint yet", () => {
    expect(contentErrorMessage(httpError(404, { message: "Cannot GET /api/v1/user-content/summary" }), "x")).toMatch(/doesn't support this yet/)
  })

  it("keeps the stale-item message for a real missing record", () => {
    expect(contentErrorMessage(httpError(404, { message: "Post not found" }), "x")).toMatch(/no longer exists/)
  })
})
