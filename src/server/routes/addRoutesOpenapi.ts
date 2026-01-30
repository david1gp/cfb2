import { packageVersion } from "@/env/packageVersion"
import type { HonoApp } from "@/utils/HonoApp"
import { openAPIRouteHandler } from "hono-openapi"

export function addRoutesOpenapi(app: HonoApp) {
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

  addRoutesOpenapiSwagger(app)
}

export function addRoutesOpenapiSwagger(app: HonoApp) {
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
}
