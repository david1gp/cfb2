import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { b2AuthKvGetAndSave } from "@/v0/cache/b2AuthKv"
import type { B2ApiUploadData } from "@client/apiB2GetUploadUrl"
import { createResultError } from "~utils/result/Result"

export async function getUploadUrlHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  let authHeader = request.headers.get("Authorization")
  if (!authHeader) {
    const error = createResultError("getUploadUrlHandler", "Missing Authorization header")
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(env as unknown as Record<string, string>)
  if (!saltResult.success) {
    return new Response(JSON.stringify(saltResult), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError("getUploadUrlHandler", "Invalid token")
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const b2AuthResult = await b2AuthKvGetAndSave(env as Env)
  if (!b2AuthResult.success) {
    const error = createResultError("getUploadUrlHandler", b2AuthResult.errorMessage || "Failed to get B2 auth")
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const uploadUrlResult = await b2ApiGetUploadUrl(b2AuthResult.data)
  if (!uploadUrlResult.success) {
    const error = createResultError("getUploadUrlHandler", uploadUrlResult.errorMessage || "Failed to get upload URL")
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const responseData: B2ApiUploadData = {
    uploadUrl: uploadUrlResult.data.uploadUrl,
    authorizationToken: uploadUrlResult.data.authorizationToken,
  }
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
