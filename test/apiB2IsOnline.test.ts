import { apiB2IsOnline } from "../client/apiB2IsOnline.js"
import { expect, test } from "bun:test"
import { workerUrl } from "./workerUrl.js"

test("apiB2IsOnline", async () => {
  const result = await apiB2IsOnline(workerUrl)
  if (!result.success) console.log(result)
  expect(result.success).toBe(true)
  if (!result.success) return
  expect(result.data).toBe(true)
})
