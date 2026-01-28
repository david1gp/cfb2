import { envB2AccountResult } from "@/env/envB2AccountResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { describe, expect, test } from "bun:test"

describe("envVariable tests", () => {
  describe("envB2AccountResult", () => {
    test("returns error when B2_ACCOUNT is missing", () => {
      const result = envB2AccountResult({})
      expect(result.success).toBe(false)
    })

    test("returns error when B2_ACCOUNT is empty string", () => {
      const result = envB2AccountResult({ B2_ACCOUNT: "" })
      expect(result.success).toBe(false)
    })

    test("returns value when B2_ACCOUNT is set", () => {
      const result = envB2AccountResult({ B2_ACCOUNT: "test-account-id" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("test-account-id")
      }
    })
  })

  describe("envB2KeyResult", () => {
    test("returns error when B2_KEY is missing", () => {
      const result = envB2KeyResult({})
      expect(result.success).toBe(false)
    })

    test("returns error when B2_KEY is empty string", () => {
      const result = envB2KeyResult({ B2_KEY: "" })
      expect(result.success).toBe(false)
    })

    test("returns value when B2_KEY is set", () => {
      const result = envB2KeyResult({ B2_KEY: "test-key-value" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("test-key-value")
      }
    })
  })

  describe("envTokenSecretResult", () => {
    test("returns error when TOKEN_SECRET is missing", () => {
      const result = envTokenSecretResult({})
      expect(result.success).toBe(false)
    })

    test("returns error when TOKEN_SECRET is empty string", () => {
      const result = envTokenSecretResult({ TOKEN_SECRET: "" })
      expect(result.success).toBe(false)
    })

    test("returns value when TOKEN_SECRET is set", () => {
      const result = envTokenSecretResult({ TOKEN_SECRET: "test-secret-key" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe("test-secret-key")
      }
    })
  })
})
