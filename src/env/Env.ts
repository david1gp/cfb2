export interface Env {
  VERSION: string
  ENV_NAME: string
  TOKEN_SECRET: string
  // b2
  B2_ACCOUNT: string
  B2_KEY: string
  B2_BUCKET_ID: string
  B2_BUCKET_NAME: string
  B2_BUCKET_PUBLIC_BASE_URL: string
  // headers
  HEADER_CACHE_CONTROL?: string
  HEADER_CORS_ALLOW_ORIGIN?: string
  HEADER_CORS_MAX_AGE?: string
  // bindings
  KV: KVNamespace
}
