import { envB2AccountResult } from "@/env/envB2AccountResult"
import { envB2BucketPublicBaseUrlResult } from "@/env/envB2BucketPublicBaseUrlResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { describe, expect, test } from "bun:test"

describe("envVariable tests", () => {
  test("envB2AccountResult", () => {
    const result = envB2AccountResult()
    expect(result.success).toBe(true)
  })
  test("envB2BucketPublicBaseUrlResult", () => {
    const result = envB2BucketPublicBaseUrlResult()
    expect(result.success).toBe(true)
  })
  test("envB2KeyResult", () => {
    const result = envB2KeyResult()
    expect(result.success).toBe(true)
  })
  test("envTokenSecretResult", () => {
    const result = envTokenSecretResult()
    expect(result.success).toBe(true)
  })
})
