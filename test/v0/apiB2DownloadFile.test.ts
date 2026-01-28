import { apiB2DownloadFile } from "@client/apiB2DownloadFile"
import { describe, expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

describe("apiB2DownloadFile v0", () => {
  test("returns file content with cache headers", async () => {
    const result = await apiB2DownloadFile(workerUrl, "test-file.txt")

    expect(result.status).toBe(200)
    expect(result.headers.get("Cache-Control")).toBeTruthy()
    expect(result.headers.get("Content-Disposition")).toContain("test-file.txt")
  })
})
