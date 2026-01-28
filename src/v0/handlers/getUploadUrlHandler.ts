import type { Env } from "@/env/Env"

export async function getUploadUrlHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get("key") || "test-key.txt"
  const contentType = url.searchParams.get("contentType") || "text/plain"
  const sha1 = url.searchParams.get("sha1") || "da39a3ee5e6b4b0d3255bfef95601890afd80709"

  const responseData = {
    uploadUrl: "https://upload.example.com/" + key,
    authorizationToken: "test-token-" + Date.now(),
    key: key,
    contentType: contentType,
    sha1: sha1,
  }
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
