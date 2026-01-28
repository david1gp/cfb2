import type { Env } from "@/env/Env"
import {
  b2UploadUrlResponseSchema,
  uploadPathQuerySchema,
  uploadPathResponseSchema,
  uploadRequestSchema,
} from "@/v1/validators"
import { beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { safeParse } from "valibot"

describe.skip("validators", () => {
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
  })

  describe("uploadPathQuerySchema", () => {
    test("validates correct query parameters", () => {
      const input = {
        key: "test/file.txt",
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathQuerySchema, input)
      expect(result.success).toBe(true)
    })

    test("fails when key is missing", () => {
      const input = {
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathQuerySchema, input)
      expect(result.success).toBe(false)
    })

    test("fails when contentType is missing", () => {
      const input = {
        key: "test/file.txt",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathQuerySchema, input)
      expect(result.success).toBe(false)
    })

    test("fails when sha1 is missing", () => {
      const input = {
        key: "test/file.txt",
        contentType: "text/plain",
      }
      const result = safeParse(uploadPathQuerySchema, input)
      expect(result.success).toBe(false)
    })

    test("fails when key is not a string", () => {
      const input = {
        key: 123,
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathQuerySchema, input)
      expect(result.success).toBe(false)
    })
  })

  describe("b2UploadUrlResponseSchema", () => {
    test("validates correct B2 upload URL response", () => {
      const input = {
        bucketId: "123456",
        uploadUrl: "https://upload.b2.com/b2api/v4/b2_upload_file",
        authorizationToken: "token123",
      }
      const result = safeParse(b2UploadUrlResponseSchema, input)
      expect(result.success).toBe(true)
    })

    test("fails when uploadUrl is missing", () => {
      const input = {
        bucketId: "123456",
        authorizationToken: "token123",
      }
      const result = safeParse(b2UploadUrlResponseSchema, input)
      expect(result.success).toBe(false)
    })

    test("fails when authorizationToken is missing", () => {
      const input = {
        bucketId: "123456",
        uploadUrl: "https://upload.b2.com/b2api/v4/b2_upload_file",
      }
      const result = safeParse(b2UploadUrlResponseSchema, input)
      expect(result.success).toBe(false)
    })
  })

  describe("uploadPathResponseSchema", () => {
    test("validates correct upload path response", () => {
      const input = {
        uploadUrl: "https://upload.b2.com/b2api/v4/b2_upload_file",
        authorizationToken: "token123",
        key: "test/file.txt",
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathResponseSchema, input)
      expect(result.success).toBe(true)
    })

    test("fails when uploadUrl is missing", () => {
      const input = {
        authorizationToken: "token123",
        key: "test/file.txt",
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadPathResponseSchema, input)
      expect(result.success).toBe(false)
    })
  })

  describe("uploadRequestSchema", () => {
    test("validates correct upload request", () => {
      const input = {
        key: "test/file.txt",
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadRequestSchema, input)
      expect(result.success).toBe(true)
    })

    test("fails when key is missing", () => {
      const input = {
        contentType: "text/plain",
        sha1: "abc123def456",
      }
      const result = safeParse(uploadRequestSchema, input)
      expect(result.success).toBe(false)
    })
  })
})

describe("getUploadUrl", () => {
  let env: Env

  beforeAll(() => {
    env = {
      ENV_NAME: "test",
      B2_BUCKET_PUBLIC_BASE_URL: "https://peer-astro-media.s3.eu-central-003.backblazeb2.com",
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
      UPLOAD_URL_EXPIRATION_MS: "86400000",
      HEADER_CACHE_CONTROL: "public, max-age=86400, stale-while-revalidate=259200, immutable",
      TOKEN_SECRET: process.env.TOKEN_SECRET || "",
      KV: {} as unknown as KVNamespace,
    }
  })
})
