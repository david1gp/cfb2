import type { HonoContext } from "@/utils/HonoContext"

export async function notAllowedHandler(c: HonoContext): Promise<Response> {
  return c.text("Method not allowed", 405, {
    "Content-Type": "text/plain",
  })
}
