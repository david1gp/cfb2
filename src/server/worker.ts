import { enableLogging } from "../config/enableLogging.js"
import type { Env } from "../env/Env.js"
import { notAllowedHandler } from "./handlers_technical/notAllowedHandler.js"
import { getCorsHeaders } from "./headers/getCorsHeaders.js"
import { setHeaderTimingSingleValue } from "./headers/setHeaderTimingSingleValue.js"
import { addRoutesB2 } from "./routes/addRoutesB2.js"
import { addRoutesKv } from "./routes/addRoutesKv.js"
import { addRoutesOpenapi } from "./routes/addRoutesOpenapi.js"
import { addRoutesServer } from "./routes/addRoutesServer.js"
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
