import { apiB2IsOnline } from "@client/apiB2IsOnline"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2IsOnline v0", () => {
  test("returns true when server is online", async () => {
    const result = await apiB2IsOnline(workerUrl)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toBe(true)
  })

  test("returns false when server returns non-OK response", async () => {
    const result = await apiB2IsOnline("http://localhost:9999")
    if (!result.success) console.log(result)
    expect(result.success).toBe(false)
  })

  test("handles offline server", async () => {
    const result = await apiB2IsOnline("http://localhost:65535")
    if (!result.success) console.log(result)
    expect(result.success).toBe(false)
  })
})
