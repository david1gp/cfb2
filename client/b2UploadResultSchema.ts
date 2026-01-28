import * as a from "valibot"

export type B2UploadResult = a.InferOutput<typeof b2UploadResultSchema>

export const b2UploadResultSchema = a.object({
  fileId: a.string(),
  uploadTimestamp: a.number(),
})
