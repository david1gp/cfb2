export interface Env {
  B2_ACCOUNT: string
  B2_KEY: string
  TOKEN_SECRET: string

  B2_BUCKET_PUBLIC_BASE_URL: string
  CORS_ALLOW_ORIGIN?: string
  CORS_MAX_AGE?: string
  B2_BUCKET_ID: string
  B2_BUCKET_NAME: string
  B2_ENDPOINT: string
  UPLOAD_URL_EXPIRATION_MS: string
  HEADER_CACHE_CONTROL: string

  KV: KVNamespace
}
