import { type B2UploaderFn } from "@/b2/uploader/b2uploader"
import { b2UploaderCached } from "@/b2/uploader/b2UploaderCached"
import { envB2AccountResult } from "@/env/envB2AccountResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { type PromiseResult } from "~utils/result/Result"
import {
  b2createCacheFsAuthLoader,
  b2createCacheFsAuthSaver,
  b2createCacheFsUrlLoader,
  b2createCacheFsUrlSaver,
} from "./b2createCacheFs"

export async function b2UploaderFs(): PromiseResult<B2UploaderFn> {
  const op = "b2UploaderFs"

  const keyIdResult = envB2AccountResult()
  if (!keyIdResult.success) return keyIdResult
  const keyId = keyIdResult.data

  const keyResult = envB2KeyResult()
  if (!keyResult.success) return keyResult
  const applicationKey = keyResult.data

  const authCacheFile = "data/memo/b2_auth.json"
  const urlCacheFile = "data/memo/b2_upload_url.json"

  const authLoader = b2createCacheFsAuthLoader(authCacheFile)
  const authSaver = b2createCacheFsAuthSaver(authCacheFile)
  const loader = b2createCacheFsUrlLoader(urlCacheFile)
  const saver = b2createCacheFsUrlSaver(urlCacheFile)

  return b2UploaderCached(keyId, applicationKey, authLoader, authSaver, loader, saver)
}
