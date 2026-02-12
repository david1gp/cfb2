import type { B2AuthModel } from "@/b2/model/B2AuthModel"
import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import dayjs from "dayjs"
import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

const b2UploadFields = {
  // bucketId: v.string(),
  uploadUrl: a.string(),
  authorizationToken: a.string(),
} as const

const b2ApiUploadUrlSchema = a.object(b2UploadFields)

const log = true

/**
 * tutorial - https://www.backblaze.com/docs/cloud-storage-upload-files-with-the-native-api
 * api reference - https://www.backblaze.com/apidocs/b2-get-upload-url
 */
export async function b2ApiGetUploadUrl(auth: B2AuthModel): PromiseResult<B2UrlModel> {
  const op = "b2GetUploadUrl"
  const getUploadResponse = await fetch(`${auth.apiUrl}/b2api/v4/b2_get_upload_url?bucketId=${auth.bucketId}`, {
    method: "GET",
    headers: {
      Authorization: auth.authorizationToken,
    },
  })

  const got = await getUploadResponse.text()
  if (log) console.log(op, "fetched:", got)
  const parsing = a.safeParse(a.pipe(a.string(), a.parseJson(), b2ApiUploadUrlSchema), got)
  if (log) console.log(op, "parsed:", parsing)
  if (!parsing.success) {
    return createResultError(op, a.summarize(parsing.issues), got)
  }
  const data = parsing.output
  // meta dates
  const now = dayjs()
  const expires = now.add(23, "hours").add(55, "minutes")
  const createdAt = now.toISOString()
  const expiresAt = expires.toISOString()
  // result
  const url: B2UrlModel = {
    uploadUrl: data.uploadUrl,
    authorizationToken: data.authorizationToken,
    createdAt,
    expiresAt,
  }
  return createResult(url)
}
