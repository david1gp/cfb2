import { envB2AccountResult } from "@/env/envB2AccountResult"
import { envB2BucketPublicBaseUrlResult } from "@/env/envB2BucketPublicBaseUrlResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { describe, expect, test } from "bun:test"

describe("envVariable tests", () => {
  test("envB2AccountResult", () => {
    const result = envB2AccountResult()
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envB2BucketPublicBaseUrlResult", () => {
    const result = envB2BucketPublicBaseUrlResult()
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envB2KeyResult", () => {
    const result = envB2KeyResult()
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
  test("envTokenSecretResult", () => {
    const result = envTokenSecretResult()
    if (!result.success) console.log(result)
    expect(result.success).toBe(true)
  })
})
