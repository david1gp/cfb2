import { getCacheControlHeader } from "@/server/headers/getCacheControlHeader"
import type { HonoContext } from "@/utils/HonoContext"

export async function downloadHandlerDummy(c: HonoContext): Promise<Response> {
  const pathParts = c.req.path.split("/")
  const fullFileName = pathParts[pathParts.length - 1]

  return c.text("dummy file content for: " + fullFileName, 200, {
    "Content-Type": "text/plain",
    "Content-Disposition": `attachment; filename="${fullFileName}"`,
    "Cache-Control": getCacheControlHeader(c.env),
  })
}
