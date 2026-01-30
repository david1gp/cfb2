import * as a from "valibot"

export const b2GetUploadUrlResponseSchema = a.object({
  uploadUrl: a.string(),
  authorizationToken: a.string(),
})
