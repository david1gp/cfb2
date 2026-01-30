import { apiB2DownloadFile } from "@client/apiB2DownloadFile"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2DownloadFile", () => {
  test("returns 200 for real B2 file", async () => {
    const fullFileName = "home/2025-12-25_screenshot.jpg"
    const result = await apiB2DownloadFile(workerUrl, fullFileName)
    expect(result.status).toBe(200)
    expect(result.headers.get("Content-Type")).toBeTruthy()
    expect(result.headers.get("Cache-Control")).toBeTruthy()
  })

  test("returns 404 for non-existent file", async () => {
    const fullFileName = "home/non-existent-file-xyz123.jpg"
    const result = await apiB2DownloadFile(workerUrl, fullFileName)
    expect(result.status).toBe(404)
  })
})
