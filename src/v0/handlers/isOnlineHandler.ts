import type { Env } from "@/env/Env"

export async function isOnlineHandler(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
