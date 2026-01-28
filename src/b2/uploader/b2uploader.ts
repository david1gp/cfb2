import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadContent, type B2ApiUploadContentProps, type B2UploadFileType } from "@/b2/api/b2ApiUploadContent"
import type { B2AuthModel } from "@/b2/model/B2AuthModel"
import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export type B2UploaderFn = (props: B2ApiUploadContentProps, body: any) => PromiseResult<B2UploadFileType>

export async function b2Uploader(keyId: string, applicationKey: string): PromiseResult<B2UploaderFn> {
  const op = "b2Uploader"
  if (!keyId) {
    return createResultError(op, "! env.B2_KEY_ID")
  }
  if (!applicationKey) {
    return createResultError(op, "! env.B2_KEY")
  }
  // Initial auth and upload URL
  let auth: B2AuthModel
  let uploadUrlData: B2UrlModel
  let lastRefreshTime = Date.now()

  // Function to refresh auth and upload URL
  const refreshAuthAndUrl = async (): PromiseResult<void> => {
    const authResult = await b2ApiAuthorizeAccount(keyId, applicationKey)
    if (!authResult.success) return authResult
    auth = authResult.data

    const uploadUrlResult = await b2ApiGetUploadUrl(auth)
    if (!uploadUrlResult.success) return uploadUrlResult
    uploadUrlData = uploadUrlResult.data

    lastRefreshTime = Date.now()
    return createResult(undefined)
  }

  // Initial refresh
  const initialRefreshResult = await refreshAuthAndUrl()
  if (!initialRefreshResult.success) return initialRefreshResult

  return createResult(async function upload(props: B2ApiUploadContentProps, body: any) {
    const now = Date.now()
    const timeDiffHours = (now - lastRefreshTime) / (1000 * 60 * 60) // Convert to hours

    // Check if 23 hours or more have passed
    if (timeDiffHours >= 23) {
      // Refresh auth and URL
      const refreshResult = await refreshAuthAndUrl()
      if (!refreshResult.success) return refreshResult
    }

    return b2ApiUploadContent(uploadUrlData, props, body)
  })
}
