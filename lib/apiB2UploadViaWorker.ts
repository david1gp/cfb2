export const apiBaseB2 = "/api/b2"
export const apiPathUploadFile = "/upload"

export const uploadHeaderFields = {
  authorization: "Authorization",
  fileId: "File-Id",
  resourceId: "Resource-Id",
  displayName: "Display-Name",
  fileSize: "File-Size",
  contentType: "Content-Type",
  imageWidth: "Image-Width",
  imageHeight: "Image-Height",
  sha1: "SHA-1",
} as const

export interface B2UploadProps {
  displayName: string
  fileSize: number
  mimeType: string
  fileId: string
  sha1: string
}

export async function apiB2UploadViaWorker(
  token: string,
  p: B2UploadProps,
  file: any,
  baseUrl: string,
): Promise<string> {
  const headers: Record<string, string> = {
    [uploadHeaderFields.authorization]: token,
    [uploadHeaderFields.fileId]: p.fileId,
    [uploadHeaderFields.displayName]: p.displayName,
    [uploadHeaderFields.fileSize]: p.fileSize.toString(),
    [uploadHeaderFields.contentType]: p.mimeType,
    [uploadHeaderFields.sha1]: p.sha1,
  }

  const response = await fetch(baseUrl + apiBaseB2 + apiPathUploadFile, {
    method: "POST",
    headers,
    body: file,
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`)
  }
  return text
}
