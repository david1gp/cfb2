# @adaptive-sm/cf-b2 - 🚀 Zero-Cost B2 Object Storage Cloudflare Proxy

A clever Cloudflare Worker that eliminates Backblaze B2 outbound bandwidth costs through the Bandwidth Alliance.

- **Zero bandwidth costs** – leverage Cloudflare's Bandwidth Alliance with Backblaze B2 for free outbound traffic.
- **Lightning fast** – runs on Cloudflare's global edge network with automatic CDN capabilities.
- **Dead simple** – just point it at your B2 bucket and forget about expensive bandwidth bills.
- **Production ready** – handles CORS, proper headers, and multiple environments out of the box.

Stop paying for outbound bandwidth and start serving your media files smarter, not harder.

Quick Links

- code - https://github.com/adaptive-shield-matrix/storage-proxy
- npm - https://www.npmjs.com/package/@adaptive-sm/storage-proxy
- cloudflare bandwidth alliance - https://www.cloudflare.com/bandwidth-alliance/

## Features

- Proxies requests to Backblaze B2 storage through Cloudflare Workers
- Eliminates outbound bandwidth costs via Bandwidth Alliance
- Full CORS support with configurable origins
- **Multi-project support** – deploy multiple environments for different use cases
- **Custom domain routing** – clean URLs that hide your raw storage infrastructure

## Architecture

The Worker acts as a transparent proxy between your users and Backblaze B2:

```
User Request → Custom Domain → Cloudflare Worker → Backblaze B2 → Cloudflare Worker → User Response
```

Since Cloudflare and Backblaze are Bandwidth Alliance partners, the data transfer between them is free, eliminating your outbound bandwidth costs.

### Multi-Project Architecture

Deploy multiple environments for different projects:

```
cdn.yourdomain.com     → Production Environment (media, assets)
dev-storage.yourdomain.com → Development Environment
```

Each environment can point to different B2 buckets with customized CORS and caching settings.

## Prerequisites

- Pnpm/Bun/Npm for package management
- Cloudflare account (for Workers deployment)
- Backblaze B2 bucket with public URL

## Local Development

1. Clone the repository.
2. Install dependencies:
   ```
   bun install
   ```

## Configuration

The Worker uses environment variables for configuration:

- `B2_BUCKET_PUBLIC_BASE_URL`: Your Backblaze B2 bucket public URL
- `HEADER_CORS_ALLOW_ORIGIN`: Comma-separated list of allowed origins (default: "*")
- `HEADER_CORS_MAX_AGE`: CORS max-age header value (default: "300")

## Deployment to Cloudflare Workers

1. **Login to Cloudflare**:

   ```
   wrangler login
   ```

2. **Configure Account ID** (if needed, add to `wrangler.jsonc`):

   ```
   wrangler whoami
   ```

   Then update `wrangler.jsonc` with `account_id = "your-account-id"`.

3. **Deploy Single Environment**:

   ```
   bun run deploy
   ```

4. **Deploy All Environments**:

   ```
   bun run ops/deploy.ts
   ```

   This will deploy all configured environments (production, staging, etc.).

5. **Monitor**:

   ```
   wrangler tail adaptive-storage-proxy
   ```

## Environment Setup

The project supports multiple environments through `wrangler.jsonc`. See [`wrangler.example.jsonc`](./wrangler.example.jsonc) for a comprehensive configuration example.

## Security Considerations

- Root path (`/`) access is blocked against crawlers and bots
- CORS is configurable per environment
- No sensitive data is logged or exposed
- Custom domains hide storage infrastructure details
- Environment isolation prevents cross-contamination

## License

MIT License - feel free to use this in your projects and save on bandwidth costs!
