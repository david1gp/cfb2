
export async function apiB2DownloadFile(baseUrl: string, fullFileName: string): Promise<Response> {
  const op = "apiB2DownloadFile"

  if (!baseUrl) {
    throw new Error(op + ": " + "baseUrl is required")
  }

  const url = new URL(fullFileName, baseUrl)

  return fetch(url.toString(), {
    method: "GET",
  })
}
