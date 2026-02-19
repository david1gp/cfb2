import { packageVersion } from "@/env/packageVersion"
import type { HonoApp } from "@/utils/HonoApp"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

export function addRoutesOpenapi(app: HonoApp) {
  const openApiOptions = {
    documentation: {
      info: {
        title: "@adaptive-ds/cfb2 - Zero-Cost B2 Object Storage Cloudflare Proxy",
        version: packageVersion,
        description: `A clever Cloudflare Worker that eliminates Backblaze B2 outbound bandwidth costs through the Bandwidth Alliance.

* **Zero bandwidth costs** – leverage Cloudflare's Bandwidth Alliance with Backblaze B2 for free outbound traffic.
* **Lightning fast** – runs on Cloudflare's global edge network with automatic CDN capabilities.
* **Dead simple** – just point it at your B2 bucket and forget about expensive bandwidth bills.
* **Production ready** – handles CORS, proper headers, and multiple environments out of the box.

Stop paying for outbound bandwidth and start serving your media files smarter, not harder.

**Quick Links**

- code - [https://github.com/david1gp/cfb2](https://github.com/david1gp/cfb2)
- npm - [https://www.npmjs.com/package/@adaptive-ds/cfb2](https://www.npmjs.com/package/@adaptive-ds/cfb2)
- cloudflare bandwidth alliance - [https://www.cloudflare.com/bandwidth-alliance/](https://www.cloudflare.com/bandwidth-alliance/)
`,
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http" as const,
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }

  app.get(
    "/openapi",
    describeRoute({
      description: "Get OpenAPI specification",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "OpenAPI JSON specification",
          content: {
            "application/json": { schema: resolver(a.string()) },
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
    openAPIRouteHandler(app, openApiOptions),
  )

  addRoutesOpenapiSwagger(app)
}

export function addRoutesOpenapiSwagger(app: HonoApp) {
  app.get(
    "/",
    describeRoute({
      description: "Swagger UI documentation interface",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "Swagger UI HTML page",
          content: {
            "text/html": { schema: resolver(a.string()) },
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
    async (c) => {
      const uiHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adaptive CFB2 API - Swagger UI</title>

  <!-- Icons -->
  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
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
      url: "/openapi",
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
    },
  )
}
