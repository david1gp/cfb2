import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadContent, type B2ApiUploadContentProps, type B2UploadFileType } from "@/b2/api/b2ApiUploadContent"
import type { B2AuthModel } from "@/b2/model/B2AuthModel"
import type { B2UrlModel } from "@/b2/model/B2UrlModel"
import { calculateSHA1, calculateSHA1FromBlob, calculateSHA1FromReadableStream } from "@/utils/sha1"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export type B2UploaderFn = (props: B2ApiUploadContentProps, body: any) => PromiseResult<B2UploadFileType>

export type B2StorageAuthLoader = () => PromiseResult<B2AuthModel>
export type B2StorageAuthSaver = (data: B2AuthModel) => void

export type B2StorageUrlLoader = () => PromiseResult<B2UrlModel>
export type B2StorageUrlSaver = (data: B2UrlModel) => void

const log = true

export async function b2UploaderCached(
  keyId: string,
  applicationKey: string,
  authLoader: B2StorageAuthLoader,
  authSaver: B2StorageAuthSaver,
  urlLoader: B2StorageUrlLoader,
  urlSaver: B2StorageUrlSaver,
): PromiseResult<B2UploaderFn> {
  const op = "b2Uploader"
  if (!keyId) {
    return createResultError(op, "! env.B2_KEY_ID")
  }
  if (!applicationKey) {
    return createResultError(op, "! env.B2_KEY")
  }

  // Initial auth and upload URL
  let auth: B2AuthModel
  let uploadUrl: B2UrlModel

  // Function to refresh auth
  async function refreshAuth(): PromiseResult<void> {
    if (log) console.log(op, "refreshAuth")
    const authResult = await b2ApiAuthorizeAccount(keyId, applicationKey)
    if (!authResult.success) return authResult
    auth = authResult.data

    // Save the auth data
    await authSaver(auth)

    return createResult(undefined)
  }

  // Function to refresh upload URL
  async function refreshUploadUrl(): PromiseResult<void> {
    if (log) console.log(op, "refreshUploadUrl")
    const uploadUrlResult = await b2ApiGetUploadUrl(auth)
    if (!uploadUrlResult.success) return uploadUrlResult

    if (log) console.log(op, "saving upload URL")
    uploadUrl = uploadUrlResult.data
    await urlSaver(uploadUrl)

    return createResult(undefined)
  }

  // Try to load existing auth data first
  const loadedAuth = await authLoader()

  if (loadedAuth.success) {
    auth = loadedAuth.data
    if (log) console.log(op, "authLoader succeeded, has data")

    // Check if the auth data is expired (23 hours or more)
    const createdAt = new Date(auth.createdAt).getTime()
    const now = Date.now()
    const authTimeDiffHours = (now - createdAt) / (1000 * 60 * 60)

    if (authTimeDiffHours >= 23) {
      if (log) console.log(op, "loaded auth data expired", authTimeDiffHours, "(hours diff)", "-> refetching auth")
      // Auth data is expired, refresh it
      const authRefreshResult = await refreshAuth()
      if (!authRefreshResult.success) return authRefreshResult
    } else {
      if (log) console.log(op, "loaded auth data still fresh", authTimeDiffHours, "(hours diff)")
    }
  } else {
    if (log) console.log(op, "authLoader failed -> refetching auth")
    // No existing auth data or failed to load, get fresh auth data
    const authRefreshResult = await refreshAuth()
    if (!authRefreshResult.success) return authRefreshResult
  }

  // Try to load existing upload URL data
  const loadedData = await urlLoader()

  if (loadedData.success) {
    uploadUrl = loadedData.data
    if (log) console.log(op, "urlLoader succeeded, has data")

    // Check if the data is expired (23 hours or more)
    const createdAt = new Date(uploadUrl.createdAt).getTime()
    const now = Date.now()
    const timeDiffHours = (now - createdAt) / (1000 * 60 * 60)

    if (timeDiffHours >= 23) {
      if (log) console.log(op, "loaded url data expired", timeDiffHours, "(hours diff)", "-> refetching url")
      // Data is expired, refresh it
      const refreshResult = await refreshUploadUrl()
      if (!refreshResult.success) return refreshResult
    } else {
      if (log) console.log(op, "loaded url data still fresh", timeDiffHours, "(hours diff)")
    }
  } else {
    if (log) console.log(op, "urlLoader failed -> refetching url")
    // No existing data or failed to load, get fresh data
    const refreshResult = await refreshUploadUrl()
    if (!refreshResult.success) return refreshResult
  }

  return createResult(async function upload(props: B2ApiUploadContentProps, body: any) {
    const op = "b2UploaderCached.upload"
    const now = Date.now()

    if (!auth) return createResultError(op, "!auth")
    const authCreatedAt = new Date(auth.createdAt).getTime()
    const authTimeDiffHours = (now - authCreatedAt) / (1000 * 60 * 60)
    if (authTimeDiffHours >= 23) {
      if (log)
        console.log(op, "auth data expired during upload", authTimeDiffHours, "(hours diff)", "-> refetching auth")
      const authRefreshResult = await refreshAuth()
      if (!authRefreshResult.success) return authRefreshResult
    }

    if (!uploadUrl) return createResultError(op, "!auth")
    const urlCreatedAt = new Date(uploadUrl.createdAt).getTime()
    const urlTimeDiffHours = (now - urlCreatedAt) / (1000 * 60 * 60)
    if (urlTimeDiffHours >= 23) {
      if (log) console.log(op, "url data expired during upload", urlTimeDiffHours, "(hours diff)", "-> refetching url")
      const refreshResult = await refreshUploadUrl()
      if (!refreshResult.success) return refreshResult
    }

    let contentLength: number
    let sha1: string
    let processedBody = body

    if (body instanceof Blob) {
      contentLength = body.size
      sha1 = await calculateSHA1FromBlob(body)
    } else if (typeof body === "string") {
      contentLength = body.length
      sha1 = await calculateSHA1(body)
    } else if (body instanceof ReadableStream) {
      const result = await calculateSHA1FromReadableStream(body)
      sha1 = result.sha1
      processedBody = result.uint8Array
      contentLength = result.uint8Array.length
    } else {
      const jsonString = JSON.stringify(body)
      contentLength = jsonString.length
      sha1 = await calculateSHA1(jsonString)
    }

    return b2ApiUploadContent(
      uploadUrl,
      {
        fullFileName: props.fullFileName,
        mimeType: props.mimeType,
        contentLength: props.contentLength ?? contentLength,
        sha1: props.sha1 ?? sha1,
      },
      processedBody,
    )
  })
}
