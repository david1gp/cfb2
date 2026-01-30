import type { Env } from "@/env/Env"
import { packageVersion } from "@/env/packageVersion"
import { downloadHandler } from "@/server/handlers/downloadHandler"
import { getUploadUrlHandler } from "@/server/handlers/getUploadUrlHandler"
import { kvHandler } from "@/server/handlers/kvHandler"
import { uploadFileHandler } from "@/server/handlers/uploadFileHandler"
import { isOnlineHandler } from "@/server/handlers_technical/isOnlineHandler"
import { notAllowedHandler } from "@/server/handlers_technical/notAllowedHandler"
import { rootHandler } from "@/server/handlers_technical/rootHandler"
import { versionHandler } from "@/server/handlers_technical/versionHandler"
import { getCorsHeaders } from "@/server/headers/getCorsHeaders"
import { setHeaderTimingSingleValue } from "@/server/headers/setHeaderTimingSingleValue"
import { apiPathDownloadFile } from "@client/apiB2DownloadFile"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathVersion } from "@client/apiB2GetVersion"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { kvListResponseSchema } from "@client/apiKvList"
import { b2GetUploadUrlResponseSchema } from "@client/b2GetUploadUrlResponseSchema"
import { b2UploadResultSchema } from "@client/b2UploadResultSchema"
import { Hono } from "hono"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", async (c, next) => {
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

app.get(
  "/",
  describeRoute({
    description: "Access denied for root path",
    responses: {
      403: {
        description: "Forbidden",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
    },
  }),
  rootHandler,
)

app.get(
  `${apiBaseB2}${apiPathVersion}`,
  describeRoute({
    description: "Get the current API version",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
    },
  }),
  versionHandler,
)

app.get(
  `${apiBaseB2}${apiPathIsOnline}`,
  describeRoute({
    description: "Health check endpoint",
    responses: {
      200: {
        description: "Service is healthy",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
    },
  }),
  isOnlineHandler,
)

app.get(
  `${apiBaseB2}${apiPathDownloadFile}/:key*`,
  describeRoute({
    description: "Download a file from Backblaze B2 storage",
    responses: {
      200: {
        description: "File content",
        content: {
          "application/octet-stream": { schema: resolver(a.string()) },
        },
      },
    },
  }),
  downloadHandler,
)

app.get(
  `${apiBaseB2}${apiPathGetUploadUrl}`,
  describeRoute({
    description: "Get B2 upload URL and authorization token",
    responses: {
      200: {
        description: "Upload URL and token",
        content: {
          "application/json": { schema: resolver(b2GetUploadUrlResponseSchema) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  getUploadUrlHandler,
)

app.post(
  `${apiBaseB2}${apiPathUploadFile}`,
  describeRoute({
    description: "Upload a file to Backblaze B2 via the worker",
    responses: {
      200: {
        description: "Upload result",
        content: {
          "application/json": { schema: resolver(b2UploadResultSchema) },
        },
      },
      400: {
        description: "Bad request - missing headers",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  uploadFileHandler,
)

app.get(
  `${apiBaseB2}${apiPathKv}`,
  describeRoute({
    description: "List all keys in Cloudflare KV namespace",
    responses: {
      200: {
        description: "List of keys",
        content: {
          "application/json": { schema: resolver(kvListResponseSchema) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  kvHandler,
)

app.get(
  `${apiBaseB2}${apiPathKv}/:key`,
  describeRoute({
    description: "Get value for a specific KV key",
    responses: {
      200: {
        description: "Key value",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  kvHandler,
)

app.post(
  `${apiBaseB2}${apiPathKv}/:key`,
  describeRoute({
    description: "Set value for a KV key with optional expiration",
    responses: {
      200: {
        description: "Success",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
      400: {
        description: "Bad request - invalid key",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  kvHandler,
)

app.delete(
  `${apiBaseB2}${apiPathKv}/:key`,
  describeRoute({
    description: "Delete a specific KV key",
    responses: {
      200: {
        description: "Success",
        content: {
          "text/plain": { schema: resolver(a.string()) },
        },
      },
      400: {
        description: "Bad request - invalid key",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": { schema: resolver(resultErrSchema) },
        },
      },
    },
  }),
  kvHandler,
)

app.notFound(notAllowedHandler)

const notAllowedMethods = ["PUT", "PATCH", "DELETE"]
for (const method of notAllowedMethods) {
  app.on(method, "/*", notAllowedHandler)
}

const openApiOptions = {
  documentation: {
    info: {
      title: "Adaptive CFB2 API",
      version: packageVersion,
      description:
        "A lightweight Cloudflare Worker that eliminates Backblaze B2 outbound bandwidth costs through the Bandwidth Alliance.\n\nProvides REST API for file upload/download and KV key-value storage.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local Development Server" },
      { url: "https://your-worker.your-subdomain.workers.dev", description: "Cloudflare Worker Production" },
    ],
  },
}

app.get("/openapi", openAPIRouteHandler(app, openApiOptions))

app.get("/doc", openAPIRouteHandler(app, openApiOptions))

app.get("/ui", async (c) => {
  const uiHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adaptive CFB2 API - Swagger UI</title>

  <!-- Icons -->
  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/logo/logo-32.png">
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Crawlers -->
  <meta name="robots" content="index, follow" />
  <meta name="googlebot" content="index, follow" />

  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/doc",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ]
    });
  </script>
</body>
</html>`
  return c.html(uiHtml)
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const response = await app.fetch(request, env, ctx)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
