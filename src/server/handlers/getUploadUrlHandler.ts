import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { b2AuthKvGetAndSave } from "@/server/cache/b2AuthKv"
import type { HonoContext } from "@/utils/HonoContext"
import type { B2ApiUploadData } from "@client/apiB2GetUploadUrl"
import { createResultError } from "~utils/result/Result"

export async function getUploadUrlHandler(c: HonoContext): Promise<Response> {
  let authHeader = c.req.header("Authorization")
  if (!authHeader) {
    const error = createResultError("getUploadUrlHandler", "Missing Authorization header")
    return c.json(error, 401)
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(c.env as unknown as Record<string, string>)
  if (!saltResult.success) {
    return c.json(saltResult, 500)
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError("getUploadUrlHandler", "Invalid token")
    return c.json(error, 401)
  }

  const b2AuthResult = await b2AuthKvGetAndSave(c.env)
  if (!b2AuthResult.success) {
    const error = createResultError("getUploadUrlHandler", b2AuthResult.errorMessage || "Failed to get B2 auth")
    return c.json(error, 500)
  }

  const uploadUrlResult = await b2ApiGetUploadUrl(b2AuthResult.data)
  if (!uploadUrlResult.success) {
    const error = createResultError("getUploadUrlHandler", uploadUrlResult.errorMessage || "Failed to get upload URL")
    return c.json(error, 500)
  }

  const responseData: B2ApiUploadData = {
    uploadUrl: uploadUrlResult.data.uploadUrl,
    authorizationToken: uploadUrlResult.data.authorizationToken,
  }
  return c.json(responseData, 200)
}
