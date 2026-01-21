export interface Env {
  PUBLIC_BUCKET_BASE_URL: string
  CORS_ALLOW_ORIGIN?: string
  CORS_MAX_AGE?: string
  PEER_ACCOUNT: string
  PEER_KEY: string
  PEER_BUCKET_ID: string
  PEER_BUCKET_NAME: string
  PEER_ENDPOINT: string
  UPLOAD_URL_EXPIRATION_MS: string
  UPLOAD_MAX_FILE_SIZE_MB: string
  HEADER_CACHE_CONTROL: string
}

export interface ListObject {
  Key: string
  Size: number
  LastModified: Date
  ETag: string
  StorageClass: string
}
