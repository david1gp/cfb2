import type { Env } from "@/env/Env"
import { getS3Client } from "@/v1/s3/getS3Client"
import type { ListObject } from "@/v1/s3/ListObject"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

function generateTestKey(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test/${prefix}/${timestamp}-${random}.txt`
}

describe.skip("B2 integration tests", () => {
  let env: Env
  let s3: ReturnType<typeof getS3Client>
  const testFiles: string[] = []

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
      VERSION: "0.1.0",
      ENV_NAME: "test",
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_BUCKET_PUBLIC_BASE_URL: "https://peer-astro-media.s3.eu-central-003.backblazeb2.com",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
      UPLOAD_URL_EXPIRATION_MS: "86400000",
      HEADER_CACHE_CONTROL: "public, max-age=86400, stale-while-revalidate=259200, immutable",
      TOKEN_SECRET: process.env.TOKEN_SECRET || "",
      KV: {} as unknown as KVNamespace,
    }

    s3 = getS3Client(env)
  })

  afterAll(async () => {
    for (const key of testFiles) {
      try {
        await s3.deleteObject(key)
      } catch {}
    }
  })

  describe("upload via S3 client and verify with objectExists", () => {
    test("uploads file and verifies it exists via objectExists", async () => {
      const testContent = new TextEncoder().encode("Integration test content for upload verification")
      const testKey = generateTestKey("upload-head")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const existsResult = await s3.objectExists(testKey)
      expect(existsResult).toBe(true)
    })

    test("uploads file and verifies content length", async () => {
      const testContent = new TextEncoder().encode("Content length verification test")
      const testKey = generateTestKey("content-length")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const contentLength = await s3.getContentLength(testKey)
      expect(contentLength).toBe(testContent.length)
    })
  })

  describe("direct B2 upload verification", () => {
    test("can verify file uploaded directly to B2 exists", async () => {
      const testContent = new TextEncoder().encode("Direct B2 upload test content")
      const testKey = generateTestKey("direct-upload")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const existsResult = await s3.objectExists(testKey)
      expect(existsResult).toBe(true)

      const contentLength = await s3.getContentLength(testKey)
      expect(contentLength).toBe(testContent.length)
    })
  })

  describe("list objects and download verification", () => {
    test("lists objects and downloads to verify content", async () => {
      const testContent = new TextEncoder().encode("List and download verification test")
      const testKey = generateTestKey("list-download")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const listResult = await s3.listObjects()
      expect(listResult).not.toBeNull()
      expect(listResult).toBeInstanceOf(Array)

      const listArray = listResult as ListObject[]
      const uploadedObject = listArray.find((obj) => obj.Key === testKey)
      expect(uploadedObject).toBeDefined()
      expect(uploadedObject?.Size as unknown as string).toBe(testContent.length.toString())

      const downloadResult = await s3.getObject(testKey)
      expect(downloadResult).not.toBeNull()
      expect(downloadResult).toBe(new TextDecoder().decode(testContent))
    })

    test("lists objects with prefix filter", async () => {
      const testContent = new TextEncoder().encode("Prefix list test")
      const testKey = "test/prefix/list-test.txt"
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const listResult = await s3.listObjects("/", "test/prefix/")
      expect(listResult).not.toBeNull()
      expect(listResult).toBeInstanceOf(Array)

      const listArray = listResult as ListObject[]
      const hasMatchingKey = listArray.some((obj) => obj.Key.startsWith("test/prefix/"))
      expect(hasMatchingKey).toBe(true)
    })
  })

  describe("file operations verification", () => {
    test("verifies file can be updated and old version replaced", async () => {
      const initialContent = new TextEncoder().encode("Initial content")
      const updatedContent = new TextEncoder().encode("Updated content")
      const testKey = generateTestKey("update-replace")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, initialContent, "text/plain")

      let contentLength = await s3.getContentLength(testKey)
      expect(contentLength).toBe(initialContent.length)

      await s3.putAnyObject(testKey, updatedContent, "text/plain")

      contentLength = await s3.getContentLength(testKey)
      expect(contentLength).toBe(updatedContent.length)

      const downloadResult = await s3.getObject(testKey)
      expect(downloadResult).toBe(new TextDecoder().decode(updatedContent))
    })

    test("handles file download and verifies content", async () => {
      const testContent = new TextEncoder().encode("Download verification test")
      const testKey = generateTestKey("download-verify")
      testFiles.push(testKey)

      await s3.putAnyObject(testKey, testContent, "text/plain")

      const downloadResult = await s3.getObject(testKey)
      expect(downloadResult).not.toBeNull()

      const downloadedData = new TextEncoder().encode(downloadResult as string)
      expect(downloadedData).toEqual(testContent)
    })
  })
})
