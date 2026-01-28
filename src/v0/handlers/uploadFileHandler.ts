import type { Env } from "@/env/Env"

export async function uploadFileHandler(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  const responseData = {
    success: true,
    key: "test-file.txt",
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
