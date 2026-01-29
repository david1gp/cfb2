import type { HonoContext } from "@/utils/HonoContext"

export async function isOnlineHandler(c: HonoContext): Promise<Response> {
  return c.text("OK", 200, {
    "Content-Type": "text/plain",
  })
}
