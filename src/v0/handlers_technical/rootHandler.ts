import type { Env } from "@/env/Env"

export async function rootHandler(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  return new Response("Access to root path is not allowed", {
    status: 403,
    headers: { "Content-Type": "text/plain" },
  })
}
