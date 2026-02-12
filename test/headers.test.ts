import { createToken } from "@/auth/jwt_token/createToken"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathB2 } from "@client/apiBaseB2"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2GetUploadUrl", async () => {
  const env = process.env as unknown as Env
  const tokenSecretResult = envTokenSecretResult(env)

  test("envTokenSecretResult", () => {
    expect(tokenSecretResult.success).toBeTruthy()
  })

  const authToken = tokenSecretResult.success ? await createToken("test-user-id", tokenSecretResult.data) : ""

  test("has all required headers: CORS, version, timing", async () => {
    const url = new URL(apiPathB2 + apiPathGetUploadUrl, workerUrl)
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) console.log(response.status, response.statusText)
    expect(response.ok).toBe(true)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined()
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined()
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined()
    expect(response.headers.get("version")).toBeDefined()
    expect(response.headers.get("Server-Timing")).toBeDefined()
  })
})
