import { enableLogging } from "../config/enableLogging"
import type { Env } from "../env/Env"
import { notAllowedHandler } from "./handlers_technical/notAllowedHandler"
import { getCorsHeaders } from "./headers/getCorsHeaders"
import { setHeaderTimingSingleValue } from "./headers/setHeaderTimingSingleValue"
import { addRoutesB2 } from "./routes/addRoutesB2"
import { addRoutesKv } from "./routes/addRoutesKv"
import { addRoutesOpenapi } from "./routes/addRoutesOpenapi"
import { addRoutesServer } from "./routes/addRoutesServer"
import { Hono } from "hono"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", async (c, next) => {
  if (enableLogging) console.log(">>> REQUEST:", c.req.method, c.req.url)
  const corsHeaders = getCorsHeaders(c.env, c.req.raw)
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  await next()
  corsHeaders.forEach((value, key) => {
    c.header(key, value)
  })
  return
})

app.onError(async (err, c) => {
  console.error("UNHANDLED ERROR:", err)
  return c.json({ error: "Internal error", message: err.message }, 500)
})

addRoutesServer(app)
addRoutesKv(app)
addRoutesOpenapi(app)
addRoutesB2(app)

app.notFound(notAllowedHandler)

const notAllowedMethods = ["PUT", "PATCH", "DELETE"]
for (const method of notAllowedMethods) {
  app.on(method, "/*", notAllowedHandler)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const response = await app.fetch(request, env, ctx)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
