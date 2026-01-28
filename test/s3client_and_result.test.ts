import { getS3Endpoint } from "@/env/getS3Endpoint"
import { getUploadUrlExpirationMs } from "@/env/getUploadUrlExpirationMs"
import { getS3Client } from "@/getS3Client"
import { getCacheControlHeader } from "@/headers/getCacheControlHeader"
import type { Env } from "@/types"
import { fetchResult } from "@/utils/fetchResult"
import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { number, object, parseJson, pipe, string, type BaseIssue, type BaseSchema } from "valibot"

describe("S3 client", () => {
  let env: Env

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

  beforeEach(() => {
    env = {
      B2_BUCKET_PUBLIC_BASE_URL: "https://peer-astro-media.s3.eu-central-003.backblazeb2.com",
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
      UPLOAD_URL_EXPIRATION_MS: "86400000",
      HEADER_CACHE_CONTROL: "public, max-age=86400, stale-while-revalidate=259200, immutable",
    }
  })

  test("getS3Client returns S3mini instance", () => {
    const client = getS3Client(env)
    expect(client).not.toBeNull()
    expect(typeof client.listObjects).toBe("function")
    expect(typeof client.putObject).toBe("function")
    expect(typeof client.getObject).toBe("function")
  })

  test("getS3Client is singleton", () => {
    const client1 = getS3Client(env)
    const client2 = getS3Client(env)
    expect(client1).toBe(client2)
  })

  test("getS3Endpoint returns endpoint from env", () => {
    const endpoint = getS3Endpoint(env)
    expect(endpoint).toBe(env.B2_ENDPOINT)
  })

  test("getS3Endpoint handles empty endpoint", () => {
    const envWithoutEndpoint: Env = { ...env, B2_ENDPOINT: "" }
    const endpoint = getS3Endpoint(envWithoutEndpoint)
    expect(endpoint).toBe("")
  })

  test("getUploadUrlExpirationMs returns configured value", () => {
    const expiration = getUploadUrlExpirationMs(env)
    expect(expiration).toBe(86400000)
  })

  test("getUploadUrlExpirationMs handles missing value with default", () => {
    const envWithoutExpiration: Env = { ...env, UPLOAD_URL_EXPIRATION_MS: "" }
    const expiration = getUploadUrlExpirationMs(envWithoutExpiration)
    expect(expiration).toBe(86400000)
  })

  test("getUploadUrlExpirationMs handles invalid value with default", () => {
    const envWithInvalidExpiration: Env = { ...env, UPLOAD_URL_EXPIRATION_MS: "invalid" }
    const expiration = getUploadUrlExpirationMs(envWithInvalidExpiration)
    expect(expiration).toBe(86400000)
  })

  test("getCacheControlHeader returns configured value", () => {
    const cacheControl = getCacheControlHeader(env)
    expect(cacheControl).toBe("public, max-age=86400, stale-while-revalidate=259200, immutable")
  })

  test("getCacheControlHeader returns default when not configured", () => {
    const envWithoutCacheControl: Env = { ...env, HEADER_CACHE_CONTROL: "" }
    const cacheControl = getCacheControlHeader(envWithoutCacheControl)
    expect(cacheControl).toBe("public, max-age=86400, stale-while-revalidate=259200, immutable")
  })
})

describe("Result type", () => {
  test("Result type has success true with data", () => {
    const result = { success: true, data: { id: 1, name: "test" } }
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 1, name: "test" })
  })

  test("Result type has success false with error", () => {
    const result = {
      success: false,
      op: "testOp",
      errorMessage: "Something went wrong",
    }
    expect(result.success).toBe(false)
    expect(result.op).toBe("testOp")
    expect(result.errorMessage).toBe("Something went wrong")
  })
})

describe("fetchResult", () => {
  const innerSchema = object({
    id: number(),
    name: string(),
  })
  const testSchema = pipe(string(), parseJson(), innerSchema) as BaseSchema<
    string,
    { id: number; name: string },
    BaseIssue<string>
  >

  test("fetchResult returns success for valid JSON response", async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1, name: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

    const result = await fetchResult("testOp", testSchema, mockResponse)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 1, name: "test" })
    }
  })

  test("fetchResult returns error for non-ok status", async () => {
    const mockResponse = new Response("Not Found", {
      status: 404,
      statusText: "Not Found",
    })

    const result = await fetchResult("fetchOp", testSchema, mockResponse)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.op).toBe("fetchOp")
      expect(result.errorMessage).toContain("404")
    }
  })

  test("fetchResult returns error for invalid JSON schema", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "not-a-number", name: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

    const result = await fetchResult("validateOp", testSchema, mockResponse)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.op).toBe("validateOp")
      expect(result.errorData).toContain("not-a-number")
    }
  })

  test("fetchResult handles non-JSON response with non-ok status", async () => {
    const mockResponse = new Response("Internal Server Error", {
      status: 500,
      statusText: "Internal Server Error",
    })

    const result = await fetchResult("serverOp", testSchema, mockResponse)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.statusCode).toBeUndefined()
      expect(result.errorData).toBe("Internal Server Error")
    }
  })
})
