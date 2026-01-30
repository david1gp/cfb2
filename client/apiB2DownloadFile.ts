
export const apiPathDownloadFile = ""

export async function apiB2DownloadFile(baseUrl: string, fullFileName: string): Promise<Response> {
  const op = "apiB2DownloadFile"

  if (!baseUrl) {
    throw new Error(op + ": " + "baseUrl is required")
  }

  const url = new URL("/b2/" + fullFileName, baseUrl)

  return fetch(url.toString(), {
    method: "GET",
  })
}
