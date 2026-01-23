import { b2AuthSchema, type B2AuthModel } from "@/b2/model/B2AuthModel"
import { b2UrlSchema, type B2UrlModel } from "@/b2/model/B2UrlModel"
import type {
  B2StorageAuthLoader,
  B2StorageAuthSaver,
  B2StorageUrlLoader,
  B2StorageUrlSaver,
} from "@/b2/uploader/b2UploaderCached"
import * as Bun from "bun"
import * as a from "valibot"
import { createResult, createResultError } from "~utils/result/Result"

export function b2createCacheFsAuthLoader(cacheFilePath: string): B2StorageAuthLoader {
  return async () => {
    const op = "b2createCacheFsAuthLoader"
    try {
      const file = Bun.file(cacheFilePath)
      const exists = await file.exists()
      if (!exists) {
        return createResultError(op, "File does not exist", cacheFilePath)
      }
      const content = await file.text()
      const parsed = a.safeParse(a.pipe(a.string(), a.parseJson(), b2AuthSchema), content)
      if (!parsed.success) {
        return createResultError(op, a.summarize(parsed.issues), content)
      }
      return createResult(parsed.output)
    } catch (error) {
      return createResultError(op, `Error loading file: ${error}`, cacheFilePath)
    }
  }
}

export function b2createCacheFsAuthSaver(cacheFilePath: string): B2StorageAuthSaver {
  return async (data: B2AuthModel) => {
    try {
      const content = JSON.stringify(data, null, 2)
      await Bun.write(cacheFilePath, content)
    } catch (error) {
      throw new Error(`Error saving file: ${error}`)
    }
  }
}

export function b2createCacheFsUrlLoader(cacheFilePath: string): B2StorageUrlLoader {
  return async () => {
    // const filePath = "data/memo/generate_image_upload_url.json"
    const op = "loadB2UploadUrl"
    try {
      const file = Bun.file(cacheFilePath)
      const exists = await file.exists()
      if (!exists) {
        return createResultError(op, "File does not exist", cacheFilePath)
      }
      const content = await file.text()
      const parsed = a.safeParse(a.pipe(a.string(), a.parseJson(), b2UrlSchema), content)
      if (!parsed.success) {
        return createResultError(op, a.summarize(parsed.issues), content)
      }
      return createResult(parsed.output)
    } catch (error) {
      return createResultError(op, `Error loading file: ${error}`, cacheFilePath)
    }
  }
}

export function b2createCacheFsUrlSaver(cacheFilePath: string): B2StorageUrlSaver {
  return async (data: B2UrlModel) => {
    try {
      const content = JSON.stringify(data, null, 2)
      await Bun.write(cacheFilePath, content)
    } catch (error) {
      throw new Error(`Error saving file: ${error}`)
    }
  }
}
