import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import { enableLogging } from "@/config/enableLogging"
import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export type B2UploadFileType = a.InferOutput<typeof b2UploadFileSchema>

export const b2UploadFileSchema = a.object({
  fileId: a.string(),
  bucketId: a.string(),
  accountId: a.string(),
  action: a.string(),
  uploadTimestamp: a.number(),
})

const log = true

export type B2ApiUploadContentProps = {
  fullFileName: string
  mimeType: string
  contentLength: number
  sha1: string
}

/**
 * tutorial - https://www.backblaze.com/docs/cloud-storage-upload-files-with-the-native-api
 * api reference - https://www.backblaze.com/apidocs/b2-upload-file
 */
export async function b2ApiUploadContent(
  uploadUrlData: B2UrlModel,
  info: B2ApiUploadContentProps,
  body: any,
): PromiseResult<B2UploadFileType> {
  const op = "b2UploadContent"

  const url = uploadUrlData.uploadUrl
  if (enableLogging) console.log(op, "url:", url)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(info.fullFileName),
      "Content-Type": info.mimeType,
      "Content-Length": info.contentLength.toString(),
      "X-Bz-Content-Sha1": info.sha1,
    },
    body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(op, response.status, response.statusText, errorText)
    return createResultError(op, `Upload failed: ${response.status}`, errorText)
  }

  const responseText = await response.text()
  if (enableLogging) console.log(op, "uploaded:", responseText)
  const schema = a.pipe(a.string(), a.parseJson(), b2UploadFileSchema)
  const parsing = a.safeParse(schema, responseText)
  if (enableLogging) console.log(op, "parsed:", parsing)

  if (!parsing.success) {
    return createResultError(op, a.summarize(parsing.issues), responseText)
  }

  return createResult(parsing.output)
}
