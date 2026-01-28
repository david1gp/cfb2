import { object, string } from "valibot"

export const uploadPathQuerySchema = object({
  key: string(),
  contentType: string(),
  sha1: string(),
})

export type UploadPathQuery = { key: string; contentType: string; sha1: string }

export const b2UploadUrlResponseSchema = object({
  bucketId: string(),
  uploadUrl: string(),
  authorizationToken: string(),
})

export type B2UploadUrlResponse = {
  bucketId: string
  uploadUrl: string
  authorizationToken: string
}

export const uploadPathResponseSchema = object({
  uploadUrl: string(),
  authorizationToken: string(),
  key: string(),
  contentType: string(),
  sha1: string(),
})

export type UploadPathResponse = {
  uploadUrl: string
  authorizationToken: string
  key: string
  contentType: string
  sha1: string
}

export const uploadRequestSchema = object({
  key: string(),
  contentType: string(),
  sha1: string(),
})

export type UploadRequest = {
  key: string
  contentType: string
  sha1: string
}
