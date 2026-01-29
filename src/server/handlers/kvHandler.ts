import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import type { HonoContext } from "@/utils/HonoContext"
import { createResultError } from "~utils/result/Result"

export async function kvHandler(c: HonoContext): Promise<Response> {
  const method = c.req.method

  if (method === "GET") {
    const keyParam = c.req.param("key")
    if (keyParam !== undefined) {
      return kvGetHandler(c)
    }
    return kvListHandler(c)
  }

  if (method === "POST") {
    return kvPostHandler(c)
  }

  if (method === "DELETE") {
    return kvDeleteHandler(c)
  }

  return c.json(createResultError("kvHandler", "Method not allowed"), 405)
}

async function kvListHandler(c: HonoContext): Promise<Response> {
  const tokenValidation = await validateToken(c, "kvListHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const prefix = c.req.query("prefix") || undefined
  const listResult = await c.env.KV.list({ prefix })
  const keys = listResult.keys.map((k) => k.name)

  return c.json(keys, 200)
}

async function kvGetHandler(c: HonoContext): Promise<Response> {
  const tokenValidation = await validateToken(c, "kvGetHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const key = c.req.param("key")

  if (!key) {
    return c.json(createResultError("kvGetHandler", "Invalid key"), 400)
  }

  const value = await c.env.KV.get(key)

  return c.text(value ?? "null", 200, {
    "Content-Type": "text/plain",
  })
}

async function kvPostHandler(c: HonoContext): Promise<Response> {
  const tokenValidation = await validateToken(c, "kvPostHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const key = c.req.param("key")

  if (!key) {
    return c.json(createResultError("kvPostHandler", "Invalid key"), 400)
  }

  const expirationSecondsHeader = c.req.header("X-Expiration-Seconds")
  const hours24inSeconds = 60 * 60 * 24
  const expirationSeconds = expirationSecondsHeader ? Number.parseInt(expirationSecondsHeader, 10) : hours24inSeconds

  const body = await c.req.text()

  await c.env.KV.put(key, body, {
    expirationTtl: expirationSeconds,
  })

  return c.text("null", 200, {
    "Content-Type": "application/json",
  })
}

async function kvDeleteHandler(c: HonoContext): Promise<Response> {
  const tokenValidation = await validateToken(c, "kvDeleteHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const key = c.req.param("key")

  if (!key) {
    return c.json(createResultError("kvDeleteHandler", "Invalid key"), 400)
  }

  await c.env.KV.delete(key)

  return c.text("null", 200, {
    "Content-Type": "application/json",
  })
}

async function validateToken(c: HonoContext, handlerName: string): Promise<{ valid: boolean; error?: Response }> {
  let authHeader = c.req.header("Authorization")
  if (!authHeader) {
    const error = createResultError(handlerName, "Missing Authorization header")
    return {
      valid: false,
      error: c.json(error, 401),
    }
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(c.env as unknown as Record<string, string | undefined>)
  if (!saltResult.success) {
    return {
      valid: false,
      error: c.json(saltResult, 500),
    }
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError(handlerName, "Invalid token")
    return {
      valid: false,
      error: c.json(error, 401),
    }
  }

  return { valid: true }
}
