import type { Env } from "@/types"
import { S3mini } from "s3mini"

let s3ClientInstance: S3mini | null = null

export function getS3Client(env: Env): S3mini {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3mini({
      accessKeyId: env.PEER_ACCOUNT,
      secretAccessKey: env.PEER_KEY,
      endpoint: env.PEER_ENDPOINT,
      region: "eu-central-003",
    })
  }
  return s3ClientInstance
}
