import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { apiB2GetUploadUrl } from "@client/apiB2GetUploadUrl"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

describe.skip("apiB2GetUploadUrl", () => {
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

  test("gets upload URL with valid auth", async () => {
    const testContent = new TextEncoder().encode("test content for upload url")
    const sha1 = await calculateSHA1FromUint8Array(testContent)
    const testKey = `test/get-url/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`

    const result = await apiB2GetUploadUrl(workerUrl, authToken, {
      key: testKey,
      contentType: "text/plain",
      sha1,
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.uploadUrl).toBeString()
    expect(result.data.uploadUrl).toContain("https://")
    expect(result.data.authorizationToken).toBeString()
    expect(result.data.key).toBe(testKey)
    expect(result.data.contentType).toBe("text/plain")
    expect(result.data.sha1).toBe(sha1)

    testKeys.push(testKey)
  })

  test("fails with invalid auth", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "invalid-token", {
      key: "test-key.txt",
      contentType: "text/plain",
      sha1: "abc123",
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errorMessage).toBeDefined()
  })

  test("fails with missing auth header", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "", {
      key: "test-key.txt",
      contentType: "text/plain",
      sha1: "abc123",
    })

    expect(result.success).toBe(false)
  })
})
