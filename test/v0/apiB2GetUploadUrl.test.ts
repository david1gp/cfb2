import { apiB2GetUploadUrl } from "@client/apiB2GetUploadUrl"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2GetUploadUrl v0", () => {
  const authToken = "test-token"

  test.skip("connects to v0 worker endpoint", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, authToken)

    expect(result.success).toBe(true)
    if (!result.success) {
      expect(result.errorMessage).toBeDefined()
      return
    }
    expect(result.data.uploadUrl).toBeString()
    expect(result.data.authorizationToken).toBeString()
  })

  test("handles invalid token request", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "invalid-token")

    expect(result.success).toBe(false)
  })

  test("handles request with missing auth header", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "")

    expect(result.success).toBe(false)
  })
})
