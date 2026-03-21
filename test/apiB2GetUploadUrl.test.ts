import { createToken } from "../src/auth/jwt_token/createToken.js"
import type { Env } from "../src/env/Env.js"
import { envTokenSecretResult } from "../src/env/envTokenSecretResult.js"
import { apiB2GetUploadUrl } from "../client/apiB2GetUploadUrl.js"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl.js"

describe("apiB2GetUploadUrl", async () => {
  const env = process.env as unknown as Env
  const tokenSecretResult = envTokenSecretResult(env)

  test("envTokenSecretResult", () => {
    expect(tokenSecretResult.success).toBeTruthy()
  })

  const authToken = tokenSecretResult.success ? await createToken("test-user-id", tokenSecretResult.data) : ""

  test("apiB2GetUploadUrl", async () => {
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

  test("handles invalid token request", async () => {
    const result = await apiB2GetUploadUrl(workerUrl, "invalid-token")
    expect(result.success).toBe(false)
  })
})
