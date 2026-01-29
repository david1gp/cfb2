import { createToken } from "@/auth/jwt_token/createToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2GetUploadUrl", async () => {
  const tokenSecretResult = envTokenSecretResult()

  test("envTokenSecretResult", () => {
    expect(tokenSecretResult.success).toBeTruthy()
  })

  const authToken = tokenSecretResult.success ? await createToken("test-user-id", tokenSecretResult.data) : ""

  test("has all required headers: CORS, version, timing", async () => {
    const url = new URL("/get-upload-url", workerUrl)
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    expect(response.ok).toBe(true)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined()
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined()
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined()
    expect(response.headers.get("version")).toBeDefined()
    expect(response.headers.get("Server-Timing")).toBeDefined()
  })
})
