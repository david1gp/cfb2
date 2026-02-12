import type { HonoContext } from "@/utils/HonoContext"

export async function rootHandler(c: HonoContext): Promise<Response> {
  return c.text("Access to root path is not allowed", 403, {
    "Content-Type": "text/plain",
  })
}
