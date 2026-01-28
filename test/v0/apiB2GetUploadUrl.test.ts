import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2GetUploadUrl } from "@client/apiB2GetUploadUrl"
import { describe, expect, test } from "bun:test"

describe("apiB2GetUploadUrl v0", () => {
  const workerUrl = "http://localhost:8787"
  const authToken = "test-token"

  test("connects to v0 worker endpoint", async () => {
    const testContent = new TextEncoder().encode("test content for upload url")
    const sha1 = await calculateSHA1FromUint8Array(testContent)
    const testKey = `test/get-url/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`

    const result = await apiB2GetUploadUrl(workerUrl, authToken, {
      key: testKey,
      contentType: "text/plain",
      sha1,
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      expect(result.errorMessage).toBeDefined()
      return
    }
    expect(result.data.uploadUrl).toBeString()
    expect(result.data.authorizationToken).toBeString()
    expect(result.data.key).toBe(testKey)
    expect(result.data.contentType).toBe("text/plain")
    expect(result.data.sha1).toBe(sha1)
  })

  test("handles request to v0 endpoint", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "invalid-token", {
      key: "test-key.txt",
      contentType: "text/plain",
      sha1: "abc123",
    })

    expect(result.success).toBe(true)
  })

  test("handles request with missing auth header", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "", {
      key: "test-key.txt",
      contentType: "text/plain",
      sha1: "abc123",
    })

    expect(result.success).toBe(true)
  })
})
