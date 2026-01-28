import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2UploadViaWorker } from "@client/apiB2UploadViaWorker"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2UploadViaWorker v0", () => {
  const authToken = "test-token"

  test.skip("connects to v0 worker upload endpoint", async () => {
    const testContent = new TextEncoder().encode("Integration test: upload via worker")
    const sha1 = await calculateSHA1FromUint8Array(testContent)
    const testDisplayName = "test-file.txt"

    const result = await apiB2UploadViaWorker(
      authToken,
      {
        fullFileName: testDisplayName,
        mimeType: "text/plain",
        contentLength: testContent.length.toString(),
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
        fullFileName: "test.txt",
        mimeType: "text/plain",
        contentLength: testContent.size.toString(),
        sha1: sha1,
      },
      testContent,
      workerUrl,
    )

    expect(result.success).toBe(false)
  })

  test.skip("handles empty file upload", async () => {
    const testContent = new Uint8Array(0)
    const sha1 = await calculateSHA1FromUint8Array(testContent)

    const result = await apiB2UploadViaWorker(
      authToken,
      {
        fullFileName: "empty.txt",
        mimeType: "text/plain",
        contentLength: "0",
        sha1: sha1,
      },
      new Blob([testContent]),
      workerUrl,
    )

    expect(result.success).toBe(true)
  })
})
