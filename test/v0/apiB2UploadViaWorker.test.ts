import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2UploadViaWorker } from "@client/apiB2UploadViaWorker"
import { describe, expect, test } from "bun:test"

describe("apiB2UploadViaWorker v0", () => {
  const workerUrl = "http://localhost:8787"
  const authToken = "test-token"

  test("connects to v0 worker upload endpoint", async () => {
    const testContent = new TextEncoder().encode("Integration test: upload via worker")
    const sha1 = await calculateSHA1FromUint8Array(testContent)
    const testFileId = `test-worker-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const testDisplayName = "test-file.txt"

    const result = await apiB2UploadViaWorker(
      authToken,
      {
        displayName: testDisplayName,
        fileSize: testContent.length,
        mimeType: "text/plain",
        fileId: testFileId,
        sha1: sha1,
      },
      new Blob([testContent]),
      workerUrl,
    )

    expect(result.success).toBe(true)
    if (!result.success) {
      expect(result.errorMessage).toBeDefined()
      return
    }
    expect(result.data).toBeDefined()
  })

  test("handles invalid token request", async () => {
    const testContent = new Blob(["test"])
    const sha1 = await calculateSHA1FromUint8Array(new Uint8Array(await testContent.arrayBuffer()))

    const result = await apiB2UploadViaWorker(
      "invalid-token",
      {
        displayName: "test.txt",
        fileSize: testContent.size,
        mimeType: "text/plain",
        fileId: "test-id",
        sha1: sha1,
      },
      testContent,
      workerUrl,
    )

    expect(result.success).toBe(true)
  })

  test("handles empty file upload", async () => {
    const testContent = new Uint8Array(0)
    const sha1 = await calculateSHA1FromUint8Array(testContent)

    const result = await apiB2UploadViaWorker(
      authToken,
      {
        displayName: "empty.txt",
        fileSize: 0,
        mimeType: "text/plain",
        fileId: `empty-${Date.now()}`,
        sha1: sha1,
      },
      new Blob([testContent]),
      workerUrl,
    )

    expect(result.success).toBe(true)
  })
})
