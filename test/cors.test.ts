import type { Env } from "@/types"
import { beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

describe("CORS headers", () => {
  let env: Env
  let getCorsHeaders: typeof import("@/headers/getCorsHeaders").getCorsHeaders

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

    const corsModule = await import("@/headers/getCorsHeaders")
    getCorsHeaders = corsModule.getCorsHeaders

    env = {
      B2_BUCKET_PUBLIC_BASE_URL: "https://peer-astro-media.s3.eu-central-003.backblazeb2.com",
      CORS_ALLOW_ORIGIN: "*",
      CORS_MAX_AGE: "300",
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
      UPLOAD_URL_EXPIRATION_MS: "86400000",
      HEADER_CACHE_CONTROL: "public, max-age=86400, stale-while-revalidate=259200, immutable",
    }
  })

  describe("getCorsHeaders", () => {
    test("returns correct CORS headers for OPTIONS preflight request", () => {
      const request = new Request("https://example.com/upload", {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.com",
          "Access-Control-Request-Method": "POST",
        },
      })

      const headers = getCorsHeaders(env, request)

      expect(headers.get("Access-Control-Allow-Origin")).toBe("*")
      expect(headers.get("Access-Control-Max-Age")).toBe("300")
      expect(headers.get("Access-Control-Allow-Methods")).toContain("POST")
      expect(headers.get("Access-Control-Allow-Methods")).toContain("PUT")
      expect(headers.get("Access-Control-Allow-Methods")).toContain("GET")
      expect(headers.get("Access-Control-Allow-Methods")).toContain("HEAD")
      expect(headers.get("Access-Control-Allow-Methods")).toContain("OPTIONS")
    })

    test("allows POST method in preflight response", () => {
      const request = new Request("https://example.com/upload", {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.com",
          "Access-Control-Request-Method": "POST",
        },
      })

      const headers = getCorsHeaders(env, request)
      const methods =
        headers
          .get("Access-Control-Allow-Methods")
          ?.split(", ")
          .map((m) => m.trim()) || []

      expect(methods).toContain("POST")
    })

    test("allows PUT method in preflight response", () => {
      const request = new Request("https://example.com/upload", {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.com",
          "Access-Control-Request-Method": "PUT",
        },
      })

      const headers = getCorsHeaders(env, request)
      const methods =
        headers
          .get("Access-Control-Allow-Methods")
          ?.split(", ")
          .map((m) => m.trim()) || []

      expect(methods).toContain("PUT")
    })

    test("includes correct headers in Access-Control-Allow-Headers", () => {
      const request = new Request("https://example.com/upload", {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.com",
        },
      })

      const headers = getCorsHeaders(env, request)
      const allowedHeaders = headers.get("Access-Control-Allow-Headers") || ""

      expect(allowedHeaders).toContain("Content-Type")
      expect(allowedHeaders).toContain("Authorization")
      expect(allowedHeaders).toContain("If-Modified-Since")
    })

    test("sets Access-Control-Allow-Origin for allowed origin", () => {
      const envWithSpecificOrigin: Env = {
        ...env,
        CORS_ALLOW_ORIGIN: "https://trusted.com",
      }

      const request = new Request("https://trusted.com/upload", {
        method: "POST",
        headers: {
          Origin: "https://trusted.com",
        },
      })

      const headers = getCorsHeaders(envWithSpecificOrigin, request)

      expect(headers.get("Access-Control-Allow-Origin")).toBe("https://trusted.com")
    })
  })
})
