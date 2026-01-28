import type { Env } from "@/types"
import { S3mini } from "s3mini"

let s3ClientInstance: S3mini | null = null

export function getS3Client(env: Env): S3mini {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3mini({
      accessKeyId: env.B2_ACCOUNT,
      secretAccessKey: env.B2_KEY,
      endpoint: env.B2_ENDPOINT,
      region: "eu-central-003",
    })
  }
  return s3ClientInstance
}
