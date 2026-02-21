export interface Env {
  ENV_NAME: string
  // auth/jwt
  TOKEN_SECRET: string
  // b2
  B2_KEY_ID: string
  B2_KEY: string
  B2_BUCKET_ID: string
  B2_BUCKET_NAME: string
  B2_BUCKET_PUBLIC_BASE_URL: string
  // injected
  VERSION: string
  // headers
  HEADER_CACHE_CONTROL?: string
  HEADER_CORS_ALLOW_ORIGIN?: string
  HEADER_CORS_MAX_AGE?: string
  // bindings
  cfb2: KVNamespace
}
