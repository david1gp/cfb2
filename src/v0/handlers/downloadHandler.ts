import type { Env } from "@/env/Env"

export async function downloadHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get("key") || "test-key.txt"
  const responseData = {
    success: true,
    key: key,
    size: 1234,
    contentType: "text/plain",
  }
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
