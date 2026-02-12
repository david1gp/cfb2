import { serverPort } from "@/utils/serverPort"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { afterAll, beforeAll } from "bun:test"
import { spawn, type ChildProcess } from "node:child_process"

const BASE_URL = `http://localhost:${serverPort}`
const HEALTH_URL = BASE_URL + apiPathIsOnline
const HEALTH_EXPECTED = "OK"

let wranglerProcess: ChildProcess | null = null
let didStartServer = false

async function isWranglerRunning(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1500) })
    if (!response.ok) return false

    const text = await response.text()
    return text.trim() === HEALTH_EXPECTED
  } catch {
    return false
  }
}

beforeAll(async () => {
  console.log("Checking if Wrangler dev server is already running...")

  if (await isWranglerRunning()) {
    console.log(`Wrangler already running at ${BASE_URL} (health check passed) → skipping start`)
    process.env.WORKER_URL = BASE_URL
    return
  }

  console.log("No running server detected → starting Wrangler dev...")

  const args = "dev --config ./wrangler.jsonc".split(" ")
  wranglerProcess = spawn("wrangler", args, {
    stdio: "inherit",
    shell: true,
  })

  didStartServer = true

  const startTime = Date.now()
  while (Date.now() - startTime < 30000) {
    if (await isWranglerRunning()) {
      console.log(`Wrangler dev server ready at ${BASE_URL} ✓`)
      process.env.WORKER_URL = BASE_URL
      return
    }
    await Bun.sleep(400)
  }

  throw new Error("Wrangler failed to become healthy within 30 seconds")
})

afterAll(async () => {
  if (!didStartServer) {
    console.log("We did not start the server → skipping shutdown")
    return
  }

  console.log("Shutting down Wrangler dev server...")

  if (wranglerProcess && !wranglerProcess.killed) {
    wranglerProcess.kill("SIGTERM")

    await new Promise<void>((resolve) => {
      wranglerProcess?.once("exit", () => resolve())
      setTimeout(resolve, 5000)
    })

    console.log("Wrangler shutdown complete.")
  }
})
