import { createToken } from "@/auth/jwt_token/createToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { apiB2GetUploadUrl } from "@client/apiB2GetUploadUrl"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2GetUploadUrl v0", async () => {
  const tokenSecretResult = envTokenSecretResult()

  test("envTokenSecretResult", () => {
    expect(tokenSecretResult.success).toBeTruthy()
  })

  const authToken = tokenSecretResult.success ? await createToken("test-user-id", tokenSecretResult.data) : ""

  test("connects to v0 worker endpoint", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, authToken)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
    if (!result.success) {
      expect(result.errorMessage).toBeDefined()
      return
    }
    expect(result.data.uploadUrl).toBeString()
    expect(result.data.uploadUrl).toContain("https://")
    expect(result.data.authorizationToken).toBeString()
  })

  test("returns valid B2 upload URL format", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, authToken)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.uploadUrl).toMatch(/^https:\/\//)
    expect(result.data.authorizationToken).toBeDefined()
  })

  test("handles invalid token request", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "invalid-token")
    if (!result.success) console.log(result)
    expect(result.success).toBe(false)
  })

  test("handles request with missing auth header", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "")
    if (!result.success) console.log(result)
    expect(result.success).toBe(false)
  })
})
