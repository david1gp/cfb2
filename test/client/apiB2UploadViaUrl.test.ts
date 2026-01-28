import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2GetUploadUrl } from "@client/apiB2GetUploadUrl"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { apiB2UploadViaUrl } from "../../client/apiB2UploadViaUrl"

describe("apiB2UploadViaUrl", () => {
  let workerUrl: string
  let authToken: string
  const testKeys: string[] = []
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
    for (const key of testKeys) {
      try {
        await fetch(`${workerUrl}/api/b2/delete?key=${encodeURIComponent(key)}`, {
          method: "DELETE",
          headers: { Authorization: authToken },
        })
      } catch {}
    }
  })

  test("gets URL then uploads file via B2 URL", async () => {
    const testContent = new TextEncoder().encode("Integration test: upload via URL")
    const sha1 = await calculateSHA1FromUint8Array(testContent)
    const testKey = `test/upload-url/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`

    const urlResult = await apiB2GetUploadUrl(workerUrl, authToken, {
      key: testKey,
      contentType: "text/plain",
      sha1,
    })

    expect(urlResult.success).toBe(true)
    if (!urlResult.success) return

    const uploadResult = await apiB2UploadViaUrl(new Blob([testContent]), {
      uploadUrl: urlResult.data.uploadUrl,
      authorizationToken: urlResult.data.authorizationToken,
      key: testKey,
      contentType: "text/plain",
      sha1,
    })

    expect(uploadResult.success).toBe(true)
    if (!uploadResult.success) return
    expect(uploadResult.data.success).toBe(true)
    expect(uploadResult.data.key).toBe(testKey)
    expect(uploadResult.data.size).toBe(testContent.length)
    expect(uploadResult.data.contentType).toBe("text/plain")

    testKeys.push(testKey)
  })

  test("fails with invalid upload URL", async () => {
    const testContent = new Blob(["test"])

    const result = await apiB2UploadViaUrl(testContent, {
      uploadUrl: "https://invalid-url.example.com/upload",
      authorizationToken: "invalid-token",
      key: "test.txt",
      contentType: "text/plain",
      sha1: "abc123",
    })

    expect(result.success).toBe(false)
  })

  test("fails with mismatched sha1", async () => {
    const testContent = new Blob(["test content"])
    const testKey = `test/mismatch/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`

    const urlResult = await apiB2GetUploadUrl(workerUrl, authToken, {
      key: testKey,
      contentType: "text/plain",
      sha1: "wrong-sha1",
    })

    expect(urlResult.success).toBe(true)
    if (!urlResult.success) return

    const result = await apiB2UploadViaUrl(testContent, {
      uploadUrl: urlResult.data.uploadUrl,
      authorizationToken: urlResult.data.authorizationToken,
      key: testKey,
      contentType: "text/plain",
      sha1: "wrong-sha1",
    })

    expect(result.success).toBe(false)
  })
})
