import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2UploadViaWorker } from "@client/apiB2UploadViaWorker"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

describe("apiB2UploadViaWorker", () => {
  let workerUrl: string
  let authToken: string
  const testFileIds: string[] = []
  let b2Auth: { apiUrl: string; authorizationToken: string } | null = null

  beforeAll(async () => {
    const envPath = path.resolve(process.cwd(), ".env")
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8")
      envContent.split("\n").forEach((line) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const [key, ...valueParts] = trimmedLine.split("=")
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join("=").trim()
          }
        }
      })
    }

    workerUrl = process.env.WORKER_URL || "https://storage.peer.berlin"
    const b2Account = process.env.B2_ACCOUNT || ""
    const b2Key = process.env.B2_KEY || ""

    const authResult = await b2ApiAuthorizeAccount(b2Account, b2Key)
    if (authResult.success) {
      b2Auth = {
        apiUrl: authResult.data.apiUrl,
        authorizationToken: authResult.data.authorizationToken,
      }
    }

    authToken = process.env.AUTH_TOKEN || `Basic ${btoa(`${b2Account}:${b2Key}`)}`
  })

  afterAll(async () => {
    for (const fileId of testFileIds) {
      try {
        await fetch(`${workerUrl}/api/b2/delete-by-id?fileId=${encodeURIComponent(fileId)}`, {
          method: "DELETE",
          headers: { Authorization: authToken },
        })
      } catch {}
    }
  })

  test("uploads file via worker", async () => {
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
    if (!result.success) return
    expect(result.data.success).toBe(true)
    expect(result.data.key).toBeString()
    expect(result.data.size).toBe(testContent.length)
    expect(result.data.contentType).toBe("text/plain")

    testFileIds.push(testFileId)
  })

  test("fails with invalid token", async () => {
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

    expect(result.success).toBe(false)
  })

  test("fails with missing required fields", async () => {
    const testContent = new Blob(["test"])
    const sha1 = await calculateSHA1FromUint8Array(new Uint8Array(await testContent.arrayBuffer()))

    const result = await apiB2UploadViaWorker(
      authToken,
      {
        displayName: "",
        fileSize: testContent.size,
        mimeType: "text/plain",
        fileId: "test-id",
        sha1: sha1,
      },
      testContent,
      workerUrl,
    )

    expect(result.success).toBe(false)
  })
})
