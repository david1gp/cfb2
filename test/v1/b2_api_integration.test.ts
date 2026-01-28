import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { b2ApiDownloadFile } from "@/b2/api/b2ApiDownloadFile"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadFile } from "@/b2/api/b2ApiUploadFile"
import type { B2AuthModel } from "@/b2/model/B2AuthModel"
import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import { calculateSHA1FromUint8Array } from "@/utils/sha1"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

function generateTestKey(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test/${prefix}/${timestamp}-${random}.txt`
}

describe.skip("B2 API integration tests", () => {
  let env: {
    B2_ACCOUNT: string
    B2_KEY: string
    B2_BUCKET_ID: string
    B2_BUCKET_NAME: string
    B2_ENDPOINT: string
  }
  let auth: B2AuthModel
  let uploadUrl: B2UrlModel
  let downloadUrl: string
  const testFileIds: string[] = []

  beforeAll(() => {
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

    env = {
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
    }
  })

  afterAll(async () => {
    for (const fileId of testFileIds) {
      try {
        await fetch(
          `${auth?.apiUrl}/b2api/v4/b2_delete_file_version?fileId=${fileId}`,
          {
            method: "GET",
            headers: {
              Authorization: auth?.authorizationToken || "",
            },
          },
        )
      } catch {}
    }
  })

  describe("b2ApiAuthorizeAccount", () => {
    test("authenticates with valid credentials", async () => {
      const result = await b2ApiAuthorizeAccount(env.B2_ACCOUNT, env.B2_KEY)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.apiUrl).toBeString()
      expect(result.data.authorizationToken).toBeString()
      expect(result.data.bucketId).toBe(env.B2_BUCKET_ID)
      expect(result.data.createdAt).toBeString()
      expect(result.data.expiresAt).toBeString()

      auth = result.data
      downloadUrl = "https://f003.backblazeb2.com"
    })

    test("fails with invalid credentials", async () => {
      const result = await b2ApiAuthorizeAccount("invalid_key_id", "invalid_key")

      expect(result.success).toBe(false)
      if (result.success) return
      expect(result.errorMessage).toBeDefined()
    })
  })

  describe("b2ApiGetUploadUrl", () => {
    test("gets upload URL with fresh auth", async () => {
      expect(auth).toBeDefined()

      const result = await b2ApiGetUploadUrl(auth)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.uploadUrl).toBeString()
      expect(result.data.uploadUrl).toContain("https://")
      expect(result.data.authorizationToken).toBeString()
      expect(result.data.createdAt).toBeString()
      expect(result.data.expiresAt).toBeString()

      uploadUrl = result.data
    })

    test("gets upload URL again (cached auth)", async () => {
      expect(auth).toBeDefined()

      const result = await b2ApiGetUploadUrl(auth)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.uploadUrl).toBeString()
      expect(result.data.authorizationToken).toBeString()
    })
  })

  describe("b2ApiUploadFile", () => {
    test("uploads file with pre-calculated sha1", async () => {
      expect(uploadUrl).toBeDefined()

      const testContent = new TextEncoder().encode("Integration test content for b2ApiUploadFile")
      const testKey = generateTestKey("upload-file")
      const sha1 = await calculateSHA1FromUint8Array(testContent)

      const result = await b2ApiUploadFile(
        uploadUrl,
        {
          fullFileName: testKey,
          mimeType: "text/plain",
          contentLength: testContent.length.toString(),
          sha1: sha1,
        },
        testContent,
      )

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.fileId).toBeString()
      expect(result.data.uploadTimestamp).toBeNumber()

      if (result.data.fileId) {
        testFileIds.push(result.data.fileId)
      }
    })

    test("uploads larger file with pre-calculated sha1", async () => {
      expect(uploadUrl).toBeDefined()

      const largeContent = new Uint8Array(1024 * 100)
      crypto.getRandomValues(largeContent)
      const testKey = generateTestKey("upload-large")
      const sha1 = await calculateSHA1FromUint8Array(largeContent)

      const result = await b2ApiUploadFile(
        uploadUrl,
        {
          fullFileName: testKey,
          mimeType: "application/octet-stream",
          contentLength: largeContent.length.toString(),
          sha1: sha1,
        },
        largeContent,
      )

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.fileId).toBeString()

      if (result.data.fileId) {
        testFileIds.push(result.data.fileId)
      }
    })
  })

  describe("b2ApiDownloadFile", () => {
    let testFileId: string
    let testFileContent: Uint8Array

    beforeAll(async () => {
      expect(uploadUrl).toBeDefined()

      testFileContent = new TextEncoder().encode("Content for download verification test")
      const testKey = generateTestKey("download-test")
      const sha1 = await calculateSHA1FromUint8Array(testFileContent)

      const uploadResult = await b2ApiUploadFile(
        uploadUrl,
        {
          fullFileName: testKey,
          mimeType: "text/plain",
          contentLength: testFileContent.length.toString(),
          sha1: sha1,
        },
        testFileContent,
      )

      expect(uploadResult.success).toBe(true)
      if (!uploadResult.success) return
      expect(uploadResult.data.fileId).toBeDefined()

      testFileId = uploadResult.data.fileId
      testFileIds.push(testFileId)
    })

    test("downloads file and verifies content", async () => {
      expect(auth).toBeDefined()
      expect(testFileId).toBeDefined()

      const result = await b2ApiDownloadFile(downloadUrl, auth.authorizationToken, testFileId)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.ok).toBe(true)
      expect(result.data.status).toBe(200)

      const downloadedContent = Array.from(new Uint8Array(await result.data.arrayBuffer()))
      const expectedContent = Array.from(testFileContent)
      expect(downloadedContent).toEqual(expectedContent)
    })
  })
})
