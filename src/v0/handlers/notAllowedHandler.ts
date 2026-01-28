import type { Env } from "@/env/Env"

export async function notAllowedHandler(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  return new Response("Method not allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  })
}
