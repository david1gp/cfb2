import { verifyToken } from "@/auth/jwt_token/verifyToken"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { createResultError } from "~utils/result/Result"

export async function getUploadUrlHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
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

  const saltResult = envTokenSecretResult(_env as unknown as Record<string, string>)
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

  const responseData = {
    uploadUrl: "https://upload.example.com/" + Date.now(),
    authorizationToken: "test-token-" + Date.now(),
  }
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
