import { expect, test, describe, beforeAll } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import type { Env } from "@/types"

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

  test("PEER_* env variables are loaded and not undefined", () => {
    const requiredVars = ["PEER_ACCOUNT", "PEER_KEY", "PEER_BUCKET_ID", "PEER_BUCKET_NAME", "PEER_ENDPOINT"]

    for (const varName of requiredVars) {
      expect(typeof process.env[varName]).toBe("string")
      expect(process.env[varName]).not.toBe("")
    }
  })

  test("Env interface has all required B2 config properties", () => {
    const env: Env = {
      PUBLIC_BUCKET_BASE_URL: "https://example.s3.eu-central-003.backblazeb2.com",
      PEER_ACCOUNT: process.env.PEER_ACCOUNT || "",
      PEER_KEY: process.env.PEER_KEY || "",
      PEER_BUCKET_ID: process.env.PEER_BUCKET_ID || "",
      PEER_BUCKET_NAME: process.env.PEER_BUCKET_NAME || "",
      PEER_ENDPOINT: process.env.PEER_ENDPOINT || "",
      UPLOAD_URL_EXPIRATION_MS: process.env.UPLOAD_URL_EXPIRATION_MS || "86400000",
      UPLOAD_MAX_FILE_SIZE_MB: process.env.UPLOAD_MAX_FILE_SIZE_MB || "",
      HEADER_CACHE_CONTROL: process.env.HEADER_CACHE_CONTROL || "",
    }

    expect(env.PEER_ACCOUNT).toBeDefined()
    expect(env.PEER_KEY).toBeDefined()
    expect(env.PEER_BUCKET_ID).toBeDefined()
    expect(env.PEER_BUCKET_NAME).toBeDefined()
    expect(env.PEER_ENDPOINT).toBeDefined()
  })

  test(".env.example contains all required env vars", () => {
    const envExamplePath = path.resolve(process.cwd(), ".env.example")
    const envExampleContent = fs.readFileSync(envExamplePath, "utf-8")

    const requiredVars = [
      "PEER_ACCOUNT",
      "PEER_KEY",
      "PEER_BUCKET_ID",
      "PEER_BUCKET_NAME",
      "PEER_ENDPOINT",
      "UPLOAD_URL_EXPIRATION_MS",
      "UPLOAD_MAX_FILE_SIZE_MB",
      "HEADER_CACHE_CONTROL",
    ]

    for (const varName of requiredVars) {
      expect(envExampleContent).toContain(varName)
    }
  })
})
