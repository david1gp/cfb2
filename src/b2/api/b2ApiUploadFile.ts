import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import type { B2ApiUploadFileProps } from "@client/B2ApiUploadFileProps"
import { enableLogging } from "@/config/enableLogging"
import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export type B2UploadFileType = a.InferOutput<typeof b2UploadFileSchema>

export const b2UploadFileSchema = a.object({
  fileId: a.string(),
  // bucketId: a.string(),
  // accountId: a.string(),
  // action: a.string(),
  uploadTimestamp: a.number(),
})

const log = true

/**
 * tutorial - https://www.backblaze.com/docs/cloud-storage-upload-files-with-the-native-api
 * api reference - https://www.backblaze.com/apidocs/b2-upload-file
 */
export async function b2ApiUploadFile(
  uploadUrlData: B2UrlModel,
  info: B2ApiUploadFileProps,
  body: any,
): PromiseResult<B2UploadFileType> {
  const op = "b2ApiUploadFile"
  if (enableLogging) console.log(">>>", op, "START")
  if (enableLogging) console.log(op, "fullFileName:", info.fullFileName)
  if (enableLogging) console.log(op, "mimeType:", info.mimeType)
  if (enableLogging) console.log(op, "contentLength:", info.contentLength)
  if (enableLogging) console.log(op, "sha1:", info.sha1)

  // const url = `${auth.apiUrl}/b2api/v2/b2_get_upload_url` + uploadFileUrl
  const url = uploadUrlData.uploadUrl
  if (enableLogging) console.log(op, "url:", url)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(info.fullFileName),
      "Content-Type": info.mimeType,
      "Content-Length": info.contentLength,
      "X-Bz-Content-Sha1": info.sha1,
    },
  })

  if (enableLogging) console.log(op, "response status:", response.status, response.statusText)
  if (!response.ok) {
    const errorText = await response.text()
    console.error(op, "error response:", response.status, response.statusText, errorText)
    return createResultError(op, `Upload failed: ${response.status}`, errorText)
  }

  const responseText = await response.text()
  if (enableLogging) console.log(op, "uploaded response:", responseText)
  const schema = a.pipe(a.string(), a.parseJson(), b2UploadFileSchema)
  const parsing = a.safeParse(schema, responseText)
  if (enableLogging) console.log(op, "parsed:", parsing)

  if (!parsing.success) {
    console.error(op, "parse error:", a.summarize(parsing.issues))
    return createResultError(op, a.summarize(parsing.issues), responseText)
  }

  if (enableLogging) console.log(op, "SUCCESS")
  return createResult(parsing.output)
}
