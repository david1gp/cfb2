import type { Env } from "@/env/Env"
import { getCorsHeaders } from "@/headers/getCorsHeaders"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"

const apiPathDownloadFile = "/download"
const apiPathIsOnline = "/is-online"

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname === "/") {
      return new Response("Access to root path is not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (request.method === "OPTIONS") {
      const corsHeaders = getCorsHeaders(env, request)
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    if (pathname === apiBaseB2 + apiPathUploadFile && request.method === "POST") {
      const responseData = {
        success: true,
        key: "test-file.txt",
        size: 1234,
        contentType: "text/plain",
      }
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    if (pathname === apiBaseB2 + apiPathGetUploadUrl && request.method === "GET") {
      const url = new URL(request.url)
      const key = url.searchParams.get("key") || "test-key.txt"
      const contentType = url.searchParams.get("contentType") || "text/plain"
      const sha1 = url.searchParams.get("sha1") || "da39a3ee5e6b4b0d3255bfef95601890afd80709"

      const responseData = {
        uploadUrl: "https://upload.example.com/" + key,
        authorizationToken: "test-token-" + Date.now(),
        key: key,
        contentType: contentType,
        sha1: sha1,
      }
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    if (pathname === apiBaseB2 + apiPathDownloadFile && request.method === "GET") {
      const url = new URL(request.url)
      const key = url.searchParams.get("key") || "test-key.txt"
      const responseData = {
        success: true,
        key: key,
        size: 1234,
        contentType: "text/plain",
      }
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    if (pathname === apiBaseB2 + apiPathIsOnline && request.method === "GET") {
      return new Response("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    return new Response("dummy-content", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  },
}
