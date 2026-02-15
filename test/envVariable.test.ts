import type { Env } from "@/env/Env"
import { envB2KeyIdResult } from "@/env/envB2AccountResult"
import { envB2BucketPublicBaseUrlResult } from "@/env/envB2BucketPublicBaseUrlResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envEnvNameResult } from "@/env/envEnvNameResult"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { describe, expect, test } from "bun:test"

describe("envVariable tests", () => {
  const env = process.env as unknown as Env
  test("envB2AccountResult", () => {
    const result = envB2KeyIdResult(env)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envB2BucketPublicBaseUrlResult", () => {
    const result = envB2BucketPublicBaseUrlResult(env)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envB2KeyResult", () => {
    const result = envB2KeyResult(env)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envEnvNameResult", () => {
    const result = envEnvNameResult({ ...env, ENV_NAME: "test" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("test")
    }
  })
  test("envTokenSecretResult", () => {
    const result = envTokenSecretResult(env)
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
})
