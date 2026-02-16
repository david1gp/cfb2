import { expect, test } from "bun:test"
import { workerUrl } from "./workerUrl"

const BASE_URL = workerUrl

test("openapi endpoint returns JSON", async () => {
  const response = await fetch(BASE_URL + "/openapi")
  expect(response.status).toBe(200)
  expect(response.headers.get("Content-Type")).toBe("application/json")
  const json = await response.json() as { openapi: string; info: { title: string } }
  expect(json).toHaveProperty("openapi")
  expect(json).toHaveProperty("info")
  expect(json.info.title).toContain("cfb2")
})

test("swagger ui endpoint returns HTML at root", async () => {
  const response = await fetch(BASE_URL + "/")
  expect(response.status).toBe(200)
  expect(response.headers.get("Content-Type")?.toLowerCase()).toContain("text/html")
  const html = await response.text()
  expect(html).toContain("swagger-ui")
  expect(html).toContain("/doc")
})
