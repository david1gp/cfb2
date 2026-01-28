import type { Env } from "@/types"
import { beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"

describe("env validation", () => {
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

  test("B2_* env variables are loaded and not undefined", () => {
    const requiredVars = ["B2_ACCOUNT", "B2_KEY", "B2_BUCKET_ID", "B2_BUCKET_NAME", "B2_ENDPOINT"]

    for (const varName of requiredVars) {
      expect(typeof process.env[varName]).toBe("string")
      expect(process.env[varName]).not.toBe("")
    }
  })

  test("Env interface has all required B2 config properties", () => {
    const env: Env = {
      B2_BUCKET_PUBLIC_BASE_URL: "https://example.s3.eu-central-003.backblazeb2.com",
      B2_ACCOUNT: process.env.B2_ACCOUNT || "",
      B2_KEY: process.env.B2_KEY || "",
      B2_BUCKET_ID: process.env.B2_BUCKET_ID || "",
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "",
      UPLOAD_URL_EXPIRATION_MS: process.env.UPLOAD_URL_EXPIRATION_MS || "86400000",
      HEADER_CACHE_CONTROL: process.env.HEADER_CACHE_CONTROL || "",
    }

    expect(env.B2_ACCOUNT).toBeDefined()
    expect(env.B2_KEY).toBeDefined()
    expect(env.B2_BUCKET_ID).toBeDefined()
    expect(env.B2_BUCKET_NAME).toBeDefined()
    expect(env.B2_ENDPOINT).toBeDefined()
  })

  test(".env.example contains all required env vars", () => {
    const envExamplePath = path.resolve(process.cwd(), ".env.example")
    const envExampleContent = fs.readFileSync(envExamplePath, "utf-8")

    const requiredVars = [
      "B2_ACCOUNT",
      "B2_KEY",
      "B2_BUCKET_ID",
      "B2_BUCKET_NAME",
      "B2_ENDPOINT",
      "UPLOAD_URL_EXPIRATION_MS",
      "HEADER_CACHE_CONTROL",
    ]

    for (const varName of requiredVars) {
      expect(envExampleContent).toContain(varName)
    }
  })
})
