import { apiB2GetVersion } from "@client/apiB2GetVersion"
import { expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

test("apiB2GetVersion", async () => {
  const result = await apiB2GetVersion(workerUrl)
  if (!result.success) console.log(result)
  expect(result.success).toBe(true)
  if (!result.success) {
    expect(result.errorMessage).toBeDefined()
    return
  }
  expect(result.data).toBeString()
  expect(result.data.length).toBeGreaterThanOrEqual(4)
})
