import { verifyToken } from "@/auth/jwt_token/verifyToken"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { createResultError } from "~utils/result/Result"

const KV_DEFAULT_EXPIRATION_SECONDS = 86400

async function validateToken(request: Request, env: Env, handlerName: string): Promise<{ valid: boolean; error?: Response }> {
  let authHeader = request.headers.get("Authorization")
  if (!authHeader) {
    const error = createResultError(handlerName, "Missing Authorization header")
    return {
      valid: false,
      error: new Response(JSON.stringify(error), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    }
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(env as unknown as Record<string, string | undefined>)
  if (!saltResult.success) {
    return {
      valid: false,
      error: new Response(JSON.stringify(saltResult), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    }
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError(handlerName, "Invalid token")
    return {
      valid: false,
      error: new Response(JSON.stringify(error), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    }
  }

  return { valid: true }
}

export async function kvListHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const tokenValidation = await validateToken(request, env, "kvListHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const url = new URL(request.url)
  const prefix = url.searchParams.get("prefix") || undefined
  const listResult = await env.KV.list({ prefix })
  const keys = listResult.keys.map(k => k.name)

  return new Response(JSON.stringify(keys), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export async function kvGetHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const tokenValidation = await validateToken(request, env, "kvGetHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const url = new URL(request.url)
  const prefix = apiBaseB2 + apiPathKv + "/"
  const key = url.pathname.slice(prefix.length)

  if (!key) {
    return new Response(JSON.stringify(createResultError("kvGetHandler", "Invalid key")), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const value = await env.KV.get(key)

  return new Response(value ?? "null", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}

export async function kvPostHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const tokenValidation = await validateToken(request, env, "kvPostHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const url = new URL(request.url)
  const prefix = apiBaseB2 + apiPathKv + "/"
  const key = url.pathname.slice(prefix.length)

  if (!key) {
    return new Response(JSON.stringify(createResultError("kvPostHandler", "Invalid key")), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const expirationSecondsHeader = request.headers.get("X-Expiration-Seconds")
  const expirationSeconds = expirationSecondsHeader
    ? Number.parseInt(expirationSecondsHeader, 10)
    : KV_DEFAULT_EXPIRATION_SECONDS

  const body = await request.text()

  await env.KV.put(key, body, {
    expirationTtl: expirationSeconds,
  })

  return new Response("null", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export async function kvDeleteHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const tokenValidation = await validateToken(request, env, "kvDeleteHandler")
  if (!tokenValidation.valid) return tokenValidation.error!

  const url = new URL(request.url)
  const prefix = apiBaseB2 + apiPathKv + "/"
  const key = url.pathname.slice(prefix.length)

  if (!key) {
    return new Response(JSON.stringify(createResultError("kvDeleteHandler", "Invalid key")), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  await env.KV.delete(key)

  return new Response("null", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export async function kvHandler(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method

  if (pathname === apiBaseB2 + apiPathKvList && method === "GET") {
    return kvListHandler(request, env, ctx)
  }

  if (method === "GET") {
    return kvGetHandler(request, env, ctx)
  }

  if (method === "POST") {
    return kvPostHandler(request, env, ctx)
  }

  if (method === "DELETE") {
    return kvDeleteHandler(request, env, ctx)
  }

  return new Response(JSON.stringify(createResultError("kvHandler", "Method not allowed")), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  })
}

import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { apiPathKvList } from "@client/apiKvList"
