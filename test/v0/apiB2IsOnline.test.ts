import { apiB2IsOnline } from "@client/apiB2IsOnline"
import { describe, expect, test } from "bun:test"

describe("apiB2IsOnline v0", () => {
  const workerUrl = "http://localhost:8787"

  test("returns true when server is online", async () => {
    const result = await apiB2IsOnline(workerUrl)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toBe(true)
  })

  test("returns false when server returns non-OK response", async () => {
    const result = await apiB2IsOnline("http://localhost:9999")

    expect(result.success).toBe(false)
  })

  test("handles offline server", async () => {
    const result = await apiB2IsOnline("http://localhost:65535")

    expect(result.success).toBe(false)
  })
})
