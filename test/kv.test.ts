import { createToken } from "@/auth/jwt_token/createToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { apiKvDelete } from "@client/apiKvDelete"
import { apiKvGet } from "@client/apiKvGet"
import { apiKvList } from "@client/apiKvList"
import { apiKvPost } from "@client/apiKvPost"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { workerUrl } from "./workerUrl"

function generateTestKey(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test-${prefix}-${timestamp}-${random}`
}

describe("KV API", () => {
  let token: string
  const testKeys: string[] = []

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
    const tokenSecretResult = envTokenSecretResult()
    if (tokenSecretResult.success) {
      token = await createToken("test-user-id", tokenSecretResult.data)
    } else {
      token = ""
    }
  })

  afterAll(async () => {
    for (const key of testKeys) {
      try {
        await apiKvDelete(workerUrl, key, token)
      } catch {}
    }
  })

  describe("POST /api/kv/{key}", () => {
    test("creates a key-value pair with string value", async () => {
      const key = generateTestKey("post-json")
      testKeys.push(key)

      const jsonValue = JSON.stringify({ name: "test", value: 123 })
      const result = await apiKvPost(workerUrl, key, jsonValue, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
    })

    test("creates a key-value pair with custom expiration", async () => {
      const key = generateTestKey("post-ttl")
      testKeys.push(key)

      const result = await apiKvPost(workerUrl, key, "expiring value", token, 3600)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
    })

    test("updates existing key-value pair", async () => {
      const key = generateTestKey("update")
      testKeys.push(key)

      await apiKvPost(workerUrl, key, "original", token)
      const result = await apiKvPost(workerUrl, key, "updated", token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
    })

    test("fails without authorization", async () => {
      const key = generateTestKey("no-auth")
      testKeys.push(key)

      const result = await apiKvPost(workerUrl, key, "value", "")
      if (!result.success) console.log(result)
      expect(result.success).toBe(false)
    })
  })

  describe("GET /api/kv/{key}", () => {
    test("reads an existing key-value pair", async () => {
      const key = generateTestKey("get")
      testKeys.push(key)

      await apiKvPost(workerUrl, key, "test value", token)
      const result = await apiKvGet(workerUrl, key, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toBe("test value")
    })

    test("returns null for non-existent key", async () => {
      const key = generateTestKey("non-existent")
      const result = await apiKvGet(workerUrl, key, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toBeNull()
    })

    test("fails without authorization", async () => {
      const key = generateTestKey("get-no-auth")
      const result = await apiKvGet(workerUrl, key, "")
      if (!result.success) console.log(result)
      expect(result.success).toBe(false)
    })
  })

  describe("GET /api/kv (list)", () => {
    test("lists all keys", async () => {
      const key = generateTestKey("list")
      testKeys.push(key)

      await apiKvPost(workerUrl, key, "list test", token)
      const result = await apiKvList(workerUrl, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
      if (!result.success) return
      expect(Array.isArray(result.data)).toBe(true)
    })

    test("lists keys with prefix filter", async () => {
      const prefix = "test/"
      const result = await apiKvList(workerUrl, token, { prefix })
      if (!result.success) console.log("list with prefix error:", result)
      expect(result.success).toBe(true)
      if (!result.success) return
      expect(Array.isArray(result.data)).toBe(true)
    })

    test("fails without authorization", async () => {
      const result = await apiKvList(workerUrl, "")
      if (!result.success) console.log(result)
      expect(result.success).toBe(false)
    })
  })

  describe("DELETE /api/kv/{key}", () => {
    test("deletes an existing key", async () => {
      const key = generateTestKey("delete")
      await apiKvPost(workerUrl, key, "to be deleted", token)

      const result = await apiKvDelete(workerUrl, key, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)

      const getResult = await apiKvGet(workerUrl, key, token)
      if (!getResult.success) console.log(getResult)
      expect(getResult.success).toBe(true)
      if (!getResult.success) return
      expect(getResult.data).toBeNull()
    })

    test("deletes non-existent key gracefully", async () => {
      const key = generateTestKey("delete-nonexistent")
      const result = await apiKvDelete(workerUrl, key, token)
      if (!result.success) console.log(result)
      expect(result.success).toBe(true)
    })

    test("fails without authorization", async () => {
      const key = generateTestKey("delete-no-auth")
      const result = await apiKvDelete(workerUrl, key, "")
      if (!result.success) console.log(result)
      expect(result.success).toBe(false)
    })
  })
})
