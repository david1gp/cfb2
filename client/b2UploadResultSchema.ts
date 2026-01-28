import * as a from "valibot"

export type B2UploadResult = a.InferOutput<typeof b2UploadResultSchema>

export const b2UploadResultSchema = a.object({
  success: a.literal(true),
  key: a.string(),
  size: a.number(),
  contentType: a.string(),
})
