import { enableLogging } from "@/config/enableLogging"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

const log = true

/**
 * tutorial - https://www.backblaze.com/docs/cloud-storage-download-files-with-the-native-api
 * api reference - https://www.backblaze.com/apidocs/b2-download-file-by-id
 */
export async function b2ApiDownloadFile(
  baseUrl: string,
  authorizationToken: string,
  fileId: string,
): PromiseResult<Response> {
  const op = "b2DownloadFile"

  // Download the file using the downloadUrl from auth
  const url = `${baseUrl}/b2api/v4/b2_download_file_by_id?fileId=${fileId}`
  if (enableLogging) console.log(op, "url:", url)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authorizationToken,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(op, response.status, response.statusText, errorText)
    return createResultError(op, `Download failed: ${response.status}`, errorText)
  }

  return createResult(response)
}
