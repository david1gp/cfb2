import type { Env } from "@/env/Env"
import { verifyTokenResult } from "@/auth/jwt_token/verifyTokenResult"

export async function getUploadUrlHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const tokenResult = await verifyTokenResult(authHeader)
  if (!tokenResult.success) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
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
